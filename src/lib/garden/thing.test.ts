import { Garden } from "./garden";
import { getMeta } from "./thing";

const garden: Garden = {
  config: {
    directory: "../../test/content/",
  },
};

it("gets base meta", () => {
  const meta = getMeta(garden, { name: "my-name", filename: "not-set" });
  expect(meta.name).toBe("my-name");
});

it.skip("gets base link", () => {
  const meta = getMeta(garden, {
    name: "word-1",
    filename: "garden1/word/word-1",
  });
  expect(meta.name).toBe("word-1");
  expect(meta.links[0].to).toBe("word-2");
});
