import { createGarden } from "./garden";
import { parse, process } from "./markdown";

const garden = createGarden({
  directory: "../test-gardens/content",
});

describe("garden markdown", () => {
  it("should parse OK", () => {
    const tree = parse(() => "# My Name");

    expect(tree.type).toBe("root");
    expect(tree.children[0].type).toBe("heading");
  });

  it("content should process OK", () => {
    const meta = process(
      () => "# My Name\n\n[[wiki-link]] [link](./my-link.md)"
    );

    expect(meta.title).toBe("My Name");
    expect(meta.links[0].name).toBe("wiki-link");
    expect(meta.links[1].name).toBe("my-link");
  });

  it("file thing should process OK", () => {
    const meta = process(garden.thing("garden1/word/word-1.md").content);

    expect(meta.title).toBe("Word 1");
    expect(meta.links[0].name).toBe("word-2");
  });
});
