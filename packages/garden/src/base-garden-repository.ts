import { GardenRepository, ItemReference } from "@garden/types";

import { BaseItem } from "./base-item";

export class BaseGardenRepository implements GardenRepository {
  content;

  constructor(content: { [key: string]: string } = {}) {
    this.content = content;
  }

  toUri(itemReference: ItemReference) {
    return `garden:${itemReference.name}`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  toValue(_: ItemReference): number | undefined {
    return undefined;
  }

  async load(itemReference: string | ItemReference) {
    const name =
      typeof itemReference === "string" ? itemReference : itemReference.name;
    if (name in this.content) {
      return new BaseItem(name, this.content[name]);
    }
    throw `Cannot load ${name} since does not exist in repository`;
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
