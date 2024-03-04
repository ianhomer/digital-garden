import { hash, linkResolver, unique } from "@garden/core";
import {
  GardenRepository,
  Link,
  LinkType,
  Thing,
  Things,
  ThingType,
} from "@garden/types";
import fs from "fs";
import os from "os";
import { isAbsolute, join } from "path";

import { BaseGardenRepository } from "./base-garden-repository";
import { FileGardenRepository } from "./file-garden-repository";
import { justNaturalAliasLinks } from "./links";
import { logger } from "./logger";
import { toMultipleThingMeta } from "./markdown";
import { naturalAliases } from "./nlp";

const gardenMetaFile = ".garden-meta.json";

export interface Garden {
  repository: GardenRepository;
  config: GardenConfig;
  thing: (filename: string) => Thing;
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
  excludes: string[];
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

export type GardenOptions = Partial<GardenConfig>;

export const defaultConfig: GardenConfig = {
  allowGlobalMeta: true,
  type: "file",
  defaultGardenDirectory: ".",
  directory: ".gardens",
  excludedDirectories: ["node_modules", "digital-garden"],
  excludes: ["archive", "historical", "minor", "not", "stop"],
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

export const loadThingIntoMetaMap = async (metaMap: Things, thing: Thing) => {
  const { thingName, thingMeta, extra } = await thingToMultipleThingMeta(thing);

  thingMeta.forEach((singleThingMeta) => {
    const singleThingName =
      singleThingMeta.type === ThingType.Child
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
  metaMap: Things = {},
  filenameToPatch?: string,
): Promise<Things> => {
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
        type: ThingType.NaturallyWanted,
        aliases: [],
        value: 1,
        links: links.map(
          (name: string): Link => ({
            name: linkResolver(name),
            type: LinkType.NaturalAlias,
            value: 1,
          }),
        ),
      };
    }
  });

  const unwantedLinks = findUnwantedLinks(metaMap);
  const transformedMeta: Things = {};

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

const sortMeta = async (meta: Things) => {
  const entries = Object.entries(meta);
  entries.sort(([key1], [key2]) => key1.localeCompare(key2));
  return Object.fromEntries(entries);
};

const reduceAliases = (meta: Things): Things => {
  const naturallyWantedAliases = findWantedThings(meta, justNaturalAliasLinks);
  const reducibleAliases: [string, string[]][] = Object.entries(meta)
    .filter(
      ([, value]) =>
        value.type === ThingType.NaturallyWanted &&
        value.links.length > 0 &&
        value.links.every(
          (link) =>
            link.type === LinkType.NaturalAlias &&
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
              ? reducibleAliasLookup.get(name) ?? name
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
  meta: Things,
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
export const findUnwantedLinks = (meta: Things) => {
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
        return thing.type === ThingType.Item || thing.type === ThingType.Wanted;
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
      link.type === LinkType.NaturalTo || link.type === LinkType.NaturalAlias,
  );

  // Natural links that referenced multiple times, i.e. keepers
  const duplicateWantedNaturalToLinks = wantedNaturalLinks.reduce(
    (accumulator: string[], linkName, i, array: string[]) => {
      if (array.indexOf(linkName) !== i && accumulator.indexOf(linkName) < 0)
        accumulator.push(linkName);
      return accumulator;
    },
    [],
  );

  return wantedNaturalLinks.filter(
    (name) => !duplicateWantedNaturalToLinks.includes(name),
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

const findBackLinks = (things: Things, name: string) => {
  return Object.keys(things)
    .filter((fromName) => {
      return things[fromName].links.map((link) => link.name).includes(name);
    })
    .map((fromName) => ({ name: fromName, type: LinkType.From, value: 1 }));
};

export const findKnownThings = (things: Things) => {
  return Object.keys(
    Object.fromEntries(
      Object.entries(things).filter(
        ([, thing]) => thing.type === ThingType.Item,
      ),
    ),
  );
};

export const findLinkedThings = (
  things: Things,
  filter = (link: Link) => !!link,
) => {
  return Object.values(things)
    .map((thing) => thing.links.filter(filter).map((link: Link) => link.name))
    .flat()
    .filter(unique);
};

export const findWantedThings = (
  things: Things,
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
  return {
    ...{
      gardens,
      hasMultiple: !fs.existsSync(`${gardenRootDirectory}/README.md`),
      directory: gardenRootDirectory,
    },
    ...options,
  };
};

export const toConfig = (
  options: GardenOptions,
  cwd?: string,
  env?: ProcessEnv,
): GardenConfig => ({
  ...defaultConfig,
  ...(cwd ? enrichOptions(options, cwd, env) : options),
});

const toRepository = (config: GardenConfig): GardenRepository => {
  if (config.type === "file") {
    return new FileGardenRepository(
      config.directory,
      config.excludedDirectories,
      config.excludes,
    );
  }
  return new BaseGardenRepository(config.content, config.excludes);
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
