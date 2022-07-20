import { Link } from "@garden/types";

import { naturalProcess, NaturalThing } from "./nlp";

const AWESOME_LIBRARY = "awesome-library";
const SMALL_LIBRARY = "small-library";

const linksOf = (thing: NaturalThing) =>
  thing.links.map((link: Link) => link.name);

describe("natural language processing", () => {
  it("should find nouns", async () => {
    const thing = naturalProcess("this is a library");
    expect(linksOf(thing)).toStrictEqual(["library"]);
  });

  it("should find noun with adjective", async () => {
    const thing = naturalProcess("this is an awesome library");
    expect(linksOf(thing)).toStrictEqual([
      "library",
      "awesome",
      AWESOME_LIBRARY,
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
});
