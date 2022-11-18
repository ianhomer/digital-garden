import { Link, LinkType, Meta, Things, ThingType } from "@garden/types";
import fs from "fs";
import os from "os";
import { join } from "path";

import { unique } from "./common";
import { FileGardenRepository } from "./file-garden-repository";
import { linkResolver } from "./link";
import { logger } from "./logger";
import { toMultipleThingMeta } from "./markdown";
import { naturalAliases } from "./nlp";
import { FileThing } from "./thing";

const gardenMetaFile = ".garden-meta.json";

export interface Garden {
  config: GardenConfig;
  thing: (filename: string) => FileThing;
  findBackLinks: (things: Things, name: string) => Array<Link>;
  getMetaFilename: () => string;
  meta: () => Promise<Things>;
  load: () => Promise<Things>;
  refresh: (filenameToPatch?: string) => Promise<Things>;
}

export interface GardenConfig {
  allowGlobalMeta: boolean;
  directory: string;
  content: { [key: string]: string };
  excludedDirectories: string[];
  gardens: { [key: string]: string };
  hasMultiple: boolean;
  liveMeta: boolean;
  verbose: boolean;
}

type GardenOptions = Partial<GardenConfig>;

export interface MetaMap {
  [key: string]: Meta;
}

const defaultConfig = {
  allowGlobalMeta: true,
  content: {},
  directory: ".gardens",
  excludedDirectories: ["node_modules", "digital-garden"],
  hasMultiple: false,
  gardens: {},
  liveMeta: false,
  verbose: true,
};

const loadThing = (config: GardenConfig, filename: string): FileThing => {
  const matchName = /([^/]*).md$/.exec(filename);
  const name = matchName ? matchName[1] : filename;
  const matchBaseName = /(.*).md$/.exec(filename);
  const baseName = matchBaseName ? matchBaseName[1] : filename;
  return {
    filename,
    name,
    content: async (): Promise<string> =>
      baseName in config.content
        ? config.content[baseName]
        : await new FileGardenRepository(config.directory)
            .load(name)
            .then((item) => item.content),
  };
};

const fileThingToMultipleThingMeta = async (fileThing: FileThing) => {
  const extra: { value?: number } = {};
  ["archive", "not", "stop"].forEach((ignore) => {
    if (fileThing.filename.includes(`/${ignore}/`)) {
      extra.value = 0;
    }
  });
  return {
    thingName: fileThing.name,
    thingMeta: await toMultipleThingMeta(fileThing.content),
    extra,
  };
};

export const loadFileThingIntoMetaMap = async (
  metaMap: MetaMap,
  fileThing: FileThing
) => {
  const { thingName, thingMeta, extra } = await fileThingToMultipleThingMeta(
    fileThing
  );

  thingMeta.forEach((singleThingMeta) => {
    const singleThingName =
      singleThingMeta.type == ThingType.Child
        ? thingName + "#" + linkResolver(singleThingMeta.title)
        : thingName;
    metaMap[singleThingName] = {
      ...{
        title: singleThingMeta.title,
        type: singleThingMeta.type,
        links: singleThingMeta.links.map((link) => {
          if (link.name.startsWith("#")) {
            return {
              name: thingName + link.name,
              type: link.type,
            };
          }
          return link;
        }),
      },
      ...extra,
    };
  });
};

const generateMeta = async (
  config: GardenConfig,
  metaMap: MetaMap = {},
  filenameToPatch?: string
): Promise<{ [key: string]: Meta }> => {
  if (Object.keys(config.content).length > 0) {
    for (const key in config.content) {
      await loadFileThingIntoMetaMap(metaMap, loadThing(config, `${key}.md`));
    }
  } else {
    const populateMetaFromFilename = async (filename: string) => {
      const fileThing = loadThing(config, filename);
      await loadFileThingIntoMetaMap(metaMap, fileThing);
    };

    if (filenameToPatch) {
      console.log(`Patching meta with : ${filenameToPatch}`);
      populateMetaFromFilename(filenameToPatch);
    } else {
      const gardenRepository = new FileGardenRepository(
        config.directory,
        config.excludedDirectories
      );
      for await (const itemReference of gardenRepository.findAll()) {
        await populateMetaFromFilename(gardenRepository.toUri(itemReference));
      }
    }
  }

  findWantedThings(metaMap).forEach((title) => {
    const links = naturalAliases(title);
    if (links.length > 0) {
      metaMap[title] = {
        title,
        type: ThingType.NaturallyWanted,
        links: links.map(
          (name: string): Link => ({
            name: linkResolver(name),
            type: LinkType.NaturalAlias,
          })
        ),
      };
    }
  });

  const unwantedLinks = findUnwantedLinks(metaMap);
  const transformedMeta: MetaMap = {};

  Object.keys(metaMap)
    .filter((key) => !unwantedLinks.includes(key))
    .map((key) => {
      const thing = metaMap[key];
      transformedMeta[key] = {
        title: thing.title,
        type: thing.type,
        value: thing.value,
        links: thing.links
          .filter((link) => !unwantedLinks.includes(link.name))
          .map((link) => {
            const transformedLink: Link = { name: link.name, type: link.type };
            if (thing?.value == 0 || metaMap[link.name]?.value == 0) {
              transformedLink.value = 0;
            }
            return transformedLink;
          }),
      };
    });

  return transformedMeta;
};

