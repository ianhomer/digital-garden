import { Link, LinkType, ThingType } from "@garden/types";

import {
  createGarden,
  findKnownThings,
  findLinkedThings,
  findUnwantedLinks,
  findWantedThings,
  loadThingIntoMetaMap,
  MetaMap,
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
    await garden.refresh().then(async (generated) => {
      const meta = await garden.load();
      expect(Object.keys(meta).length).toBe(gardenItemCount);
    });
  });

  it("should not find unwanted links", () => {
    const meta: MetaMap = {
      foo: {
        title: "foo",
        aliases: [],
        value: 1,
        type: ThingType.Item,
        links: [
          { name: "explicit-link", type: LinkType.To, value: 1 },
          { name: NATURAL_LINK_SHARED, type: LinkType.NaturalTo, value: 1 },
          { name: NATURAL_LINK_ALONE, type: LinkType.NaturalTo, value: 1 },
        ],
      },
      bar: {
        title: "bar",
        aliases: [],
        value: 1,
        type: ThingType.Item,
        links: [
          { name: "explicit-link", type: LinkType.NaturalTo, value: 1 },
          { name: NATURAL_LINK_SHARED, type: LinkType.NaturalTo, value: 1 },
          { name: "bar", type: LinkType.NaturalTo, value: 1 },
        ],
      },
    };
    expect(findUnwantedLinks(meta)).toStrictEqual([NATURAL_LINK_ALONE]);
  });

  const myFilename = "my-filename";

  it("should generate single thing", async () => {
    const fileThing = {
      filename: myFilename,
      name: myFilename,
      content: async () => "# thing title\n\n" + "thing content",
    };
    const metaMap: MetaMap = {};
    await loadThingIntoMetaMap(metaMap, fileThing);
    expect(Object.keys(metaMap)).toHaveLength(1);
  });

  it("should generate multiple things", async () => {
    const sectionTitle = "my-filename#section-title";
    const fileThing = {
      filename: myFilename,
      name: myFilename,
      content: async () =>
        "# thing title\n\nThing content\n\n" +
        "## section title\n\nSection content\n\n" +
        "### sub-section title\n\nSub-section content",
    };
    const metaMap: MetaMap = {};
    await loadThingIntoMetaMap(metaMap, fileThing);
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

  describe("exceptional scenarios", () => {
    it("example 1 - empty link name bug", async () => {
      const things = await garden.meta();
      const thing1 = things["exceptional-example-1"];
      console.log(JSON.stringify(thing1, null, "  "));
      const thing2 = things["exceptional-example-1#heading-test"];
      console.log(JSON.stringify(thing2, null, "  "));
      console.log(JSON.stringify(thing2.links.map((link) => link.name)));
      expect(thing2.links.map((link) => link.name)).toStrictEqual([]);
    });
  });
});
