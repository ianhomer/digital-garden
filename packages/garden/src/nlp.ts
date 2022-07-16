import { Link, LinkType } from "@garden/types";
import nlp from "compromise";

interface Noun {
  adjectives: string[];
  root: string;
}

interface Term {
  noun: Noun;
}

export interface NaturalThing {
  links: Link[];
}

const strip = (text: string) =>
  text.trim().replace(/\s/g, "-").replace(/[._]/g, "");

const unique = (value: string, index: number, self: string[]) =>
  self.indexOf(value) === index;

export function naturalProcess(content: string, excludes: string[] = []) {
  const document = nlp(content);
  const links: Link[] = document
    .nouns()
    .toLowerCase()
    .json()
    .map((term: Term) => {
      const root = strip(term.noun.root);
      if (term.noun.adjectives.length == 0) {
        return root;
      }
      if (!root) {
        return term.noun.adjectives.map((adjective) => strip(adjective));
      }
      return [
        root,
        ...term.noun.adjectives.map((adjective) => strip(adjective)),
        ...term.noun.adjectives.map((adjective) =>
          [strip(adjective), root].join("-")
        ),
      ];
    })
    .flat()
    .filter((name: string) => !excludes.includes(name))
    .filter(unique)
    .map((name: string) => ({ name, type: LinkType.NaturalTo }));
  return { links };
}
