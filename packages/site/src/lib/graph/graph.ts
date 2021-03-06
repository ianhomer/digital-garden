import { ItemLink, Things } from "@garden/types";

import { Graph, NodeType } from "./types";

const countSiblings = (name: string, links: Array<ItemLink>, depth: number) => {
  if (depth == 0) {
    return 1;
  }
  const linksToName = links.filter((link) => link.target === name);
  const parentLink = linksToName.find((link) => link.depth == depth);
  if (!parentLink) {
    throw `Cannot find parent of ${name} from ${JSON.stringify(
      linksToName
    )} at depth ${depth}`;
  }
  return links.filter((link) => link.source === parentLink.source).length;
};

export const createGraph = (
  root: string,
  things: Things,
  links: Array<ItemLink>
): Graph => {
  const names = links
    .map((link) => [link.source, link.target])
    .flat()
    .filter((value, index, self) => self.indexOf(value) === index);

  return {
    nodes: [
      ...names.map((name: string) => {
        const depth =
          root === name
            ? 0
            : Math.min(
                ...links
                  .filter((link) => link.target === name)
                  .map((link) => link.depth)
              );
        const fixedCoordinates =
          depth == 0
            ? {
                fx: 0,
                fy: 0,
              }
            : {};
        const siblings = countSiblings(name, links, depth);
        return {
          id: name || "na",
          title: name in things ? things[name].title : name,
          type: NodeType.Thing,
          wanted: !(name in things),
          siblings,
          showLabel: depth < 3 && (depth < 2 || siblings < 30),
          depth,
          ...fixedCoordinates,
        };
      }),
    ],
    links: links,
  };
};
