import fs from "fs";
import { join } from "path";

import config from "../../../garden.config";
import { process } from "./markdown";
import { Meta } from "./meta";
import { FileThing } from "./thing";

export interface Garden {
  config: GardenConfig;
  thing: (filename: string) => FileThing;
  meta: () => { [key: string]: Meta };
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

const loadMeta = (config: GardenConfig) => {
  return {
    "word-1": process(loadThing(config, "garden1/word/word-1.md").content),
    "word-2": process(loadThing(config, "garden1/word/word-2.md").content),
  };
};

export const createGarden = (config: GardenConfig): Garden => {
  return {
    config,
    meta: () => loadMeta(config),
    thing: (filename: string) => {
      return loadThing(config, filename);
    },
  };
};
export const garden = createGarden(config);
