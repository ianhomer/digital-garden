import { linkResolver, unique } from "@garden/core";
import { hash, ItemMeta, Items, ItemType, Link, LinkType } from "@garden/graph";
import { GardenRepository, Thing } from "@garden/types";
import fs from "fs";
import os from "os";
import { isAbsolute, join } from "path";

import { BaseGardenRepository } from "./base-garden-repository";
import { FileGardenRepository } from "./file-garden-repository";
import { justImplicitAliasLinks } from "./links";
import { logger } from "./logger";
import { toMultipleThingMeta } from "./markdown";
import { naturalAliases } from "./nlp";

const gardenMetaFile = ".garden-meta.json";

export interface Garden {
  repository: GardenRepository;
  config: GardenConfig;
  thing: (filename: string) => Thing;
  findBackLinks: (things: Items, name: string) => Array<Link>;
  getMetaFilename: () => string;
  meta: () => Promise<Items>;
  load: () => Promise<Items>;
  refresh: (filenameToPatch?: string) => Promise<Items>;
}

export type GardenRepositoryType = "file" | "inmemory";

export interface TagMatcher {
  include: string[];
  exclude: string[];
}

export interface BaseGardenRepositoryConfig {
  publish: TagMatcher;
}

export interface GardenRepositoryConfig extends BaseGardenRepositoryConfig {
  type: GardenRepositoryType;
  directory: string;
  excludedDirectories: string[];
}

export interface GardenConfig extends GardenRepositoryConfig {
  allowGlobalMeta: boolean;
  content: { [key: string]: string };
  defaultGardenDirectory: string;
  gardens: { [key: string]: string };
  hasMultiple: boolean;
  liveMeta: boolean;
  verbose: boolean;
  scripts: { [key: string]: string }[];
}

type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

export type GardenOptions = DeepPartial<GardenConfig>;

export const defaultConfig: GardenConfig = {
  allowGlobalMeta: true,
  type: "file",
  defaultGardenDirectory: ".",
  directory: ".gardens",
  excludedDirectories: ["node_modules", "digital-garden"],
  publish: {
    include: [],
    exclude: ["archive", "historical", "not"],
  },
  content: {},
  hasMultiple: false,
  gardens: {},
  liveMeta: false,
  verbose: true,
  scripts: [],
};

const loadThing = (repository: GardenRepository, filename: string): Thing => {
  const itemReference = repository.toItemReference(filename);
  return repository.loadThing(itemReference);
};

const thingToMultipleThingMeta = async (thing: Thing) => {
  const extra: { value?: number } = {
    value: thing.value,
  };
  return {
    thingName: thing.name,
    thingMeta: await toMultipleThingMeta(thing),
    extra,
  };
};

