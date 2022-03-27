import { findItem } from "./content";
import { createGarden } from "./garden";
import { findLinks } from "./links";

const garden = createGarden({
  allowGlobalMeta: false,
  directory: "../test-gardens/content/garden1",
  verbose: false,
});

describe("links", () => {
  it("should have in link", async () => {
    const name = "word-1";
    const item = await findItem(garden.config, name);
    const links = await findLinks(garden, garden.config, item, "test");
    expect(links[0].name).toBe("word");
    expect(links[0].type).toBe("in");
  });
});
