import { Garden } from "./garden";
import { createThing, getMeta } from "./thing";

const garden: Garden = {
  config: {
    directory: "./src/test/content/",
  },
};

it("gets base meta", () => {
  const meta = getMeta(createThing(garden, "garden/my-name.md"));
  expect(meta.name).toBe("my-name");
});

it.skip("gets base link", () => {
  const meta = getMeta(createThing(garden, "garden1/word/word-1"));
  expect(meta.name).toBe("word-1");
  expect(meta.links[0].to).toBe("word-2");
});
