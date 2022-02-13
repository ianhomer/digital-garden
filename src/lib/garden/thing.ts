import { Garden } from "./garden";
import { Meta } from "./meta";

export interface Thing {
  name: string;
  content: () => string;
}

export interface FileThing extends Thing {
  filename: string;
}

export function getMeta(garden: Garden, thing: FileThing): Meta {
  return {
    name: thing.name,
    links: [],
  };
}
