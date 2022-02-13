import fs from "fs";
import { join } from "path";
import { resolve } from "path";

import config from "../../../garden.config";
import { findFilesDeep } from "./file";
import { process } from "./markdown";
import { Meta } from "./meta";
import { FileThing } from "./thing";

export interface Garden {
  config: GardenConfig;
  thing: (filename: string) => FileThing;
  meta: () => Promise<{ [key: string]: Meta }>;
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

const loadMeta = async (
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

export const createGarden = (config: GardenConfig): Garden => {
  return {
    config,
    meta: async () => await loadMeta(config),
    thing: (filename: string) => {
      return loadThing(config, filename);
    },
  };
};
export const garden = createGarden(config);
