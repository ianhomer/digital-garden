import {
  GardenRepository,
  Link,
  LinkType,
  Meta,
  Things,
  ThingType,
} from "@garden/types";
import fs from "fs";
import os from "os";
import { join } from "path";

import { BaseGardenRepository } from "./base-garden-repository";
import { unique } from "./common";
import {
  FileGardenRepository,
  FileItemReference,
} from "./file-garden-repository";
import { linkResolver } from "./link";
import { logger } from "./logger";
import { toMultipleThingMeta } from "./markdown";
import { naturalAliases } from "./nlp";
import { FileThing, Thing } from "./thing";

const gardenMetaFile = ".garden-meta.json";

export interface Garden {
  repository: GardenRepository;
  config: GardenConfig;
  thing: (filename: string) => FileThing;
  findBackLinks: (things: Things, name: string) => Array<Link>;
  getMetaFilename: () => string;
  meta: () => Promise<Things>;
  load: () => Promise<Things>;
  refresh: (filenameToPatch?: string) => Promise<Things>;
}

export type GardenRepositoryType = "file" | "inmemory";

export interface GardenRepositoryConfig {
  type: GardenRepositoryType;
  directory: string;
  excludedDirectories: string[];
}

export interface GardenConfig extends GardenRepositoryConfig {
  allowGlobalMeta: boolean;
  content: { [key: string]: string };
  gardens: { [key: string]: string };
  hasMultiple: boolean;
  liveMeta: boolean;
  verbose: boolean;
}

export type GardenOptions = Partial<GardenConfig>;

export interface MetaMap {
  [key: string]: Meta;
}

const defaultConfig: GardenConfig = {
  allowGlobalMeta: true,
  type: "file",
  directory: ".gardens",
  excludedDirectories: ["node_modules", "digital-garden"],
  content: {},
  hasMultiple: false,
  gardens: {},
  liveMeta: false,
  verbose: true,
};

const loadThing = (
  gardenRepository: GardenRepository,
  config: GardenConfig,
  filename: string
): FileThing => {
  const matchName = /([^/]*).md$/.exec(filename);
  const name = matchName ? matchName[1] : filename;
  const matchBaseName = /(.*).md$/.exec(filename);
  const baseName = matchBaseName ? matchBaseName[1] : filename;

  const itemReference = new FileItemReference(name, filename);
  return {
    filename,
    name,
    value: gardenRepository.toValue(itemReference),
    content: async (): Promise<string> =>
      baseName in config.content
        ? config.content[baseName]
        : await gardenRepository.load(name).then((item) => item.content),
  };
};

const fileThingToMultipleThingMeta = async (thing: Thing) => {
  const extra: { value?: number } = {
    value: thing.value,
  };
  return {
    thingName: thing.name,
    thingMeta: await toMultipleThingMeta(thing.content),
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
  repository: GardenRepository,
  config: GardenConfig,
  metaMap: MetaMap = {},
  filenameToPatch?: string
): Promise<{ [key: string]: Meta }> => {
  if (Object.keys(config.content).length > 0) {
    for (const key in config.content) {
      await loadFileThingIntoMetaMap(
        metaMap,
        loadThing(repository, config, `${key}.md`)
      );
    }
  } else {
    const populateMetaFromFilename = async (filename: string) => {
      const fileThing = loadThing(repository, config, filename);
      await loadFileThingIntoMetaMap(metaMap, fileThing);
    };

    if (filenameToPatch) {
      console.log(`Patching meta with : ${filenameToPatch}`);
      populateMetaFromFilename(filenameToPatch);
    } else {
      for await (const itemReference of repository.findAll()) {
        await populateMetaFromFilename(repository.toUri(itemReference));
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

const refresh = async (
  repository: GardenRepository,
  config: GardenConfig,
  filenameToPatch?: string
) => {
  const meta = filenameToPatch
    ? await generateMeta(
        repository,
        config,
        await loadMeta(repository, config),
        filenameToPatch
      )
    : await generateMeta(repository, config);
  const fullGardenMetaFile = getMetaFilename(config);
  logger.info(
    `Refreshing ${fullGardenMetaFile} : ${Object.keys(meta).length} things`
  );
  fs.writeFileSync(fullGardenMetaFile, JSON.stringify(meta));
  return meta;
};

async function loadMeta(repository: GardenRepository, config: GardenConfig) {
  if (config.liveMeta) {
    return await generateMeta(repository, config);
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

const toRepository = (config: GardenConfig): GardenRepository => {
  if (config.type == "file") {
    return new FileGardenRepository(
      config.directory,
      config.excludedDirectories
    );
  }
  return new BaseGardenRepository();
};

export const createGarden = (options: GardenOptions): Garden => {
  const config = toConfig(options);
  const repository = toRepository(config);

  return {
    config,
    repository,
    meta: async () => await generateMeta(repository, config),
    refresh: async (filenameToPatch?: string) =>
      await refresh(repository, config, filenameToPatch),
    load: async () => await loadMeta(repository, config),
    findBackLinks: (things: Things, name: string) => {
      return findBackLinks(things, name);
    },
    getMetaFilename: () => getMetaFilename(config),
    thing: (filename: string) => {
      return loadThing(repository, config, filename);
    },
  };
};
