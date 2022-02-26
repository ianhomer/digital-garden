import { Item, Link } from "../garden/types";
import { Graph, NodeType } from "./types";

export const createGraph = (item: Item, links: Array<Link>): Graph => {
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
      target: item.name,
      source: link.name,
    })),
  };
};
