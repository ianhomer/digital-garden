import { findItem, findItemOrWanted, getAllItems } from "./content";
import { createGarden } from "./garden";
import { garden1Config } from "./test-helpers";

const garden = createGarden(garden1Config);

describe("content module", () => {
  it("should find item", async () => {
    const name = "word-1";
    const item = await findItem(garden.config, name);
    expect(item.name).toBe("word-1");
  });

  it("should find wanted item", async () => {
    const filename = await findItemOrWanted(garden.config, "wanted");
    expect(filename.content).toBe("# wanted\n\nWanted");
  });

  it("should find all items", async () => {
    const allItems = await getAllItems(garden.config);
    expect(allItems).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: "word" })])
    );
  });
});
