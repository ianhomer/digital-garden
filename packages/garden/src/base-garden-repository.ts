import { GardenRepository, ItemReference } from "@garden/types";

import { BaseItem } from "./base-item";

export class BaseGardenRepository implements GardenRepository {
  content;

  constructor(content: { [key: string]: string } = {}) {
    this.content = content;
  }

  toItemReference(name: string) {
    const matchName = /([^/]*).md$/.exec(name);
    return {
      name: matchName ? matchName[1] : name,
    };
  }

  toUri(itemReference: ItemReference) {
    return itemReference.name;
  }

  toValue(itemReference: ItemReference): number {
    for (const ignore of ["archive"]) {
      if (itemReference.name.includes(ignore)) {
        return 0;
      }
    }

    return 1;
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
      return this.toItemReference(name);
    }
    throw `Cannot find ${name} in memory`;
  }

  async *findAll() {
    for (const name in this.content) {
      yield { name };
    }
  }
}
