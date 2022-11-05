import { Link } from "@garden/types";

import { naturalAliases, naturalProcess, NaturalThing, preStrip } from "./nlp";
import { toRawUnicode } from "./test-helpers";

const AWESOME_LIBRARY = "awesome-library";
const SMALL_LIBRARY = "small-library";

const linksOf = (thing: NaturalThing) =>
  thing.links.map((link: Link) => link.name);

const linksOfText = (text: string) => linksOf(naturalProcess(text));

describe("natural language processing", () => {
  it("should find nouns", async () => {
    expect(linksOfText("this is a library")).toStrictEqual(["library"]);
    expect(linksOfText("dog, cat, and fish")).toStrictEqual([
      "dog",
      "cat",
      "fish",
    ]);
  });

  it("should find noun with adjective", async () => {
    const thing = naturalProcess("this is an awesome library");
    expect(linksOf(thing)).toStrictEqual([
      "library",
      "awesome",
      AWESOME_LIBRARY,
    ]);
  });

  it("should extract list of things", async () => {
    const thing = naturalProcess("principle, practice, technique, or process");
    expect(linksOf(thing)).toStrictEqual([
      "principle",
      "practice",
      "technique",
    ]);
  });

  it("should find noun with adjectives", async () => {
    const thing = naturalProcess("this is an awesome small library");
    expect(linksOf(thing)).toStrictEqual([
      "library",
      "awesome",
      "small",
      AWESOME_LIBRARY,
      SMALL_LIBRARY,
    ]);
  });

  it("should find nouns with adjectives", async () => {
    const thing = naturalProcess(
      "lightweight fun acme tool is an awesome small library"
    );
    expect(linksOf(thing)).toStrictEqual([
      "acme-tool",
      "lightweight",
      "fun",
      "lightweight-acme-tool",
      "fun-acme-tool",
      "library",
      "awesome",
      "small",
      AWESOME_LIBRARY,
      SMALL_LIBRARY,
    ]);
  });

  it("should find nouns with adjectives with chatter", async () => {
    const thing = naturalProcess(
      "hello you, lightweight fun acme tool is, yeah,  an awesome small library, " +
        "what's up, are some of you over it?"
    );
    expect(linksOf(thing)).toStrictEqual([
      "acme-tool",
      "lightweight",
      "fun",
      "lightweight-acme-tool",
      "fun-acme-tool",
      "library",
      "awesome",
      "small",
      AWESOME_LIBRARY,
      SMALL_LIBRARY,
    ]);
  });

  it("should find double nouns", async () => {
    const thing = naturalProcess("a book by sideshow bob on wish list");
    expect(linksOf(thing)).toStrictEqual(["book", "sideshow-bob", "wish-list"]);
  });

  it("should not create a link to excluded words", async () => {
    const thing = naturalProcess(`, a bag is s and ing the dog`);
    expect(linksOf(thing)).toStrictEqual(["bag", "dog"]);
  });

  it("should find singulars", async () => {
    expect(naturalAliases("words")).toStrictEqual(["word"]);
    expect(naturalAliases("word")).toStrictEqual([]);
    expect(naturalAliases("lists")).toStrictEqual(["list"]);
  });

  it("should find contractions", async () => {
    expect(
      linksOfText("wouldn't what's don't should've can't we'll we'd")
    ).toHaveLength(0);
  });

  describe("extraordinary content", () => {
    it("should strip tables", () => {
      expect(linksOfText("| table with a word |")).toStrictEqual([
        "table",
        "word",
      ]);
    });

    it("should strip path elements", () => {
      expect(linksOfText("`dog/and/cat`")).toStrictEqual(["dog", "cat"]);
    });

    it("should strip symbols", () => {
      expect(
        linksOfText("⇒giraffe$elephant→tigger+lion*dog>cat~and-fish<")
      ).toStrictEqual([
        "giraffe",
        "elephant",
        "tigger",
        "lion",
        "dog",
        "cat",
        "fish",
      ]);
    });

    it("should handle alternative stops", () => {
      expect(linksOfText("dog:cat")).toStrictEqual(["dog", "cat"]);
    });

    it("should handle brackets", () => {
      expect(linksOfText("(dog) cat")).toStrictEqual(["dog", "cat"]);
    });

    it("should ignore quotes", () => {
      expect(linksOfText('"dog", and cat')).toStrictEqual(["dog", "cat"]);
    });

    it("should handle arrows", () => {
      expect(linksOfText("Single character arrows ⇒ → ← ⇐")).toStrictEqual([
        "character-arrows",
        "single",
        "single-character-arrows",
      ]);
    });

    it("should handle unicode variation selectors", () => {
      expect(linksOfText("⇒ dog ⇐ ٍ")).toStrictEqual(["dog"]);
    });

    it("should handle unicode variation selectors", () => {
      expect(linksOfText("⇒ dog ⇐ ٍcat")).toStrictEqual(["dog", "cat"]);
    });

    it("should strip special characters", () => {
      const text = "⇒ dog ⇐ ٍcat";
      const stripped = preStrip(text);
      const rawUnicodeStripped = toRawUnicode(stripped);
      expect(rawUnicodeStripped).toBe("dog, cat");
      expect(stripped).toBe("dog, cat");
    });

    it("should handle multiple spaces", () => {
      expect(linksOfText("dog  cat")).toStrictEqual(["dog-cat"]);
      expect(linksOfText("dog   cat")).toStrictEqual(["dog-cat"]);
    });

    it("should strip symbols with space", () => {
      expect(linksOfText("⇒ → dog ← ⇐")).toStrictEqual(["dog"]);
    });

    it("should handle question in quote", () => {
      expect(linksOfText("'Got a technical question?'")).toStrictEqual([
        "question",
        "technical",
        "technical-question",
      ]);
    });
  });
});
