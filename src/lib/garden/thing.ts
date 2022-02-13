import fs from "fs";
import { join } from "path";

import { Garden } from "./garden";

export interface Thing {
  name: string;
  content: () => string;
}

export interface FileThing extends Thing {
  filename: string;
  garden: Garden;
}

export function createThing(garden: Garden, filename: string): FileThing {
  return {
    filename,
    garden,
    name: /([^/]*).md$/.exec(filename)[1],
    content: () =>
      fs.readFileSync(join(garden.config.directory, `${filename}`), "utf8"),
  };
}
