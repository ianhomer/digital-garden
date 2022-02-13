import { createGarden } from "./garden";

const garden = createGarden({
  directory: "./src/test/content",
});

it("should create garden", () => {
  expect(garden.config.directory).toBe("./src/test/content");
});

it("should create meta", async () => {
  const meta = await garden.meta();
  expect(Object.keys(meta).length).toBe(5);
  const wordThing = meta["word"];
  expect(wordThing.title).toBe("Word");
  expect(wordThing.links[0].to).toBe("vocabulary");
});
