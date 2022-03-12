import { ItemLink, Things } from "@garden/types";

import { Graph, NodeType } from "./types";

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
        return {
          id: name || "na",
          type: NodeType.Thing,
          wanted: !(name in things),
          depth,
          ...fixedCoordinates,
        };
      }),
    ],
    links: links,
  };
};
