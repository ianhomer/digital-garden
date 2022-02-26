import {
  createGarden,
  findKnownThings,
  findLinkedThings,
  findWantedThings,
} from "./garden";

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

it("should get know things", async () => {
  const things = await garden.meta();
  const knownThings = findKnownThings(things);
  expect(knownThings.length).toBe(8);
});

it("should get linked things", async () => {
  const things = await garden.meta();
  const linkedThings = findLinkedThings(things);
  expect(linkedThings.length).toBe(6);
});

it("should get wanted things", async () => {
  const things = await garden.meta();
  const wantedThings = findWantedThings(things);
  expect(wantedThings.length).toBe(1);
  expect(wantedThings[0]).toBe("wanted");
});

it("should get deep links", async () => {
  const things = await garden.meta();
  const deepLinks = garden.findDeepLinks(things, "word-2", 3);
  expect(deepLinks.length).toBe(4);
});

it.skip("should refresh meta", async () => {
  await garden.refresh().then(async () => {
    const meta = await garden.load();
    expect(Object.keys(meta).length).toBe(6);
  });
});
