import { GardenRepository, Item } from "@garden/types";

import { getAllItems } from "./content";

export const getPageItems = async (repository: GardenRepository) => {
  const items: Item[] = [
    ...(await getAllItems(repository)).filter(
      (item) => item.name.indexOf("#") < 0,
    ),
    ...[{ name: "", hash: "00", content: "no content" }],
  ];

  return items;
};
