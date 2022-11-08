import { ItemLink, Link, LinkType, Things } from "@garden/types";

const valuable = (link: Link) => link.value !== 0;

const backLinks = (
  things: Things,
  name: string,
  depth: number,
  predicate = (link: Link) => !link.type || link.type == LinkType.NaturalAlias,
  backLinkType = LinkType.From
): ItemLink[] => {
  return Object.keys(things)
    .filter((fromName) => {
      return (
        things[fromName].links
          .filter(valuable)
          .filter(predicate)
          .map((link) => link.name)
          .indexOf(name) > -1
      );
    })
    .map((fromName) => ({
      source: name,
      target: fromName,
      depth,
      type: backLinkType,
    }));
};

export const findDeepLinks = (
  things: Things,
  name: string,
  maxDepth: number,
  depth = 1
): ItemLink[] => {
  const directLinks = [
    ...(name in things
      ? things[name].links.filter(valuable).map((link: Link) => ({
          source: name,
          target: link.name,
          depth,
          type: link.type ?? LinkType.To,
        }))
      : []),
    ...backLinks(things, name, depth),
    ...backLinks(
      things,
      name,
      depth,
      (link: Link) => link.type == LinkType.NaturalTo,
      LinkType.NaturalFrom
    ),
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
  ]
    .filter(
      // de-dupe
      (value, index, self) =>
        index ===
        self.findIndex(
          (compareTo) =>
            ((value.source == compareTo.source &&
              value.target == compareTo.target) ||
              (value.source == compareTo.target &&
                value.target == compareTo.source)) &&
            // choose one with lowest depth
            value.depth >= compareTo.depth
        )
    )
    .sort((a, b) => a.depth - b.depth)
    .slice(0, 500);
};
