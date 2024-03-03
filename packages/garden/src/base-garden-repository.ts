import { hash } from "@garden/core";
import { Content, GardenRepository, ItemReference } from "@garden/types";

import { BaseItem } from "./base-item";

export class BaseGardenRepository implements GardenRepository {
  private content;
  private excludes: string[];

  constructor(content: { [key: string]: string } = {}, excludes: string[]) {
    this.excludes = excludes;
    this.content = Object.fromEntries(
      Object.entries(content).map(([key, value]) => [key.toLowerCase(), value]),
    );
  }

  description() {
    return "base repository";
  }

  normaliseName(name: string) {
    return name.toLowerCase();
  }

  toItemReference(name: string) {
    const matchName = /([^/]*).md$/.exec(name);
    return {
      name: this.normaliseName(matchName ? matchName[1] : name),
      hash: hash(name),
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

  async load(itemReference: ItemReference) {
    const name = itemReference.name;
    if (name in this.content) {
      return new BaseItem(itemReference, name, this.content[name]);
    }
    throw `Cannot load ${name} since does not exist in ${this.description()}`;
  }

  toThing(reference: ItemReference | string, content: () => Promise<Content>) {
    const itemReference =
      typeof reference === "object"
        ? reference
        : this.toItemReference(reference);
    return {
      name: itemReference.name,
      hash: itemReference.hash,
      value: this.toValue(itemReference),
      content,
    };
  }

  toTags(tags: string | string[] | undefined): string[] {
    if (Array.isArray(tags)) {
      return tags;
    } else if (tags === undefined) {
      return [];
    } else {
      return tags.split(",");
    }
  }

  isLoadedItemHidden(item: BaseItem) {
    const tags = this.toTags(item.data.tags);
    for (const tag of tags) {
      if (this.excludes.includes(tag)) {
        return true;
      }
    }
    return false;
  }

  loadThing(itemReference: ItemReference) {
    return this.toThing(
      itemReference,
      async (): Promise<Content> =>
        this.load(itemReference)
          .then((item) => {
            return {
              body: item.content,
              hidden: this.isLoadedItemHidden(item),
            };
          })
          .catch((error) => {
            console.error(error);
            return error;
          }),
    );
  }

  async isHidden(itemReference: ItemReference) {
    try {
      const item = await this.load(itemReference);
      return this.isLoadedItemHidden(item);
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async find(name: string) {
    if (name in this.content) {
      return this.toItemReference(name);
    }
    throw `Cannot find ${name} in memory`;
  }

  async *findAll() {
    for (const name in this.content) {
      yield { name, hash: hash(name) };
    }
  }
}
