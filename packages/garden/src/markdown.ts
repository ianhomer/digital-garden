import { Meta } from "@garden/types";
import { Heading, Link, Literal } from "mdast";
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

function getFirstValue(node: Node): string {
  return ((node as Parent).children[0] as Literal).value;
}

function extractTitle(node: Parent) {
  const firstHeading = node.children.find(
    (node) => node.type == "heading" && (node as Heading).depth == 1
  );
  if (!firstHeading) {
    const firstParagraph = node.children.find(
      (node) => node.type == "paragraph"
    );
    if (firstParagraph) {
      return getFirstValue(firstParagraph);
    }
    return "no title";
  }

  return getFirstValue(firstHeading);
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
