import { Nameable } from "@garden/graph";

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

export type Content = {
  body: string;
  hidden: boolean;
};

export type ThingData = {
  tags?: string[];
};

export interface Item extends Nameable {
  filename?: string;
  hash: string;
  content: string;
}

export interface Thing {
  name: string;
  hash: string;
  content: () => Promise<Content>;
  value?: number;
}
