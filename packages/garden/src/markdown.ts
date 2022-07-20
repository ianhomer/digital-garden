import { Meta } from "@garden/types";
import { Heading, Link, Literal } from "mdast";
import { toString } from "mdast-util-to-string";
import remarkParse from "remark-parse";
import remarkWikiLink from "remark-wiki-link";
import { unified } from "unified";
import { Node, Parent } from "unist";

import { naturalProcess } from "./nlp";

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

function getFirstValue(node: Node, filter = (node: Node) => !!node): string {
  return toString((node as Parent).children.filter(filter));
}

function getFrontText(node: Parent, filter = (node: Node) => !!node) {
  const firstParagraph = node.children.find((node) => node.type == "paragraph");
  if (firstParagraph) {
    return getFirstValue(firstParagraph, filter);
  }
  return null;
}

function extractTitle(node: Parent) {
  const firstHeading = node.children.find(
    (node) => node.type == "heading" && (node as Heading).depth == 1
  );
  if (!firstHeading) {
    return getFrontText(node) ?? "no title";
  }

  return getFirstValue(firstHeading);
}

function extractName(url: string) {
  const match = /([^/]*).md$/.exec(url);
  return match ? match[1] : url;
}

export function process(content: () => string): Meta {
  const document: Parent = parse(content);
  const explicitLinks = flatten(document)
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
    }));
  return {
    title: extractTitle(document),
    links: [
      ...explicitLinks,
      ...naturalProcess(
        getFrontText(document, (child) => child.type !== "wikiLink") ?? "",
        explicitLinks.map((link) => link.name)
      ).links,
    ],
  };
}
