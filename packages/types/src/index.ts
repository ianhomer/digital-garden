export interface ItemReference {
  name: string;
}

export interface GardenRepository {
  toUri: (itemReference: ItemReference) => string;
  toValue: (itemReference: ItemReference) => number;
  toItemReference: (name: string) => ItemReference;
  load: (itemReference: ItemReference) => Promise<Item>;
  loadThing: (ItemReference: ItemReference) => Thing;
  toThing: (
    ItemReference: ItemReference | string,
    content: () => Promise<string>
  ) => Thing;
  find: (name: string) => Promise<ItemReference>;
  findAll: () => AsyncIterable<ItemReference>;
}

export interface Nameable {
  name: string;
}

export interface Item extends Nameable {
  filename?: string;
  content: string;
}

export interface Link extends Nameable {
  type: LinkType;
  value: number;
}

export interface ItemLink {
  source: string;
  target: string;
  depth: number;
  type: LinkType;
}

export interface Meta {
  title: string;
  type: ThingType;
  aliases: Array<string>;
  links: Array<Link>;
  value: number;
}

export enum ThingType {
  Item = "item",
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

export interface Thing {
  name: string;
  content: () => Promise<string>;
  value?: number;
}
