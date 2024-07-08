import { ItemLink, Items, Link, LinkType } from "@garden/graph";

const valuable = (link: Link) => link.value !== 0;

type BackLinkCache = Map<string, string[]>;

const backLinks = (
  backLinkCache: BackLinkCache,
  items: Items,
  name: string,
  depth: number,
  predicate = (link: Link) =>
    link.type === LinkType.To ||
    link.type === LinkType.ImplicitAlias ||
    link.type === LinkType.Child,
  backLinkType = LinkType.From,
): ItemLink[] => {
  const backLinksAvailable = backLinkCache.get(name);
  if (!backLinksAvailable) {
    return [];
  }
  return backLinksAvailable
    .filter((fromName) => {
      return (
        items[fromName].links
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

const HARD_DEPTH = 7;
const goDeeper = (
  depth: number,
  maxDepth: number,
  linkType: LinkType | undefined,
) => {
  if (depth < maxDepth + 1) {
    return true;
  } else if (depth > HARD_DEPTH) {
    return false;
  } else if (linkType === LinkType.Child) {
    // Show the link to child as long as we haven't gone past the hard depth
    return true;
  }
  return false;
};

const generateBackLinkCache = (items: Items) => {
  const backLinkCache: BackLinkCache = new Map();
  for (const name in items) {
    for (const backLink of items[name].links.map((link) => link.name)) {
      const backLinkCacheEntry =
        backLinkCache.get(backLink) ??
        (() => {
          const entry: string[] = [];
          backLinkCache.set(backLink, entry);
          return entry;
        })();
      backLinkCacheEntry.push(name);
    }
  }
  return backLinkCache;
};

const findDeepLinks = (
  items: Items,
  name: string,
  maxDepth: number,
  depth = 1,
  linkType: LinkType | undefined = undefined,
  backLinkCache: BackLinkCache | undefined = undefined,
): ItemLink[] => {
  const populatedBackLinkCache = backLinkCache || generateBackLinkCache(items);
  const directLinks = [
    ...(name in items
      ? items[name].links.filter(valuable).map((link: Link) => ({
          source: name,
          target: link.name,
          depth,
          type: link.type,
        }))
      : []),
    ...backLinks(populatedBackLinkCache, items, name, depth),
    ...backLinks(
      populatedBackLinkCache,
      items,
      name,
      depth,
      (link: Link) => link.type === LinkType.ImplicitTo,
      LinkType.ImplicitFrom,
    ),
  ];
  return [
    ...directLinks,
    ...(goDeeper(depth, maxDepth, linkType)
      ? directLinks
          .map((link) =>
            findDeepLinks(
              items,
              link.target,
              maxDepth,
              depth + 1,
              linkType,
              populatedBackLinkCache,
            ),
          )
          .flat()
      : []),
  ]
    .filter(
      // de-dupe
      (value, index, self) =>
        index ===
        self.findIndex(
          (compareTo) =>
            ((value.source === compareTo.source &&
              value.target === compareTo.target) ||
              (value.source === compareTo.target &&
                value.target === compareTo.source)) &&
            // choose one with lowest depth
            value.depth >= compareTo.depth,
        ),
    )
    .sort((a, b) => a.depth - b.depth)
    .slice(0, 500);
};

export default findDeepLinks;
