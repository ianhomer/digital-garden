import fs from "fs";
import { join } from "path";
import { resolve } from "path";

import config from "../../../garden.config";
import { findBackLinks } from "../content";
import { findFilesDeep } from "./file";
import { process } from "./markdown";
import { Link, Meta, Things } from "./meta";
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
export interface GardenConfig {
  directory: string;
  gardens?: { [key: string]: string };
}

const loadThing = (config: GardenConfig, filename: string): FileThing => {
  return {
    filename,
    name: /([^/]*).md$/.exec(filename)[1],
    content: () =>
      fs.readFileSync(join(config.directory, `${filename}`), "utf8"),
  };
};

const generateMeta = async (
  config: GardenConfig
): Promise<{ [key: string]: Meta }> => {
  const gardenDirectory = resolve(config.directory);

  const meta = {};
  for await (const filename of findFilesDeep(config.directory)) {
    if (filename.startsWith(gardenDirectory)) {
      const thing = loadThing(
        config,
        filename.substring(gardenDirectory.length)
      );
      meta[thing.name] = process(thing.content);
    } else {
      console.error(`File ${filename} is not in garden ${config.directory}`);
    }
  }
  return meta;
};

const getMetaFilename = (config: GardenConfig) =>
  join(config.directory, gardenMetaFile);

const refresh = async (config: GardenConfig) => {
  const meta = await generateMeta(config);
  const fullGardenMetaFile = getMetaFilename(config);
  console.log(
    `Refreshing ${fullGardenMetaFile} : ${Object.keys(meta).length} things`
  );
  fs.writeFileSync(fullGardenMetaFile, JSON.stringify(meta));
  return meta;
};

const loadMeta = async (config: GardenConfig) => {
  const metaFilename = getMetaFilename(config);
  if (fs.existsSync(metaFilename)) {
    const content = fs.readFileSync(join(config.directory, gardenMetaFile));
    return JSON.parse(content.toString("utf8"));
  } else {
    console.log(`Meta file ${metaFilename} does not exist`);
    return {};
  }
};

const findBackLinks = (things, name) => {
  return Object.keys(things)
    .filter((fromName) => {
      return things[fromName].links.map((link) => link.to).includes(name);
    })
    .map((fromName) => {
      return { to: fromName };
    });
};

export const createGarden = (config: GardenConfig): Garden => {
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
export const garden = createGarden(config);
