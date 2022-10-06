import { Link, LinkType } from "@garden/types";
import nlp from "compromise";
import Three from "compromise/types/view/three";

import { unique } from "./common";

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

// Return aarray of aliases for words
export function naturalAliases(name: string): string[] {
  const one = nlp(name);
  return [
    ...nlp(one.nouns().isPlural().text()).nouns().toSingular().out("array"),
    ...nlp(one.verbs().text()).verbs().toInfinitive().out("array"),
  ];
}

export function naturalProcess(content: string, excludes: string[] = []) {
  const document = nlp(content);
  const enhancedExcludes = [...excludes, "", ",", "s", "ing"];
  const links: Link[] = (document.not("#Pronoun") as Three)
    .nouns()
    .toLowerCase()
    .json()
    .map((term: Term) => {
      const rawRoot = strip(term.noun.root);
      const root = rawRoot.replace(/,/g, "");
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
    .filter((name: string) => !enhancedExcludes.includes(name))
    .filter(unique)
    .map((name: string) => ({ name, type: LinkType.NaturalTo }));
  return { links };
}
