import nlp from "compromise";

interface Noun {
  adjectives: string[];
  root: string;
}

interface Term {
  noun: Noun;
}

export function interpret(content: string) {
  const document = nlp(content);
  const things = document
    .nouns()
    .json()
    .map((term: Term) => {
      if (term.noun.adjectives.length == 0) {
        return term.noun.root;
      }
      return [
        term.noun.root,
        ...term.noun.adjectives,
        ...term.noun.adjectives.map((adjective) =>
          [adjective, term.noun.root].join(" ")
        ),
      ];
    })
    .flat();
  return { referencedThings: things };
}
