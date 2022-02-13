import { createGarden, Garden } from "./garden";
import { parse, process } from "./markdown";

const garden = createGarden({
  directory: "./src/test/content/",
});

it("should parse OK", () => {
  const tree = parse(() => "# My Name");

  expect(tree.type).toBe("root");
  expect(tree.children[0].type).toBe("heading");
});

it("should process OK", () => {
  const meta = process(() => "# My Name\n\n[[my-link]]");

  expect(meta.title).toBe("My Name");
  expect(meta.links[0].to).toBe("my-link");
});

it("file thing should process OK", () => {
  const meta = process(garden.thing("garden1/word/word-1.md").content);

  expect(meta.title).toBe("Word 1");
  expect(meta.links[0].to).toBe("word-2");
});
