import { Link, LinkType } from "@garden/types";

import { createGarden } from "./garden";
import { parse, toMultipleThingMeta } from "./markdown";
import { gardenConfig } from "./test-helpers";

const garden = createGarden(gardenConfig);

const toName = (link: Link) => link.name;
const justNaturalLinks = (link: Link) => link.type == LinkType.NaturalTo;

describe("markdown", () => {
  describe("basic content", () => {
    it("should parse OK", async () => {
      const sections = await parse(async () => "# My Name");

      expect(sections).toHaveLength(1);
      expect(sections[0].title).toBe("My Name");
    });

    it("should have title and links", async () => {
      const meta = (
        await toMultipleThingMeta(
          async () => "# My Name\n\n[[wiki-link]] [link](./my-link.md)"
        )
      )[0];

      expect(meta.title).toBe("My Name");
      expect(meta.links[0].name).toBe("wiki-link");
      expect(meta.links[1].name).toBe("my-link");
    });

    it("should have sections", async () => {
      const meta = await toMultipleThingMeta(
        async () =>
          "# My Name\n\n[[top-wiki-link]]\n\n" +
          "## My heading\n\nSection content [[child-section-link]]"
      );

      expect(meta[0].title).toBe("My Name");
      expect(meta[0].links).toHaveLength(2);
    });

    it("should not extract links from explicit links", async () => {
      const meta = (
        await toMultipleThingMeta(async () => "# Mock\n\nA [[one-day-maybe]]")
      )[0];
      expect(meta.links).toStrictEqual([{ name: "one-day-maybe" }]);
    });

    it("should not extra meaning from wiki links and URIs", async () => {
      const meta = (
        await toMultipleThingMeta(
          async () =>
            "# Title\n\nLion and [[giraffe]] <https://cat.com> and " +
            "[dog](https://animal.com)"
        )
      )[0];
      expect(meta.links.filter(justNaturalLinks).map(toName)).toStrictEqual([
        "lion",
        "dog",
      ]);
    });
  });

  describe("content without heading", () => {
    it("should take title from first line", async () => {
      const meta = (await toMultipleThingMeta(async () => "My Name"))[0];
      expect(meta.title).toBe("My Name");
    });
  });

  describe("empty content", () => {
    it("should have explicit no title", async () => {
      const meta = await toMultipleThingMeta(async () => "");
      expect(meta).toHaveLength(1);
      expect(meta[0].title).toBe("no title");
    });
  });

  describe("file", () => {
    it("should have title and links", async () => {
      const meta = (
        await toMultipleThingMeta(
          garden.thing("garden1/word/word-1.md").content
        )
      )[0];
      expect(meta.title).toBe("Word 1");
      expect(meta.links).toContainEqual({ name: "word-2" });
      expect(meta.links).toContainEqual({
        name: "natural-word",
        type: LinkType.NaturalTo,
        value: 1,
      });
    });
  });

  describe("file with frontmatter", () => {
    it("should have title", async () => {
      const meta = await toMultipleThingMeta(
        garden.thing("garden1/frontmatter.md").content
      );

      expect(meta).toHaveLength(1);
      expect(meta[0].title).toBe("Frontmatter");
    });
  });

  describe("file with frontmatter with no content", () => {
    it("should have no title", async () => {
      const meta = await toMultipleThingMeta(
        garden.thing("garden1/frontmatter-with-no-content.md").content
      );

      expect(meta).toHaveLength(1);
      expect(meta[0].title).toBe("no title");
    });
  });
});
