import { GardenRepository, ItemReference } from "@garden/types";
import { join } from "path";

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
const toUri =
  (gardenRepository: GardenRepository) => (itemReference: ItemReference) =>
    gardenRepository.toUri(itemReference);

describe("file garden repository", () => {
  it("should find all items", async () => {
    const gardenRepository = new FileGardenRepository(GARDEN1_DIRECTORY);

    const items = await asyncFrom(gardenRepository.findAll());
    expect(items.map(toName).sort().slice(0, 4)).toStrictEqual([
      "archive-linked",
      "archived-thing",
      "capitalised",
      "emoji",
    ]);
    expect(items.map(toUri(gardenRepository))).toContain("word/word-1.md");
  });

  it("should find item", async () => {
    const gardenRepository = new FileGardenRepository(GARDEN1_DIRECTORY);
    const itemReference = await gardenRepository.find("word-1");
    expect(itemReference.name).toEqual("word-1");
  });

  it("should find capitalised item", async () => {
    const gardenRepository = new FileGardenRepository(GARDEN1_DIRECTORY);
    const itemReference = await gardenRepository.find("capitalised");
    expect(itemReference.name).toEqual("capitalised");
  });

  it("should load item", async () => {
    const gardenRepository = new FileGardenRepository(GARDEN1_DIRECTORY);
    const itemReference = await gardenRepository.find("word-3");
    const item = await gardenRepository.load(itemReference);
    expect(item.content).toEqual("# Word 3\n\nExplicit link [[word-4]].\n");
  });

  it("should load item reference from absolute filename", async () => {
    const gardenRepository = new FileGardenRepository(GARDEN1_DIRECTORY);
    const filename = join(GARDEN1_DIRECTORY, "README.md");
    const itemReference = gardenRepository.toItemReference(filename);
    expect(itemReference.filename).toBe("README.md");
    const item = await gardenRepository.load(itemReference);
    expect(item.content.substring(0, 10)).toBe("# Garden 1");
  });
});
