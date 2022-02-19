import fs from "fs";
import { join } from "path";
import { resolve } from "path";

import config from "../../../garden.config";
import { findFilesDeep } from "./file";
import { process } from "./markdown";
import { Meta } from "./meta";
import { FileThing } from "./thing";

const gardenMetaFile = ".garden-meta.json";

export interface Garden {
  config: GardenConfig;
  thing: (filename: string) => FileThing;
  meta: () => Promise<{ [key: string]: Meta }>;
  load: () => Promise<{ [key: string]: Meta }>;
  refresh: () => Promise<void>;
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

const refresh = async (config: GardenConfig) => {
  const meta = await generateMeta(config);
  const fullGardenMetaFile = join(config.directory, gardenMetaFile);
  console.log(`Refreshing ${fullGardenMetaFile}`);
  fs.writeFileSync(fullGardenMetaFile, JSON.stringify(meta));
};

const loadMeta = async (config: GardenConfig) => {
  const content = fs.readFileSync(join(config.directory, gardenMetaFile));
  return JSON.parse(content.toString("utf8"));
};

export const createGarden = (config: GardenConfig): Garden => {
  return {
    config,
    meta: async () => await generateMeta(config),
    refresh: async () => await refresh(config),
    load: async () => await loadMeta(config),
    thing: (filename: string) => {
      return loadThing(config, filename);
    },
  };
};
export const garden = createGarden(config);
