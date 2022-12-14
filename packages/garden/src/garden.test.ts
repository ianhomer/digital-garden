import { builder } from "@garden/core";
import { Link, LinkType, Things } from "@garden/types";

import {
  createGarden,
  findKnownThings,
  findLinkedThings,
  findUnwantedLinks,
  findWantedThings,
  loadThingIntoMetaMap,
} from "./garden";
import { gardenConfig } from "./test-helpers";

const garden = createGarden(gardenConfig);
const gardenItemCount = 26;
const NATURAL_LINK_SHARED = "natural-link-shared";
const NATURAL_LINK_ALONE = "natural-link-alone";
const noNaturalLinks = (link: Link) => link.type !== LinkType.NaturalTo;
const naturalLinks = (link: Link) => link.type === LinkType.NaturalTo;

describe("garden", () => {
  it("should be created", () => {
    expect(garden.config.directory).toBe("../test-gardens/content");
  });

  it("should have name", () => {
    const thing = garden.thing("garden/my-name.md");
    expect(thing.name).toBe("my-name");
  });

  it("should have meta", async () => {
    const meta = await garden.meta();
    expect(Object.keys(meta).length).toBe(gardenItemCount);
    const wordThing = meta["word"];
    expect(wordThing.title).toBe("Word");
    expect(wordThing.links[0].name).toBe("vocabulary");
  });

  it("should have backlinks", async () => {
    const things = await garden.meta();
    const backLinks = garden.findBackLinks(things, "word-2");
    expect(backLinks.map((link) => link.name)).toStrictEqual([
      "links",
      "word-1",
    ]);
  });

  it("should have known things", async () => {
    const things = await garden.meta();
    const knownThings = findKnownThings(things);
    expect(knownThings.length).toBe(18);
  });

  it("should have linked things", async () => {
    const things = await garden.meta();
    const linkedThings = findLinkedThings(things);
    expect(linkedThings).toContain("word-2");
    expect(linkedThings).toContain("word-3");
    try {
      expect(linkedThings.length).toBe(21);
    } catch (e) {
      throw new Error(`${e} : ${JSON.stringify(linkedThings)}`);
    }
  });

  it("should have achived links with zero value", async () => {
    const things = await garden.meta();
    expect(things["readme"].value).toBe(1);
    expect(things["archived-thing"].value).toBe(0);
    expect(
      things["archive-linked"].links.find(
        (link) => (link.name = "archived-thing")
      )?.value
    ).toBe(0);
    expect(
      things["readme"].links.find((link) => (link.name = "vocabulary"))?.value
    ).toBe(1);
  });

  it("should have wanted things", async () => {
    const things = await garden.meta();
    const wantedThings = findWantedThings(things, noNaturalLinks);
    expect(wantedThings).toStrictEqual(["cat", "wanted"]);
    const wantedNaturalThings = findWantedThings(things, naturalLinks);
    try {
      expect(wantedNaturalThings.length).toBe(3);
    } catch (e) {
      throw new Error(`${e} : ${JSON.stringify(wantedNaturalThings)}`);
    }
  });

  it("should refresh meta", async () => {
    await garden.refresh().then(async () => {
      const meta = await garden.load();
      expect(Object.keys(meta).length).toBe(gardenItemCount);
    });
  });

  it("should not find unwanted links", () => {
    const meta: Things = builder()
      .name("foo")
      .link("explicit-link")
      .link(NATURAL_LINK_SHARED, LinkType.NaturalTo)
      .link(NATURAL_LINK_ALONE, LinkType.NaturalTo)
      .name("bar")
      .link("explicit-link", LinkType.NaturalTo)
      .link(NATURAL_LINK_SHARED, LinkType.NaturalTo)
      .link("bar", LinkType.NaturalTo)
      .build();
    expect(findUnwantedLinks(meta)).toStrictEqual([NATURAL_LINK_ALONE]);
  });

  const myFilename = "my-filename";

  it("should generate single thing", async () => {
    const thing = garden.repository.toThing(
      myFilename,
      async () => "# thing title\n\n" + "thing content"
    );
    const metaMap: Things = {};
    await loadThingIntoMetaMap(metaMap, thing);
    expect(Object.keys(metaMap)).toHaveLength(1);
  });

  it("should generate multiple things", async () => {
    const sectionTitle = "my-filename#section-title";
    const thing = garden.repository.toThing(
      myFilename,
      async () =>
        "# thing title\n\nThing content\n\n" +
        "## section title\n\nSection content\n\n" +
        "### sub-section title\n\nSub-section content"
    );
    const metaMap: Things = {};
    await loadThingIntoMetaMap(metaMap, thing);
    expect(Object.keys(metaMap)).toHaveLength(3);
    expect(
      metaMap[myFilename].links
        .filter((link) => link.type === LinkType.Child)
        .map((link) => link.name)
    ).toEqual([sectionTitle]);
    expect(metaMap["my-filename"].title).toBe("thing title");
    expect(
      metaMap["my-filename#section-title"].links
        .filter((link) => link.type === LinkType.Child)
        .map((link) => link.name)
    ).toEqual(["my-filename#sub-section-title"]);
    expect(metaMap[sectionTitle].title).toBe("section title");
    expect(metaMap["my-filename#sub-section-title"].title).toBe(
      "sub-section title"
    );
  });

  it("should handle content items with same name", async () => {
    const things = await garden.meta();
    console.log(JSON.stringify(things, null, "  "));
    const thing = things.readme;
    expect(thing.title).toBe("Garden 1 README");
    const thing1 = things["readme+abcdef"];
    expect(thing1.title).toBe("Garden 1 README");
    const thing2 = things["readme+ghijkl"];
    expect(thing2.title).toBe("Garden 2 README");
  });
});
