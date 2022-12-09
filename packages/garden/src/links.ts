import { Item, Link, LinkType } from "@garden/types";

import {
  findBackLinks,
  findImplicitBackLinks,
  findImplicitForwardLinks,
} from "./content";
import { Garden } from "./garden";

export const justExplicitLinks = (link: Link) => link.type == LinkType.To;
export const justNaturalLinks = (link: Link) => link.type == LinkType.NaturalTo;
export const justNaturalAliasLinks = (link: Link) =>
  link.type == LinkType.NaturalAlias;
export const toLinkName = (link: Link) => link.name;

export const findLinks = async (garden: Garden, item: Item) => {
  const explicitBackLinks = await findBackLinks(garden, item.name);
  const implicitBackLinks = await findImplicitBackLinks(
    garden.config,
    item.name
  );
  const implicitForwardLinks = item.filename
    ? await findImplicitForwardLinks(garden.config, item)
    : [];
  return Array.from(
    new Set([
      ...implicitForwardLinks,
      ...explicitBackLinks,
      ...implicitBackLinks,
    ]).values()
  )
    .filter((name) => name !== "README" && name !== item.name)
    .sort()
    .map(
      (link): Link => ({
        name: link,
        value: 1,
        type: ((link) => {
          if (explicitBackLinks.includes(link)) {
            return LinkType.From;
          } else if (implicitBackLinks.includes(link)) {
            return LinkType.Has;
          }
          return LinkType.In;
        })(link),
      })
    );
};
