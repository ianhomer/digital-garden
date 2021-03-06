import { Link, LinkType } from "@garden/types";

import {
  createGarden,
  findKnownThings,
  findLinkedThings,
  findUnwantedLinks,
  findWantedThings,
  MetaMap,
} from "./garden";
import { gardenConfig } from "./test-helpers";

const garden = createGarden(gardenConfig);
const gardenItemCount = 14;
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
    expect(backLinks[0].name).toBe("word-1");
  });

  it("should have known things", async () => {
    const things = await garden.meta();
    const knownThings = findKnownThings(things);
    expect(knownThings.length).toBe(gardenItemCount);
  });

  it("should have linked things", async () => {
    const things = await garden.meta();
    const linkedThings = findLinkedThings(things);
    expect(linkedThings).toContain("word-2");
    expect(linkedThings).toContain("word-3");
    try {
      expect(linkedThings.length).toBe(12);
    } catch (e) {
      throw new Error(`${e} : ${JSON.stringify(linkedThings)}`);
    }
  });

  it("should have achived links with zero value", async () => {
    const things = await garden.meta();
    expect(things["README"].value).toBeUndefined();
    expect(things["archived-thing"].value).toBe(0);
    expect(
      things["archive-linked"].links.find(
        (link) => (link.name = "archived-thing")
      )?.value
    ).toBe(0);
    expect(
      things["README"].links.find((link) => (link.name = "vocabulary"))?.value
    ).toBeUndefined();
  });

  it("should have wanted things", async () => {
    const things = await garden.meta();
    const wantedThings = findWantedThings(things, noNaturalLinks);
    expect(wantedThings).toStrictEqual(["wanted"]);
    expect(wantedThings[0]).toBe("wanted");
    const wantedNaturalThings = findWantedThings(things, naturalLinks);
    try {
      expect(wantedNaturalThings.length).toBe(2);
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
    const meta: MetaMap = {
      foo: {
        title: "foo",
        links: [
          { name: "explicit-link" },
          { name: NATURAL_LINK_SHARED, type: LinkType.NaturalTo },
          { name: NATURAL_LINK_ALONE, type: LinkType.NaturalTo },
        ],
      },
      bar: {
        title: "bar",
        links: [
          { name: "explicit-link", type: LinkType.NaturalTo },
          { name: NATURAL_LINK_SHARED, type: LinkType.NaturalTo },
          { name: "bar", type: LinkType.NaturalTo },
        ],
      },
    };
    expect(findUnwantedLinks(meta)).toStrictEqual([NATURAL_LINK_ALONE]);
  });
});
