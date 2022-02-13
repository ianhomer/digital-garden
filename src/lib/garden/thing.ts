import { Garden } from "./garden";

export interface Thing {
  name: string;
  content: () => string;
}

export interface FileThing extends Thing {
  filename: string;
}

export interface Link {
  to: string;
}

export interface Meta {
  name: string;
  links: Array<Link>;
}

export function getMeta(garden: Garden, thing: FileThing): Meta {
  return {
    name: thing.name,
    links: [],
  };
}
