import { linkResolver } from "@garden/core";
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
import { FileGardenRepository } from "./file-garden-repository";
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
  scripts: { [key: string]: string }[];
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
  scripts: [],
};

const loadThing = (
  repository: GardenRepository,
  filename: string
): FileThing => {
  const itemReference = repository.toItemReference(filename);
  return {
    filename,
    name: itemReference.name,
    value: repository.toValue(itemReference),
    content: async (): Promise<string> =>
      repository
        .load(itemReference.name)
        .then((item) => item.content)
        .catch((error) => {
          console.error(error);
          return error;
        }),
  };
};

const thingToMultipleThingMeta = async (thing: Thing) => {
  const extra: { value?: number } = {
    value: thing.value,
  };
  return {
    thingName: thing.name,
    thingMeta: await toMultipleThingMeta(thing.content),
    extra,
  };
};

export const loadThingIntoMetaMap = async (metaMap: MetaMap, thing: Thing) => {
  const { thingName, thingMeta, extra } = await thingToMultipleThingMeta(thing);

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
      await loadThingIntoMetaMap(metaMap, loadThing(repository, `${key}.md`));
    }
  } else {
    const populateMetaFromUri = async (uri: string) => {
      const thing = loadThing(repository, uri);
      await loadThingIntoMetaMap(metaMap, thing);
    };

    if (filenameToPatch) {
      console.log(`Patching meta with : ${filenameToPatch}`);
      await populateMetaFromUri(filenameToPatch);
    } else {
      for await (const itemReference of repository.findAll()) {
        await populateMetaFromUri(repository.toUri(itemReference));
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

  return reduceAliases(transformedMeta);
};

const reduceAliases = async (meta: { [key: string]: Meta }) => {
  const reducibleAliases: [string, string[]][] = Object.entries(meta)
    .filter(
      ([, value]) =>
        value.type == ThingType.NaturallyWanted &&
        value.links.length > 0 &&
        value.links.every(
          (link) => link.type == LinkType.NaturalAlias && link.name in meta
        )
    )
    .map(([key, value]) => [key, value.links.map((link) => link.name)]);
  const reducibleAliasLookup: { [key: string]: string } = Object.fromEntries(
    reducibleAliases
      .map(([key, aliases]) => aliases.map((alias) => [key, alias]))
      .flat()
  );
  const reducibleAliasNames = reducibleAliases.map(([key]) => key);
  return Object.fromEntries(
    Object.entries(meta)
      .filter(([key]) => reducibleAliasNames.indexOf(key) == -1)
      .map(([key, { title, type, aliases, links, value }]) => [
        key,
        {
          title,
          aliases: [
            ...(aliases ?? []),
            ...reducibleAliases
              .filter(([, aliases]) => aliases.indexOf(key) > -1)
              .map(([aliasKey]) => aliasKey),
          ],
          links: links.map(({ name, type, value }) => ({
            name:
              name in reducibleAliasLookup ? reducibleAliasLookup[name] : name,
            type,
            value,
          })),
          type,
          value,
        },
      ])
  );
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
  const meta =
    filenameToPatch && filenameToPatch.endsWith(".md")
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
  return new BaseGardenRepository(config.content);
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
    thing: (uri: string) => {
      return loadThing(repository, uri);
    },
  };
};
