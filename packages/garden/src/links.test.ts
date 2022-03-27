import { findItem } from "./content";
import { createGarden } from "./garden";
import { findLinks } from "./links";
import { garden1Config } from "./test-helpers";

const garden = createGarden(garden1Config);

describe("links", () => {
  it("should have links", async () => {
    const item = await findItem(garden.config, "word");
    const links = await findLinks(garden, item);
    expect(links.length).toBe(7);
    [
      { name: "meta", type: "in" },
      { name: "vocabulary", type: "in" },
      { name: "word-1", type: "has" },
    ].forEach((expected) => expect(links).toContainEqual(expected));
  });
});
