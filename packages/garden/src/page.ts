import { Item, Things } from "@garden/types";

import { getAllItems } from "./content";
import { findWantedThings, GardenConfig } from "./garden";

export const getPageItems = async (config: GardenConfig, things: Things) => {
  const items: Item[] = [
    ...(await getAllItems(config)).filter((item) => item.name.indexOf("#") < 0),
    ...[{ name: "", content: "no content" }],
    ...findWantedThings(things).map((name) => ({
      name,
      content: "no content",
    })),
  ];

  return items;
};
