import { createGarden } from "./garden";

const garden = createGarden({
  directory: "./src/test/content",
});

it("should create garden", () => {
  expect(garden.config.directory).toBe("./src/test/content");
});

it("should create meta", async () => {
  const meta = await garden.meta();
  expect(Object.keys(meta).length).toBe(8);
  const wordThing = meta["word"];
  expect(wordThing.title).toBe("Word");
  expect(wordThing.links[0].name).toBe("vocabulary");
});

it("should get backlinks", async () => {
  const things = await garden.meta();
  const backLinks = garden.findBackLinks(things, "word-2");
  expect(backLinks[0].name).toBe("word-1");
});

it("should get deep links", async () => {
  const things = await garden.meta();
  const deepLinks = garden.findDeepLinks(things, "word-2", 3);
  expect(deepLinks.length).toBe(3);
});

it.skip("should refresh meta", async () => {
  await garden.refresh().then(async () => {
    const meta = await garden.load();
    expect(Object.keys(meta).length).toBe(6);
  });
});
