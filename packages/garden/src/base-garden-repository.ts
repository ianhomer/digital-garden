import { GardenRepository, Item, ItemReference } from "@garden/types";

export class BaseGardenRepository implements GardenRepository {
  toUri: (itemReference: ItemReference) => string;
  toValue: (itemReference: ItemReference) => number | undefined;
  load: (itemReference: string | ItemReference) => Promise<Item>;
  find: (name: string) => Promise<ItemReference>;
  findAll: () => AsyncIterable<ItemReference>;
}
