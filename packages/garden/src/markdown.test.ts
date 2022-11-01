import { LinkType } from "@garden/types";

import { createGarden } from "./garden";
import { parse, process } from "./markdown";
import { gardenConfig } from "./test-helpers";

const garden = createGarden(gardenConfig);

describe("markdown", () => {
  describe("basic content", () => {
    it("should parse OK", () => {
      const tree = parse(() => "# My Name");

      expect(tree.type).toBe("root");
      expect(tree.children[0].type).toBe("heading");
    });

    it("should have title and links", () => {
      const meta = process(
        () => "# My Name\n\n[[wiki-link]] [link](./my-link.md)"
      )[0];

      expect(meta.title).toBe("My Name");
      expect(meta.links[0].name).toBe("wiki-link");
      expect(meta.links[1].name).toBe("my-link");
    });

    it.skip("should have sections", () => {
      const meta = process(
        () =>
          "# My Name\n\n[[top-wiki-link]]\n\n" +
          "## My heading\n\nSection content [[child-section-link]]"
      );

      expect(meta[0].title).toBe("My Name");
      expect(meta[0].links).toHaveLength(1);
    });

    it("should not extract links from explicit links", () => {
      const meta = process(() => "# Mock\n\nA [[one-day-maybe]]")[0];
      expect(meta.links).toStrictEqual([{ name: "one-day-maybe" }]);
    });
  });

  describe("content without heading", () => {
    it("should take title from first line", () => {
      const meta = process(() => "My Name")[0];
      expect(meta.title).toBe("My Name");
    });
  });

  describe("empty content", () => {
    it("should have explicit no title", () => {
      const meta = process(() => "")[0];
      expect(meta.title).toBe("no title");
    });
  });

  describe("file", () => {
    it("should have title and links", () => {
      const meta = process(garden.thing("garden1/word/word-1.md").content)[0];
      expect(meta.title).toBe("Word 1");
      expect(meta.links).toContainEqual({ name: "word-2" });
      expect(meta.links).toContainEqual({
        name: "natural-word",
        type: LinkType.NaturalTo,
      });
    });
  });

  describe("file with frontmatter", () => {
    it("should have title", () => {
      const meta = process(garden.thing("garden1/frontmatter.md").content)[0];

      expect(meta.title).toBe("Frontmatter");
    });
  });

  describe("file with frontmatter with no content", () => {
    it("should have no title", () => {
      const meta = process(
        garden.thing("garden1/frontmatter-with-no-content.md").content
      )[0];

      expect(meta.title).toBe("no title");
    });
  });
});
