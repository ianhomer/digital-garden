export interface ItemReference {
  name: string;
  hash: string;
}

export interface GardenRepository {
  description: () => string;
  toUri: (itemReference: ItemReference) => string;
  toValue: (itemReference: ItemReference) => number;
  toItemReference: (name: string) => ItemReference;
  load: (itemReference: ItemReference) => Promise<Item>;
  loadThing: (ItemReference: ItemReference) => Thing;
  isHidden: (ItemReference: ItemReference) => Promise<boolean>;
  toThing: (
    ItemReference: ItemReference | string,
    content: () => Promise<Content>,
  ) => Thing;
  find: (name: string) => Promise<ItemReference>;
  findAll: () => AsyncIterable<ItemReference>;
}

export interface Nameable {
  name: string;
}

export interface Item extends Nameable {
  filename?: string;
  hash: string;
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
  hash: string;
  type: ThingType;
  aliases: Array<string>;
  links: Array<Link>;
  value: number;
}

export enum ThingType {
  Item = "item",
  Wanted = "wanted",
  ImplicitlyWanted = "implictlyWanted",
  Child = "child",
}

export enum LinkType {
  To = "to",
  From = "from",
  Has = "has",
  In = "in",
  Child = "child",
  ImplicitTo = "implicit",
  ImplicitFrom = "implicitFrom",
  ImplicitAlias = "implicitAlias",
}

export type Content = {
  body: string;
  hidden: boolean;
};
export type Things = { [key: string]: Meta };

export type ThingData = {
  tags?: string[];
};

export interface Thing {
  name: string;
  hash: string;
  content: () => Promise<Content>;
  value?: number;
}
