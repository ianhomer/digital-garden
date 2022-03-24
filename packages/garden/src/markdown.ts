import { Meta } from "@garden/types";
import { Link, Literal } from "mdast";
import remarkParse from "remark-parse";
import remarkWikiLink from "remark-wiki-link";
import { unified } from "unified";
import { Node, Parent } from "unist";

export function parse(content: () => string) {
  return unified()
    .use(remarkWikiLink, {
      hrefTemplate: (permalink: string) => `${permalink}`,
    })
    .use(remarkParse)
    .parse(content());
}

function flatten(node: Parent): Node[] {
  const children = node.children;
  return children
    ? [...children, ...children.map((child) => flatten(child as Parent)).flat()]
    : [];
}

function extractTitle(node: Parent) {
  const firstNode = node.children[0];
  if (!firstNode) {
    return "no title";
  }
  if (!(firstNode as Parent).children) {
    return (firstNode as Literal).value;
  }
  return ((firstNode as Parent).children[0] as Literal).value;
}

function extractName(url: string) {
  const match = /([^/]*).md$/.exec(url);
  return match ? match[1] : url;
}

export function process(content: () => string): Meta {
  const document: Parent = parse(content);
  return {
    title: extractTitle(document),
    links: flatten(document)
      .filter(
        (node) =>
          node.type === "wikiLink" ||
          (node.type === "link" && (node as Link).url.startsWith("./"))
      )
      .map((link) => ({
        name:
          link.type === "wikiLink"
            ? (link as Literal).value.toLowerCase()
            : extractName((link as Link).url),
      })),
  };
}
