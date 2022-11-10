export interface ItemReference {
  name: string;
}

export interface GardenRepository {
  toUri: (itemReference: ItemReference) => string;
  load: (itemReference: ItemReference | string) => Promise<Item>;
  find: (name: string) => Promise<ItemReference>;
  findAll: () => AsyncIterable<ItemReference>;
}

export interface Item {
  name: string;
  filename?: string;
  content: string;
}

export interface Link {
  name: string;
  type?: LinkType;
  value?: number;
}

export interface ItemLink {
  source: string;
  target: string;
  depth: number;
  type: LinkType;
}

export interface Meta {
  title: string;
  type?: ThingType;
  links: Array<Link>;
  value?: number;
}

export enum ThingType {
  Wanted = "wanted",
  NaturallyWanted = "naturallyWanted",
  Child = "child",
}

export enum LinkType {
  To = "to",
  From = "from",
  Has = "has",
  In = "in",
  Child = "child",
  NaturalTo = "natural",
  NaturalFrom = "naturalFrom",
  NaturalAlias = "naturalAlias",
}

export type Things = { [key: string]: Meta };
