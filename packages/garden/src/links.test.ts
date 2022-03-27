import { Link } from "@garden/types";

import { findItem } from "./content";
import { createGarden } from "./garden";
import { findLinks } from "./links";

const garden = createGarden({
  allowGlobalMeta: false,
  directory: "../test-gardens/content/garden1",
  verbose: false,
});

const byName = (name: string) => (link: Link) => link.name == name;

describe("links", () => {
  it("should have links", async () => {
    const name = "word";

    const item = await findItem(garden.config, name);
    const links = await findLinks(garden, item);
    expect(links.find(byName("meta"))?.type).toBe("in");
    expect(links.find(byName("vocabulary"))?.type).toBe("in");
    expect(links.find(byName("word-1"))?.type).toBe("has");
  });
});
