import { findItem } from "./content";
import { createGarden } from "./garden";

const garden = createGarden({
  allowGlobalMeta: false,
  directory: "../test-gardens/content/garden1",
  verbose: false,
});

describe("content", () => {
  it("should find item", async () => {
    const name = "word-1";
    const item = await findItem(garden.config, name);
    expect(item.name).toBe("word-1");
  });
});
