import { ItemLink, Items, toParentName } from "@garden/graph";

import { Graph, InitialNodeValueMap, NodeType } from "./types";

const countSiblings = (name: string, links: Array<ItemLink>, depth: number) => {
  if (depth === 0) {
    return 1;
  }
  const linksToName = links.filter((link) => link.target === name);
  const parentLink = linksToName.find((link) => link.depth === depth);
  if (!parentLink) {
    throw `Cannot find parent of ${name} from ${JSON.stringify(
      linksToName,
    )} at depth ${depth}`;
  }
  return links.filter((link) => link.source === parentLink.source).length;
};

export const createGraph = (
  root: string,
  items: Items,
  initalValues: InitialNodeValueMap,
  links: Array<ItemLink>,
): Graph => {
  const names = links
    .map((link) => [link.source, link.target])
    .flat()
    .filter((value, index, self) => self.indexOf(value) === index);

  const getParentTitle = (name: string) => {
    const parentName = toParentName(name);
    if (parentName && parentName in items) {
      return items[parentName].title;
    }
    return undefined;
  };

  const getDepth = (name: string) => {
    if (root === name) {
      return 0;
    }
    const connections = links
      .filter((link) => link.target === name)
      .map((link) => link.depth);
    if (connections.length === 0) {
      return 0;
    } else return Math.min(...connections);
  };

  return {
    nodes: [
      ...names.map((name: string) => {
        const depth = getDepth(name);
        const fixedCoordinates = {};
        const siblings = countSiblings(name, links, depth);
        const thing = items[name];
        return {
          id: name || "na",
          title: name in items ? thing.title : name,
          context: getParentTitle(name),
          type: NodeType.Thing,
          wanted: !(name in items),
          siblings,
          showLabel: depth < 3 && (depth < 2 || siblings < 20),
          depth,
          ...initalValues[name],
          ...fixedCoordinates,
        };
      }),
    ],
    links: links,
  };
};
