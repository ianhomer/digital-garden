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
      );

      expect(meta.title).toBe("My Name");
      expect(meta.links[0].name).toBe("wiki-link");
      expect(meta.links[1].name).toBe("my-link");
    });
  });

  describe("content without heading", () => {
    it("should take title from first line", () => {
      const meta = process(() => "My Name");
      expect(meta.title).toBe("My Name");
    });
  });

  describe("empty content", () => {
    it("should have explicit no title", () => {
      const meta = process(() => "");
      expect(meta.title).toBe("no title");
    });
  });

  describe("file", () => {
    it("should have title and links", () => {
      const meta = process(garden.thing("garden1/word/word-1.md").content);

      expect(meta.title).toBe("Word 1");
      expect(meta.links[0].name).toBe("word-2");
    });
  });
});
