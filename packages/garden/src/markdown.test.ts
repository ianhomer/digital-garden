import { Link, LinkType } from "@garden/types";

import { createGarden } from "./garden";
import { parse, toMultipleThingMeta } from "./markdown";
import { gardenConfig } from "./test-helpers";

const garden = createGarden(gardenConfig);

const toName = (link: Link) => link.name;
const justNaturalLinks = (link: Link) => link.type === LinkType.ImplicitTo;

describe("markdown", () => {
  describe("basic content", () => {
    it("should parse OK", async () => {
      const sections = await parse(async () => ({
        body: "# My Name",
        hidden: false,
      }));

      expect(sections).toHaveLength(1);
      expect(sections[0].title).toBe("My Name");
    });

    it("should have title and links", async () => {
      const meta = (
        await toMultipleThingMeta(
          garden.repository.toThing("my-name", async () => ({
            body: "# My Name\n\n[[wiki-link]] [link](./my-link.md)",
            hidden: false,
          })),
        )
      )[0];

      expect(meta.title).toBe("My Name");
      expect(meta.links[0].name).toBe("wiki-link");
      expect(meta.links[1].name).toBe("my-link");
    });

    it("should have sections", async () => {
      const meta = await toMultipleThingMeta(
        garden.repository.toThing("my-name", async () => ({
          body:
            "# My Name\n\n[[top-wiki-link]]\n\n" +
            "## My heading\n\nSection content [[child-section-link]]",
          hidden: false,
        })),
      );

      expect(meta[0].title).toBe("My Name");
      expect(meta[0].links).toHaveLength(2);
    });

    it("should not extract links from explicit links", async () => {
      const meta = (
        await toMultipleThingMeta(
          garden.repository.toThing("mock", async () => ({
            body: "# Mock\n\nA [[one-day-maybe]]",
            hidden: false,
          })),
        )
      )[0];
      expect(meta.links).toStrictEqual([
        { name: "one-day-maybe", type: "to", value: 1 },
      ]);
    });

    it("should extra meaning from elements in relative link", async () => {
      const meta = (
        await toMultipleThingMeta(
          garden.repository.toThing("title", async () => ({
            body: "# Title\n\nLion, [dog](./animals/mammals/canine/)",
            hidden: false,
          })),
        )
      )[0];
      expect(meta.links.map(toName)).toStrictEqual(["canine", "lion", "dog"]);
    });

    it("should not extra meaning from wiki links and URIs", async () => {
      const meta = (
        await toMultipleThingMeta(
          garden.repository.toThing("title", async () => ({
            body:
              "# Title\n\nLion and [[giraffe]] <https://cat.com> and " +
              "[dog](https://animal.com)",
            hidden: false,
          })),
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
      const meta = (
        await toMultipleThingMeta(
          garden.repository.toThing("my-name", async () => ({
            body: "My Name",
            hidden: false,
          })),
        )
      )[0];
      expect(meta.title).toBe("My Name");
    });
  });

  describe("empty content", () => {
    it("should have explicit no title", async () => {
      const meta = await toMultipleThingMeta(
        garden.repository.toThing("null", async () => ({
          body: "",
          hidden: false,
        })),
      );
      expect(meta).toHaveLength(1);
      expect(meta[0].title).toBe("no title");
    });
  });

  describe("file", () => {
    it("should have title and links", async () => {
      const meta = (
        await toMultipleThingMeta(garden.thing("garden1/word/word-1.md"))
      )[0];
      expect(meta.title).toBe("Word 1");
      expect(meta.links).toContainEqual({
        name: "word-2",
        type: "to",
        value: 1,
      });
      expect(meta.links).toContainEqual({
        name: "natural-word",
        type: LinkType.ImplicitTo,
        value: 1,
      });
    });
  });

  describe("file with basic frontmatter", () => {
    it("should have title", async () => {
      const meta = await toMultipleThingMeta(
        garden.thing("garden1/frontmatter/frontmatter.md"),
      );

      expect(meta).toHaveLength(1);
      expect(meta[0].title).toBe("Frontmatter");
    });
  });

  describe("file with frontmatter with no content", () => {
    it("should have no title", async () => {
      const meta = await toMultipleThingMeta(
        garden.thing("garden1/frontmatter/frontmatter-with-no-content.md"),
      );

      expect(meta).toHaveLength(1);
      expect(meta[0].title).toBe("no title");
    });
  });

  describe("file with frontmatter with tags", () => {
    it("should have no title", async () => {
      const meta = await toMultipleThingMeta(
        garden.thing("garden1/frontmatter/frontmatter-with-tags.md"),
      );

      expect(meta).toHaveLength(1);
      expect(meta[0].title).toBe("Frontmatter with tags");
    });
  });
});
