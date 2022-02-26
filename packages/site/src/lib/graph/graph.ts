import { Item, ItemLink, Link, LinkType } from "../garden/types";
import { Graph, NodeType } from "./types";

export const createDirectGraph = (item: Item, links: Array<Link>): Graph => {
  return {
    nodes: [
      {
        id: item.name,
        type: NodeType.Thing,
      },
      ...links.map((link) => ({
        id: link.name,
        type: NodeType.Thing,
      })),
    ],
    links: links.map((link) => ({
      type: LinkType.To,
      target: item.name,
      source: link.name,
      depth: 1,
    })),
  };
};

export const createGraph = (links: Array<ItemLink>): Graph => {
  const names = links
    .map((link) => [link.source, link.target])
    .flat()
    .filter((value, index, self) => self.indexOf(value) === index);

  return {
    nodes: [
      ...names.map((name: string) => ({
        id: name || "na",
        type: NodeType.Thing,
      })),
    ],
    links: links,
  };
};
