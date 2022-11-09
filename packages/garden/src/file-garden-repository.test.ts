import { ItemReference } from "@garden/types";

import { FileGardenRepository } from "./file-garden-repository";

const GARDEN1_DIRECTORY = "../test-gardens/content/garden1";

const asyncFrom = async (asyncIterable: AsyncIterable<ItemReference>) => {
  const array = [];
  for await (const item of asyncIterable) {
    array.push(item);
  }
  return array;
};

const toName = (itemReference: ItemReference) => itemReference.name;

describe("file garden repository", () => {
  it("should find all items", async () => {
    const gardenRepository = new FileGardenRepository(GARDEN1_DIRECTORY);

    const items = await asyncFrom(gardenRepository.findAll());
    expect(items.map(toName).sort().slice(0, 2)).toStrictEqual([
      "README",
      "archive-linked",
    ]);
  });

  it("should find item", async () => {
    const gardenRepository = new FileGardenRepository(GARDEN1_DIRECTORY);
    const itemReference = await gardenRepository.find("word-1");
    expect(itemReference.name).toEqual("word-1");
  });

  it("should load item", async () => {
    const gardenRepository = new FileGardenRepository(GARDEN1_DIRECTORY);
    const itemReference = await gardenRepository.find("word-3");
    const item = gardenRepository.load(itemReference);
    expect(item.content).toEqual("# Word 3\n\nExplicit link [[word-4]].\n");
  });
});
