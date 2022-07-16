import { Link, Meta, Things } from "@garden/types";
import fs from "fs";
import os from "os";
import { join } from "path";
import { resolve } from "path";

import { findFilesDeep } from "./file";
import { logger } from "./logger";
import { process } from "./markdown";
import { FileThing } from "./thing";

const gardenMetaFile = ".garden-meta.json";

export interface Garden {
  config: GardenConfig;
  thing: (filename: string) => FileThing;
  findBackLinks: (things: Things, name: string) => Array<Link>;
  meta: () => Promise<Things>;
  load: () => Promise<Things>;
  refresh: (filenameToPatch?: string) => Promise<Things>;
}

export interface GardenOptions {
  allowGlobalMeta?: boolean;
  directory?: string;
  excludedDirectories?: string[];
  hasMultiple?: boolean;
  gardens?: { [key: string]: string };
  liveMeta?: boolean;
  verbose?: boolean;
}

export interface GardenConfig {
  allowGlobalMeta: boolean;
  directory: string;
  excludedDirectories: string[];
  hasMultiple: boolean;
  liveMeta: boolean;
  gardens: { [key: string]: string };
  verbose: boolean;
}

const defaultConfig = {
  allowGlobalMeta: true,
  directory: ".gardens",
  excludedDirectories: ["node_modules", "digital-garden"],
  hasMultiple: false,
  gardens: {},
  liveMeta: false,
  verbose: true,
};

const loadThing = (config: GardenConfig, filename: string): FileThing => {
  const match = /([^/]*).md$/.exec(filename);
  return {
    filename,
    name: match ? match[1] : "filename",
    content: () =>
      fs.readFileSync(join(config.directory, `${filename}`), "utf8"),
  };
};

const generateThingMeta = (
  config: GardenConfig,
  gardenDirectory: string,
  filename: string
) => {
  const thing = loadThing(config, filename.substring(gardenDirectory.length));
  const extra: { value?: number } = {};
  ["archive", "not", "stop"].forEach((ignore) => {
    if (filename.includes(`/${ignore}/`)) {
      extra.value = 0;
    }
  });
  return {
    thingName: thing.name,
    thingMeta: {
      ...process(thing.content),
      ...extra,
    },
  };
};

const generateMeta = async (
  config: GardenConfig,
  meta: { [key: string]: Meta } = {},
  filenameToPatch?: string
): Promise<{ [key: string]: Meta }> => {
  const gardenDirectory = resolve(config.directory);

  if (filenameToPatch) {
    console.log(`Patching meta with : ${filenameToPatch}`);
    const { thingName, thingMeta } = generateThingMeta(
      config,
      gardenDirectory,
      filenameToPatch
    );
    meta[thingName] = thingMeta;
  } else {
    for await (const filename of findFilesDeep(
      config.excludedDirectories,
      config.directory
    )) {
      if (filename.startsWith(gardenDirectory)) {
        const { thingName, thingMeta } = generateThingMeta(
          config,
          gardenDirectory,
          filename
        );
        meta[thingName] = thingMeta;
      } else {
        console.error(`File ${filename} is not in garden ${config.directory}`);
      }
    }
  }

  const transformedMeta: { [key: string]: Meta } = {};

  Object.keys(meta).map((key) => {
    const thing = meta[key];
    transformedMeta[key] = {
      title: thing.title,
      value: thing.value,
      links: thing.links.map((link) => {
        const transformedLink: Link = { name: link.name, type: link.type };
        if (thing?.value == 0 || meta[link.name]?.value == 0) {
          transformedLink.value = 0;
        }
        return transformedLink;
      }),
    };
  });

  return transformedMeta;
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
    .map((fromName) => ({ name: fromName }));
};

export const findKnownThings = (things: Things) => {
  return Object.keys(things);
};

export const findLinkedThings = (
  things: Things,
  filter = (link: Link) => !!link
) => {
  return Object.values(things)
    .map((thing) => thing.links.filter(filter).map((link: Link) => link.name))
    .flat();
};

export const findWantedThings = (
  things: Things,
  filter = (link: Link) => !!link
) => {
  const knownThings = findKnownThings(things);
  return findLinkedThings(things, filter).filter(
    (name: string) => !knownThings.includes(name)
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
    thing: (filename: string) => {
      return loadThing(config, filename);
    },
  };
};
