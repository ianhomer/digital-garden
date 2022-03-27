import { Item, Link, LinkType } from "@garden/types";

import {
  findBackLinks,
  findImplicitBackLinks,
  findImplicitForwardLinks,
} from "./content";

export const findLinks = async (item: Item, name: string) => {
  const explicitBackLinks = name ? await findBackLinks(name[0]) : [];
  const implicitBackLinks = await findImplicitBackLinks(name);
  const implicitForwardLinks = item.filename
    ? await findImplicitForwardLinks(item)
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
