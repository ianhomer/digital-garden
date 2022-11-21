import { GardenRepository, ItemReference } from "@garden/types";

import { BaseItem } from "./base-item";

export class BaseGardenRepository implements GardenRepository {
  content;

  constructor(content: { [key: string]: string }) {
    this.content = content;
  }

  toUri(itemReference: ItemReference) {
    return `garden:${itemReference.name}`;
  }

  toValue() {
    return undefined;
  }

  async load(itemReference: string | ItemReference) {
    const name =
      typeof itemReference === "string" ? itemReference : itemReference.name;
    return new BaseItem(name, this.content[name]);
  }

  async find(name: string) {
    if (name in this.content) {
      return {
        name,
      };
    }
    throw `Cannot find ${name} in memory`;
  }

  async *findAll() {
    for (const name in this.content) {
      yield { name };
    }
  }
}
