import fs from "fs";
import { join } from "path";

import config from "../../../garden.config";
import { FileThing } from "./thing";

export interface Garden {
  config: GardenConfig;
  thing: (filename: string) => FileThing;
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

export const createGarden = (config: GardenConfig): Garden => {
  return {
    config,
    thing: (filename: string) => {
      return loadThing(config, filename);
    },
  };
};
export const garden = createGarden(config);
