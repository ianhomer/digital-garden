import { Meta } from "@garden/types";
import remarkParse from "remark-parse";
import remarkWikiLink from "remark-wiki-link";
import { unified } from "unified";

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

function extractName(url: string) {
  const match = /([^/]*).md$/.exec(url);
  return match ? match[1] : url;
}

export function process(content: () => string): Meta {
  const document = parse(content);
  return {
    title: extractTitle(document),
    links: flatten(document)
      .filter(
        (node) =>
          node.type === "wikiLink" ||
          (node.type === "link" && node.url.startsWith("./"))
      )
      .map((link) => ({
        name:
          link.type === "wikiLink"
            ? link.value.toLowerCase()
            : extractName(link.url),
      })),
  };
}
