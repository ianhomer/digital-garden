import { GardenRepository, Item, Things } from "@garden/types";

import { getAllItems } from "./content";
import { findWantedThings } from "./garden";

export const getPageItems = async (
  repository: GardenRepository,
  things: Things,
  includeWanted = true,
) => {
  const items: Item[] = [
    ...(await getAllItems(repository)).filter(
      (item) => item.name.indexOf("#") < 0,
    ),
    ...[{ name: "", hash: "00", content: "no content" }],
    ...(includeWanted
      ? findWantedThings(things).map((name) => ({
          name,
          hash: "01",
          content: "no content",
        }))
      : []),
  ];

  return items;
};
