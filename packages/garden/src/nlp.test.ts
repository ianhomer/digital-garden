import { interpret } from "./nlp";

describe("natural language processing", () => {
  it("should find nouns", async () => {
    const thing = interpret("this is a library");
    expect(thing.referencedThings).toStrictEqual(["library"]);
  });
});

describe("natural language processing", () => {
  it("should find nouns", async () => {
    const thing = interpret("this is an awesome library");
    expect(thing.referencedThings).toStrictEqual([
      "library",
      "awesome",
      "awesome library",
    ]);
  });
});
