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
    const thing = naturalProcess(
      "the principle, the practice, technique, or process may be good",
    );
    expect(linksOf(thing)).toStrictEqual([
      "principle",
      "practice",
      "technique",
      "process",
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
      "lightweight fun acme tool is an awesome small library",
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
        "what's up, are some of you over it?",
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
      linksOfText("wouldn't what's don't should've can't we'll we'd"),
    ).toHaveLength(0);
  });

  it("should handle semicolons", async () => {
    expect(
      linksOfText("current thinking; status quo; state of the nation"),
    ).toStrictEqual([
      "thinking",
      "current",
      "current-thinking",
      "status-quo",
      "state",
    ]);
  });

  it("should handle possesive apostrophe on trailing word", async () => {
    // wiki links are not passed into nlp, so "dog's
    // [[blanket]]" is processed as "dog's"
    expect(linksOfText("dog's")).toStrictEqual(["dog"]);
  });

  describe("extraordinary content", () => {
    it("should strip tables", () => {
      expect(linksOfText("| table with a word |")).toStrictEqual([
        "table",
        "word",
      ]);
    });

    it("should strip from a code block table", () => {
      expect(
        linksOfText(`|             |                  |
| --------------- | ---------------- |
| \`viWS+\`       | make a word bold |
| \`zR\`          | open all folds   |
| \`zM\`          | close all folds  |
| \`<space>+l\`   | Lint file        |
`),
      ).toStrictEqual([
        "word",
        "bold",
        "bold-word",
        "folds",
        "all",
        "all-folds",
        "lint-file",
      ]);
    });

    it("should not strip path elements", () => {
      expect(linksOfText("`dog/and/cat`")).toStrictEqual([]);
    });

    it("should strip symbols", () => {
      expect(
        linksOfText("⇒giraffe$elephant→tigger+lion*dog>cat~and-fish<"),
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

    it("should ignore markdown link uri", () => {
      expect(
        linksOfText("Dog and the [cat](./animals/some/) and the rabbit"),
      ).toStrictEqual(["dog", "cat", "rabbit"]);
    });

    it("should ignore one letter chracters", () => {
      expect(
        linksOfText("Dog, cat or rabbit and ctrl+e and ctrl+f and ctrl+n"),
      ).toStrictEqual(["dog", "cat", "rabbit"]);
    });
  });
});
