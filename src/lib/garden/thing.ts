import { Garden } from "./garden";

export interface Thing {
  name: string;
}

export interface FileThing extends Thing {
  filename: string;
}

export interface Meta {
  name: string;
}

export function getMeta(garden: Garden, thing: FileThing): Meta {
  return {
    name: thing.name,
  };
}
