import { LinkType, Things } from "./types";

export const findDeepLinks = (
  things: Things,
  name: string,
  maxDepth: number,
  depth = 1
) => {
  const directLinks = [
    ...(name in things
      ? things[name].links.map((link) => ({
          source: name,
          target: link.name,
          depth,
          type: LinkType.To,
        }))
      : []),
    ...Object.keys(things)
      .filter((fromName) => {
        return things[fromName].links.map((link) => link.name).includes(name);
      })
      .map((fromName) => ({
        source: name,
        target: fromName,
        depth,
        type: LinkType.From,
      })),
  ];
  return [
    ...directLinks,
    ...(maxDepth < depth + 1
      ? []
      : directLinks
          .map((link) =>
            findDeepLinks(things, link.target, maxDepth, depth + 1)
          )
          .flat()),
  ].filter(
    (value, index, self) =>
      index ===
      self.findIndex(
        (compareTo) =>
          (value.source == compareTo.source &&
            value.target == compareTo.target) ||
          (value.source == compareTo.target && value.target == compareTo.source)
      )
  );
};
