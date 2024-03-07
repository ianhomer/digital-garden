import {
  findItemOrWanted,
  findLinks,
  getPageItems,
  isNotValidPageName,
} from "@garden/garden";
import { markdownToHtml } from "@garden/react";
import { Item } from "@garden/types";
import { GetStaticPaths, GetStaticProps } from "next";

import { ItemPage, ItemPageProps } from "../components/ItemPage";
import { garden } from "../components/site-garden";

export const getStaticProps: GetStaticProps<ItemPageProps> = async ({
  params,
}) => {
  const itemName = (params?.name && params?.name[0]) ?? false;
  const item = await findItemOrWanted(garden.repository, itemName);
  const links = await findLinks(garden, item);
  const content = await markdownToHtml(item.content);

  return {
    props: {
      item: {
        name: item.name,
        links,
        content,
      },
      scripts: garden.config.scripts,
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const items = await getPageItems(garden.repository);

  const invalidPageNames = items
    .map((item) => item.name)
    .filter(isNotValidPageName);

  if (invalidPageNames.length > 0) {
    console.log("Invalid page names found");
    console.log(JSON.stringify(invalidPageNames, null, "  "));
  }

  return {
    paths: items.map((item: Item) => ({
      params: {
        name: [item.name],
      },
    })),
    fallback: false,
  };
};

export default ItemPage;