export const findLinksExcludingExplicit = (
  meta: MetaMap,
  explicitThingNames: string[],
  references: string[],
  filter: (link: Link) => boolean
) => {
  return Object.keys(meta)
    .map((key) => {
      return meta[key].links
        .filter(
          (link) =>
            filter(link) &&
            !explicitThingNames.includes(link.name) &&
            !references.includes(link.name)
        )
        .map((link) => link.name);
    })
    .flat();
};

// Unwanted are unique natural links to non-existent things
export const findUnwantedLinks = (meta: MetaMap) => {
  const explicitThingNames = Object.entries(meta)
    .filter(([, value]) => {
      if (value.type !== ThingType.NaturallyWanted) {
        return true;
      }
      return value.links.find((link: Link) => {
        const thing = meta[link.name];
        if (!thing) {
          return false;
        }
        return !thing.type || thing.type === ThingType.Wanted;
      });
    })
    .map((entry) => entry[0]);

  const unreferencedExplicitLinks = explicitThingNames
    .map((key) => {
      return meta[key].links
        .filter((link) => !link.type && !explicitThingNames.includes(link.name))
        .map((link) => link.name);
    })
    .flat();

  const wantedNaturalLinks = findLinksExcludingExplicit(
    meta,
    explicitThingNames,
    unreferencedExplicitLinks,
    (link) =>
      link.type === LinkType.NaturalTo || link.type === LinkType.NaturalAlias
  );

  const wantedNaturalToLinks = findLinksExcludingExplicit(
    meta,
    explicitThingNames,
    unreferencedExplicitLinks,
    (link) => link.type === LinkType.NaturalTo
  );

  // Natural links that referenced multiple times, i.e. keepers
  const duplicateWantedNaturalToLinks = wantedNaturalLinks.reduce(
    (accumulator: string[], linkName, i, array: string[]) => {
      if (array.indexOf(linkName) !== i && accumulator.indexOf(linkName) < 0)
        accumulator.push(linkName);
      return accumulator;
    },
    []
  );

  return wantedNaturalLinks.filter(
    (name) => !duplicateWantedNaturalToLinks.includes(name)
  );
};

const globalMetaDirectory = join(os.homedir(), ".local/garden/meta");

const getMetaFilename = (config: GardenConfig) => {
  if (config.allowGlobalMeta && fs.existsSync(globalMetaDirectory)) {
    return join(
      globalMetaDirectory,
      config.directory.replace(/[\\/\\.]/g, "-") + "-meta.json"
    );
  } else {
    return join(config.directory, gardenMetaFile);
  }
};

const refresh = async (config: GardenConfig, filenameToPatch?: string) => {
  const meta = filenameToPatch
    ? await generateMeta(config, await loadMeta(config), filenameToPatch)
    : await generateMeta(config);
  const fullGardenMetaFile = getMetaFilename(config);
  logger.info(
    `Refreshing ${fullGardenMetaFile} : ${Object.keys(meta).length} things`
  );
  fs.writeFileSync(fullGardenMetaFile, JSON.stringify(meta));
  return meta;
};

async function loadMeta(config: GardenConfig) {
  if (config.liveMeta) {
    return await generateMeta(config);
  }
  const metaFilename = getMetaFilename(config);
  if (fs.existsSync(metaFilename)) {
    const content = fs.readFileSync(join(getMetaFilename(config)));
    return JSON.parse(content.toString("utf8"));
  } else {
    logger.info(`Meta file ${metaFilename} does not exist`);
    return {};
  }
}

const findBackLinks = (things: Things, name: string) => {
  return Object.keys(things)
    .filter((fromName) => {
      return things[fromName].links.map((link) => link.name).includes(name);
    })
    .map((fromName) => ({ name: fromName, type: LinkType.From }));
};

export const findKnownThings = (things: Things) => {
  return Object.keys(
    Object.fromEntries(
      Object.entries(things).filter(([, thing]) => !thing.type)
    )
  );
};

export const findLinkedThings = (
  things: Things,
  filter = (link: Link) => !!link
) => {
  return Object.values(things)
    .map((thing) => thing.links.filter(filter).map((link: Link) => link.name))
    .flat()
    .filter(unique);
};

export const findWantedThings = (
  things: Things,
  filter = (link: Link) => !!link
) => {
  const knownThings = findKnownThings(things);
  return findLinkedThings(things, filter).filter(
    (name: string) => name.indexOf("#") < 0 && !knownThings.includes(name)
  );
};

export const toConfig = (options: GardenOptions): GardenConfig => ({
  ...defaultConfig,
  ...options,
});

export const createGarden = (options: GardenOptions): Garden => {
  const config = toConfig(options);

  return {
    config,
    meta: async () => await generateMeta(config),
    refresh: async (filenameToPatch?: string) =>
      await refresh(config, filenameToPatch),
    load: async () => await loadMeta(config),
    findBackLinks: (things: Things, name: string) => {
      return findBackLinks(things, name);
    },
    getMetaFilename: () => getMetaFilename(config),
    thing: (filename: string) => {
      return loadThing(config, filename);
    },
  };
};
