import remarkParse from "remark-parse";
import remarkWikiLink from "remark-wiki-link";
import { unified } from "unified";

import { Meta } from "./meta";
import { Thing } from "./thing";

export function parse(thing: Thing) {
  return unified()
    .use(remarkWikiLink, {
      hrefTemplate: (permalink: string) => `${permalink}`,
    })
    .use(remarkParse)
    .parse(thing.content());
}

function allChildren(node) {
  const children = node.children;
  return children
    ? [...children, ...children.map((child) => allChildren(child)).flat()]
    : [];
}

export function process(thing: Thing): Meta {
  const document = parse(thing);
  return {
    name: thing.name,
    links: allChildren(document)
      .filter((node) => node.type === "wikiLink")
      .map((link) => {
        return { to: link.value };
      }),
  };
}
