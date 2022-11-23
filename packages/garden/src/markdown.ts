import { linkResolver } from "@garden/core";
import { LinkType, Meta, ThingType } from "@garden/types";
import { Heading, Link, Literal } from "mdast";
import { toString } from "mdast-util-to-string";
import remarkParse from "remark-parse";
import remarkWikiLink from "remark-wiki-link";
import { unified } from "unified";
import { Data, Node, Parent } from "unist";

import { naturalProcess } from "./nlp";

interface Section {
  children: Node<Data>[];
  sections: Section[];
  depth: number;
  title: string;
}

function toSections(root: Parent) {
  const sections: Section[] = [
    { children: [], sections: [], depth: 1, title: "title-not-set" },
  ];
  let sectionCount = 1;
  let depth = 1;
  let foundHeading1 = false;
  let skip;
  const sectionStack: Section[] = new Array<Section>(6);
  sectionStack[0] = sections[0];
  root.children.forEach((node) => {
    skip = false;
    if ("depth" in node) {
      if ((node as Heading).depth > 1) {
        if (foundHeading1) {
          sectionCount++;
          depth = (node as Heading).depth;
        } else {
          skip = true;
        }
      } else {
        depth = 1;
        foundHeading1 = true;
      }
    }
    while (sections.length < sectionCount) {
      const section = {
        children: [],
        sections: [],
        depth,
        title: "section-title-not-set",
      };
      sections.push(section);
      sectionStack[depth - 1] = section;
      if (depth > 1) {
        const parentSection = sectionStack[depth - 2];
        if (parentSection) {
          parentSection.sections.push(section);
        }
      }
    }
    const section = depth == 1 ? sections[0] : sections[sectionCount - 1];
    if (!skip) {
      section.children.push(node);
    }
  });

  sections.forEach((section) => (section.title = extractTitle(section)));
  return sections;
}

export async function parse(content: () => Promise<string>) {
  const root: Parent = unified()
    .use(remarkWikiLink, {
      hrefTemplate: (permalink: string) => `${permalink}`,
    })
    .use(remarkParse)
    .parse(await content());

  return toSections(root);
}

function flattenParent(parent: Parent): Node[] {
  const children = parent.children;
  return children
    ? [
        ...children,
        ...children.map((child) => flattenParent(child as Parent)).flat(),
      ]
    : [];
}

function flatten(section: Section): Node[] {
  const children = section.children;
  return children
    ? [
        ...children,
        ...children.map((child) => flattenParent(child as Parent)).flat(),
      ]
    : [];
}

const isAngleBracketLink = (node: Node) =>
  node.type === "link" &&
  (node as Link).url === ((node as Parent).children[0] as Literal).value;

const isWikiLink = (node: Node) => node.type === "wikiLink";

const justTextNodes = (node: Node) => !!node && !isAngleBracketLink(node);

const justTextNodesWithoutWikiLinks = (node: Node) =>
  !!node && !isWikiLink(node) && !isAngleBracketLink(node);

function getFirstValue(node: Node, filter: (node: Node) => boolean): string {
  return toString((node as Parent).children.filter(filter));
}

function getFrontText(node: Section, filter: (node: Node) => boolean) {
  const firstParagraph = node.children.find((node) => node.type == "paragraph");
  if (firstParagraph) {
    return getFirstValue(firstParagraph, filter);
  }
  return null;
}

function extractTitle(node: Section) {
  const firstHeading = node.children.find((node) => node.type == "heading");
  if (!firstHeading) {
    return getFrontText(node, justTextNodes) ?? "no title";
  }

  return getFirstValue(firstHeading, justTextNodes);
}

function extractName(url: string) {
  const match = /([^/]*).md$/.exec(url);
  return match ? match[1] : url;
}

export async function toMultipleThingMeta(
  content: () => Promise<string>
): Promise<Meta[]> {
  const sections = await parse(content);
  return sections.map((section) => toSingleThingMeta(section));
}

function toSingleThingMeta(section: Section): Meta {
  const explicitLinks = flatten(section)
    .filter(
      (node) =>
        node.type === "wikiLink" ||
        (node.type === "link" && (node as Link).url.startsWith("./"))
    )
    .map((link) => ({
      name:
        link.type === "wikiLink"
          ? linkResolver((link as Literal).value)
          : extractName((link as Link).url),
    }));
  return {
    title: section.title,
    type: section.depth > 1 ? ThingType.Child : undefined,
    links: [
      ...explicitLinks,
      ...naturalProcess(
        getFrontText(section, justTextNodesWithoutWikiLinks) ?? "",
        explicitLinks.map((link) => link.name)
      ).links,
      ...section.sections.map((childSection) => ({
        type: LinkType.Child,
        name: "#" + linkResolver(childSection.title),
      })),
    ],
  };
}
