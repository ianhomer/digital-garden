import { GardenRepository, Item, Things } from "@garden/types";

import { getAllItems } from "./content";
import { findWantedThings } from "./garden";

export const getPageItems = async (
  repository: GardenRepository,
  things: Things
) => {
  const items: Item[] = [
    ...(await getAllItems(repository)).filter(
      (item) => item.name.indexOf("#") < 0
    ),
    ...[{ name: "", content: "no content" }],
    ...findWantedThings(things).map((name) => ({
      name,
      content: "no content",
    })),
  ];

  return items;
};
