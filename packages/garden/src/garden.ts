import { Link, Meta, Things } from "@garden/types";
import fs from "fs";
import os from "os";
import { join } from "path";
import { resolve } from "path";

import { findFilesDeep } from "./file";
import { process } from "./markdown";
import { FileThing } from "./thing";

const gardenMetaFile = ".garden-meta.json";

export interface Garden {
  config: GardenConfig;
  thing: (filename: string) => FileThing;
  findBackLinks: (things: Things, name: string) => Array<Link>;
  meta: () => Promise<Things>;
  load: () => Promise<Things>;
  refresh: () => Promise<Things>;
}

export interface GardenOptions {
  allowGlobalMeta?: boolean;
  directory?: string;
  excludedDirectories?: string[];
  hasMultiple?: boolean;
  gardens?: { [key: string]: string };
  verbose?: boolean;
}

export interface GardenConfig {
  allowGlobalMeta: boolean;
  directory: string;
  excludedDirectories: string[];
  hasMultiple: boolean;
  gardens: { [key: string]: string };
  verbose: boolean;
}

const defaultConfig = {
  allowGlobalMeta: true,
  directory: ".gardens",
  excludedDirectories: ["node_modules"],
  hasMultiple: false,
  gardens: {},
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

const generateMeta = async (
  config: GardenConfig
): Promise<{ [key: string]: Meta }> => {
  const gardenDirectory = resolve(config.directory);

  const meta: { [key: string]: Meta } = {};
  for await (const filename of findFilesDeep(
    config.excludedDirectories,
    config.directory
  )) {
    if (filename.startsWith(gardenDirectory)) {
      const thing = loadThing(
        config,
        filename.substring(gardenDirectory.length)
      );
      const extra: { value?: number } = {};
      ["archive", "not", "stop"].forEach((ignore) => {
        if (filename.includes(`/${ignore}/`)) {
          extra.value = 0;
        }
      });
      meta[thing.name] = {
        ...process(thing.content),
        ...extra,
      };
    } else {
      console.error(`File ${filename} is not in garden ${config.directory}`);
    }
  }

  const transformedMeta: { [key: string]: Meta } = {};

  Object.keys(meta).map((key) => {
    const thing = meta[key];
    transformedMeta[key] = {
      title: thing.title,
      value: thing.value,
      links: thing.links.map((link) => {
        const transformedLink: Link = { name: link.name };
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

const refresh = async (config: GardenConfig) => {
  const meta = await generateMeta(config);
  const fullGardenMetaFile = getMetaFilename(config);
  config.verbose &&
    console.log(
      `Refreshing ${fullGardenMetaFile} : ${Object.keys(meta).length} things`
    );
  fs.writeFileSync(fullGardenMetaFile, JSON.stringify(meta));
  return meta;
};

async function loadMeta(config: GardenConfig) {
  const metaFilename = getMetaFilename(config);
  if (fs.existsSync(metaFilename)) {
    const content = fs.readFileSync(join(getMetaFilename(config)));
    return JSON.parse(content.toString("utf8"));
  } else {
    console.log(`Meta file ${metaFilename} does not exist`);
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

export const findLinkedThings = (things: Things) => {
  return Object.values(things)
    .map((thing) => thing.links.map((link: Link) => link.name))
    .flat();
};

export const findWantedThings = (things: Things) => {
  const knownThings = findKnownThings(things);
  return findLinkedThings(things).filter(
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
    refresh: async () => await refresh(config),
    load: async () => await loadMeta(config),
    findBackLinks: (things: Things, name: string) => {
      return findBackLinks(things, name);
    },
    thing: (filename: string) => {
      return loadThing(config, filename);
    },
  };
};
