import { Garden } from "./garden";
import { parse, process } from "./markdown";
import { createThing } from "./thing";

const garden: Garden = {
  config: {
    directory: "./src/test/content/",
  },
};

it("should parse OK", () => {
  const tree = parse({
    name: "my-name",
    content: () => "# My Name",
  });

  expect(tree.type).toBe("root");
  expect(tree.children[0].type).toBe("heading");
});

it("should process OK", () => {
  const meta = process({
    name: "my-name",
    content: () => "# My Name\n\n[[my-link]]",
  });

  expect(meta.title).toBe("My Name");
  expect(meta.links[0].to).toBe("my-link");
});

it("file thing should process OK", () => {
  const meta = process(createThing(garden, "garden1/word/word-1.md"));

  expect(meta.title).toBe("Word 1");
  expect(meta.links[0].to).toBe("word-2");
});
