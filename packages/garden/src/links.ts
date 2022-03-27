import { Item, Link, LinkType } from "@garden/types";

import {
  findBackLinks,
  findImplicitBackLinks,
  findImplicitForwardLinks,
} from "./content";
import { Garden, GardenConfig } from "./garden";

export const findLinks = async (
  garden: Garden,
  config: GardenConfig,
  item: Item,
  name: string
) => {
  const explicitBackLinks = name ? await findBackLinks(garden, name[0]) : [];
  const implicitBackLinks = await findImplicitBackLinks(config, name);
  const implicitForwardLinks = item.filename
    ? await findImplicitForwardLinks(config, item)
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