export const loadThingIntoMetaMap = async (metaMap: Items, thing: Thing) => {
  const { thingName, thingMeta, extra } = await thingToMultipleThingMeta(thing);

  thingMeta.forEach((singleThingMeta: ItemMeta) => {
    const singleThingName =
      singleThingMeta.type === ItemType.Child
        ? thingName + "#" + linkResolver(singleThingMeta.title)
        : thingName;

    const fullName =
      singleThingName +
      (singleThingName in metaMap &&
      metaMap[singleThingName].hash !== singleThingMeta.hash
        ? "+" + singleThingMeta.hash
        : "");

    metaMap[fullName] = {
      ...{
        title: singleThingMeta.title,
        hash: singleThingMeta.hash,
        type: singleThingMeta.type,
        aliases: singleThingMeta.aliases,
        value: singleThingMeta.value,
        links: singleThingMeta.links.map((link) => {
          if (link.name.startsWith("#")) {
            return {
              name: thingName + link.name,
              type: link.type,
              value: 1,
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
  metaMap: Items = {},
  filenameToPatch?: string,
): Promise<Items> => {
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
        hash: hash(title),
        type: ItemType.ImplicitlyWanted,
        aliases: [],
        value: 1,
        links: links.map(
          (name: string): Link => ({
            name: linkResolver(name),
            type: LinkType.ImplicitAlias,
            value: 1,
          }),
        ),
      };
    }
  });

  const unwantedLinks = findUnwantedLinks(metaMap);
  const transformedMeta: Items = {};

  Object.keys(metaMap)
    .filter((key) => !unwantedLinks.includes(key))
    .map((key) => {
      const thing = metaMap[key];
      transformedMeta[key] = {
        title: thing.title,
        hash: thing.hash,
        type: thing.type,
        value: thing.value,
        aliases: thing.aliases,
        links: thing.links
          .filter((link) => !unwantedLinks.includes(link.name))
          .map((link) => {
            const transformedLink: Link = {
              name: link.name,
              type: link.type,
              value: link.value,
            };
            if (thing.value === 0 || metaMap[link.name]?.value === 0) {
              transformedLink.value = 0;
            }
            return transformedLink;
          }),
      };
    });

  return sortMeta(reduceAliases(transformedMeta));
};

const sortMeta = async (meta: Items) => {
  const entries = Object.entries(meta);
  entries.sort(([key1], [key2]) => key1.localeCompare(key2));
  return Object.fromEntries(entries);
};

const reduceAliases = (meta: Items): Items => {
  const naturallyWantedAliases = findWantedThings(meta, justImplicitAliasLinks);
  const reducibleAliases: [string, string[]][] = Object.entries(meta)
    .filter(
      ([, value]) =>
        value.type === ItemType.ImplicitlyWanted &&
        value.links.length > 0 &&
        value.links.every(
          (link) =>
            link.type === LinkType.ImplicitAlias &&
            (link.name in meta ||
              naturallyWantedAliases.indexOf(link.name) > -1),
        ),
    )
    .map(([key, value]) => [key, value.links.map((link) => link.name)]);
  const reducibleAliasLookup: Map<string, string> = new Map(
    reducibleAliases
      .map(([key, aliases]) =>
        aliases.map((alias): [string, string] => [key, alias]),
      )
      .flat(),
  );
  const reducibleAliasNames = reducibleAliases.map(([key]) => key);
  return Object.fromEntries(
    Object.entries(meta)
      .filter(([key]) => reducibleAliasNames.indexOf(key) === -1)
      .map(([key, { title, hash, type, aliases, links, value }]) => [
        key,
        {
          title,
          hash,
          aliases: [
            ...(aliases ?? []),
            ...reducibleAliases
              .filter(([, aliases]) => aliases.indexOf(key) > -1)
              .map(([aliasKey]) => aliasKey),
          ],
          links: links.map(({ name, type, value }) => ({
            name: reducibleAliasLookup.has(name)
              ? (reducibleAliasLookup.get(name) ?? name)
              : name,
            type,
            value,
          })),
          type,
          value,
        },
      ]),
  );
};

export const findLinksExcludingExplicit = (
  meta: Items,
  explicitThingNames: string[],
  references: string[],
  filter: (link: Link) => boolean,
) => {
  return Object.keys(meta)
    .map((key) => {
      return meta[key].links
        .filter(
          (link) =>
            filter(link) &&
            !explicitThingNames.includes(link.name) &&
            !references.includes(link.name),
        )
        .map((link) => link.name);
    })
    .flat();
};

// Unwanted are unique natural links to non-existent things
export const findUnwantedLinks = (meta: Items) => {
  const explicitThingNames = Object.entries(meta)
    .filter(([, value]) => {
      if (value.type !== ItemType.ImplicitlyWanted) {
        return true;
      }
      return value.links.find((link: Link) => {
        const thing = meta[link.name];
        if (!thing) {
          return false;
        }
        return thing.type === ItemType.Item || thing.type === ItemType.Wanted;
      });
    })
    .map((entry) => entry[0]);

  const unreferencedExplicitLinks = explicitThingNames
    .map((key) => {
      return meta[key].links
        .filter(
          (link) =>
            link.type === LinkType.To &&
            !explicitThingNames.includes(link.name),
        )
        .map((link) => link.name);
    })
    .flat();

  const wantedNaturalLinks = findLinksExcludingExplicit(
    meta,
    explicitThingNames,
    unreferencedExplicitLinks,
    (link) =>
      link.type === LinkType.ImplicitTo || link.type === LinkType.ImplicitAlias,
  );

  // Natural links that referenced multiple times, i.e. keepers
  const duplicateWantedImplicitToLinks = wantedNaturalLinks.reduce(
    (accumulator: string[], linkName, i, array: string[]) => {
      if (array.indexOf(linkName) !== i && accumulator.indexOf(linkName) < 0)
        accumulator.push(linkName);
      return accumulator;
    },
    [],
  );

  return wantedNaturalLinks.filter(
    (name) => !duplicateWantedImplicitToLinks.includes(name),
  );
};

const globalMetaDirectory = join(os.homedir(), ".local/garden/meta");

const getMetaFilename = (config: GardenConfig) => {
  if (config.allowGlobalMeta && fs.existsSync(globalMetaDirectory)) {
    return join(
      globalMetaDirectory,
      config.directory.replace(/[\\/\\.]/g, "-") + "-meta.json",
    );
  } else {
    return join(config.directory, gardenMetaFile);
  }
};

const refresh = async (
  repository: GardenRepository,
  config: GardenConfig,
  filenameToPatch?: string,
) => {
  const meta =
    filenameToPatch && filenameToPatch.endsWith(".md")
      ? await generateMeta(
          repository,
          config,
          await loadMeta(repository, config),
          filenameToPatch,
        )
      : await generateMeta(repository, config);
  const fullGardenMetaFile = getMetaFilename(config);
  logger.info(
    `Refreshing ${fullGardenMetaFile} : ${Object.keys(meta).length} things`,
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

const findBackLinks = (things: Items, name: string) => {
  return Object.keys(things)
    .filter((fromName) => {
      return things[fromName].links.map((link) => link.name).includes(name);
    })
    .map((fromName) => ({ name: fromName, type: LinkType.From, value: 1 }));
};

export const findKnownThings = (things: Items) => {
  return Object.keys(
    Object.fromEntries(
      Object.entries(things).filter(
        ([, thing]) => thing.type === ItemType.Item,
      ),
    ),
  );
};

export const findLinkedThings = (
  things: Items,
  filter = (link: Link) => !!link,
) => {
  return Object.values(things)
    .map((thing) => thing.links.filter(filter).map((link: Link) => link.name))
    .flat()
    .filter(unique);
};

export const findWantedThings = (
  things: Items,
  filter = (link: Link) => !!link,
) => {
  const knownThings = findKnownThings(things);
  return findLinkedThings(things, filter).filter(
    (name: string) => name.indexOf("#") < 0 && !knownThings.includes(name),
  );
};

interface ProcessEnv {
  [key: string]: string | undefined;
}

export const gardensFromEnv = (env: ProcessEnv): Record<string, string> => {
  return Object.keys(env)
    .filter((key) => key.startsWith("GARDEN_"))
    .reduce((map: Record<string, string>, key: string) => {
      map[key.substring(7).toLowerCase()] = env[key] ?? "n/a";
      return map;
    }, {});
};

export const resolveDirectory = (
  cwd: string,
  gardenDirectoryFromEnv?: string,
) => {
  if (gardenDirectoryFromEnv) {
    return isAbsolute(gardenDirectoryFromEnv)
      ? gardenDirectoryFromEnv
      : join(cwd, gardenDirectoryFromEnv);
  }
  return join(cwd, ".gardens");
};

const enrichOptions = (
  options: GardenOptions,
  cwd: string,
  env?: ProcessEnv,
) => {
  const gardens = env ? gardensFromEnv(env) : {};
  const gardenDirectoryFromEnv = env ? env.GARDENS_DIRECTORY : undefined;
  const gardenRootDirectory = (() => {
    if (gardenDirectoryFromEnv || Object.keys(gardens).length) {
      return resolveDirectory(cwd, gardenDirectoryFromEnv);
    }
    // this is the zero config, clone and run config
    return join(cwd, "../test-gardens/content");
  })();
  const localConfig = (() => {
    const GARDEN_CONFIG_FILE = ".garden-config.json";
    const gardenConfigFile = `${gardenRootDirectory}/${GARDEN_CONFIG_FILE}`;
    if (fs.existsSync(gardenConfigFile)) {
      return JSON.parse(
        fs.readFileSync(gardenConfigFile, { encoding: "utf8", flag: "r" }),
      );
    } else {
      return {};
    }
  })();
  return {
    ...{
      gardens,
      hasMultiple: !fs.existsSync(`${gardenRootDirectory}/README.md`),
      directory: gardenRootDirectory,
    },
    ...options,
    ...localConfig,
  };
};

export const toConfig = (
  options: GardenOptions,
  cwd?: string,
  env?: ProcessEnv,
): GardenConfig => {
  const defaultedDeepOptions = options;
  // default included or exclude if not set
  if (options.publish) {
    if (!options.publish.include) {
      options.publish.include = defaultConfig.publish.include;
    }
    if (!options.publish.exclude) {
      options.publish.exclude = defaultConfig.publish.exclude;
    }
  }
  const enrichedOptions = cwd
    ? enrichOptions(defaultedDeepOptions, cwd, env)
    : defaultedDeepOptions;

  return {
    ...defaultConfig,
    ...enrichedOptions,
  };
};

const toRepository = (config: GardenConfig): GardenRepository => {
  if (config.type === "file") {
    return new FileGardenRepository(
      config.directory,
      config.excludedDirectories,
      { publish: config.publish },
    );
  }
  return new BaseGardenRepository(config.content, config);
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
    findBackLinks: (things: Items, name: string) => {
      return findBackLinks(things, name);
    },
    getMetaFilename: () => getMetaFilename(config),
    thing: (uri: string) => {
      return loadThing(repository, uri);
    },
  };
};
