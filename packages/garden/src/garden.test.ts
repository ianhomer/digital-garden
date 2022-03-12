import {
  createGarden,
  findKnownThings,
  findLinkedThings,
  findWantedThings,
} from "./garden";

const garden = createGarden({
  directory: "../test-gardens/content",
});

it("should create garden", () => {
  expect(garden.config.directory).toBe("../test-gardens/content");
});

it("should create meta", async () => {
  const meta = await garden.meta();
  expect(Object.keys(meta).length).toBe(11);
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
  expect(knownThings.length).toBe(11);
});

it("should get linked things", async () => {
  const things = await garden.meta();
  const linkedThings = findLinkedThings(things);
  expect(linkedThings).toContain("word-2");
  expect(linkedThings).toContain("word-3");
  expect(linkedThings.length).toBe(6);
});

it("should have zero value", async () => {
  const things = await garden.meta();
  expect(things["archived-thing"].value).toBe(0);
  expect(
    things["archive-linked"].links.find(
      (link) => (link.name = "archived-thing")
    ).value
  ).toBe(0);
});

it("should get wanted things", async () => {
  const things = await garden.meta();
  const wantedThings = findWantedThings(things);
  expect(wantedThings.length).toBe(1);
  expect(wantedThings[0]).toBe("wanted");
});

it.skip("should refresh meta", async () => {
  await garden.refresh().then(async () => {
    const meta = await garden.load();
    expect(Object.keys(meta).length).toBe(6);
  });
});
