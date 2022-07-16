import { interpret } from "./nlp";

const AWESOME_LIBRARY = "awesome library";
const SMALL_LIBRARY = "small library";

describe("natural language processing", () => {
  it("should find nouns", async () => {
    const thing = interpret("this is a library");
    expect(thing.referencedThings).toStrictEqual(["library"]);
  });

  it("should find noun with adjective", async () => {
    const thing = interpret("this is an awesome library");
    expect(thing.referencedThings).toStrictEqual([
      "library",
      "awesome",
      AWESOME_LIBRARY,
    ]);
  });

  it("should find noun with adjectives", async () => {
    const thing = interpret("this is an awesome small library");
    expect(thing.referencedThings).toStrictEqual([
      "library",
      "awesome",
      "small",
      AWESOME_LIBRARY,
      SMALL_LIBRARY,
    ]);
  });

  it("should find nouns with adjectives", async () => {
    const thing = interpret(
      "lightweight fun acme tool is an awesome small library"
    );
    expect(thing.referencedThings).toStrictEqual([
      "acme tool",
      "lightweight",
      "fun",
      "lightweight acme tool",
      "fun acme tool",
      "library",
      "awesome",
      "small",
      AWESOME_LIBRARY,
      SMALL_LIBRARY,
    ]);
  });

  it("should find nouns with adjectives with chatter", async () => {
    const thing = interpret(
      "hello, lightweight fun acme tool is, yeah,  an awesome small library, what's up?"
    );
    expect(thing.referencedThings).toStrictEqual([
      "acme tool",
      "lightweight",
      "fun",
      "lightweight acme tool",
      "fun acme tool",
      "library",
      "awesome",
      "small",
      AWESOME_LIBRARY,
      SMALL_LIBRARY,
    ]);
  });
});
