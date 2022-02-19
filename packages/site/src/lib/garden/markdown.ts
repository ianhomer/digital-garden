import remarkParse from "remark-parse";
import remarkWikiLink from "remark-wiki-link";
import { unified } from "unified";

import { Meta } from "./meta";

export function parse(content: () => string) {
  return unified()
    .use(remarkWikiLink, {
      hrefTemplate: (permalink: string) => `${permalink}`,
    })
    .use(remarkParse)
    .parse(content());
}

function flatten(node) {
  const children = node.children;
  return children
    ? [...children, ...children.map((child) => flatten(child)).flat()]
    : [];
}

function extractTitle(node) {
  const firstNode = node.children[0];
  if (!firstNode) {
    return "no title";
  }
  if (!firstNode.children) {
    return firstNode.value;
  }
  return firstNode.children[0].value;
}

export function process(content: () => string): Meta {
  const document = parse(content);
  return {
    title: extractTitle(document),
    links: flatten(document)
      .filter((node) => node.type === "wikiLink")
      .map((link) => {
        return { to: link.value };
      }),
  };
}
