import { findItem } from "./content";
import { createGarden } from "./garden";
import { findLinks } from "./links";
import { garden1WithLiveMetaConfig } from "./test-helpers";

const garden = createGarden(garden1WithLiveMetaConfig);

describe("links", () => {
  it("should have links", async () => {
    const item = await findItem(garden.repository, "word");
    const links = await findLinks(garden, item);
    expect(links.length).toBe(8);
    [
      { name: "meta", type: "in", value: 1 },
      { name: "vocabulary", type: "in", value: 1 },
      { name: "word-2", type: "from", value: 1 },
      { name: "word-3", type: "has", value: 1 },
    ].forEach((expected) => expect(links).toContainEqual(expected));
  });
});
