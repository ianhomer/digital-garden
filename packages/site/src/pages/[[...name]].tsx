import { findDeepLinks, useWindowDimensions } from "@garden/client";
import {
  findItemOrWanted,
  findLinks,
  getPageItems,
  isNotValidPageName,
} from "@garden/garden";
import { Item, Link, Things } from "@garden/types";
import { GetStaticPaths, GetStaticProps } from "next";
import { useEffect, useState } from "react";

import GraphDiagram from "../components/graph-diagram";
import { garden } from "../components/siteGarden";
import { useKey } from "../components/useKey";
import { createGraph } from "../lib/graph/graph";
import markdownToHtml from "../lib/markdownToHtml";

interface Props {
  item: {
    name: string;
    content: string;
    links: Link[];
  };
}

function ItemPage({ item }: Props) {
  const { height, width } = useWindowDimensions();
  const [depth, setDepth] = useState(3);
  const [scale, setScale] = useState(1.3);
  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState<Things>({});

  useKey((key) => setDepth(parseInt(key)), ["1", "2", "3", "4", "5"]);

  useKey(() => setScale(scale / 1.5), ["b"]);
  useKey(() => setScale(scale / 1.3), ["v"]);
  useKey(() => setScale(scale), ["c"]);
  useKey(() => setScale(scale * 1.3), ["x"]);
  useKey(() => setScale(scale * 1.5), ["z"]);

  useEffect(() => {
    fetch("/garden.json")
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        setData(data);
      });
  }, []);

  const itemName = () => {
    const childName = window.location.hash;
    const compositeName = item.name + childName;
    return compositeName in data ? compositeName : item.name;
  };

  return (
    <>
      <div className="container max-w-4xl px-4">
        <div dangerouslySetInnerHTML={{ __html: item.content }} />
      </div>
      {!isLoading && data && (
        <GraphDiagram
          width={width}
          height={height}
          scale={scale}
          graph={createGraph(
            itemName(),
            data,
            findDeepLinks(data, itemName(), depth)
          )}
        />
      )}
    </>
  );
}

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const itemName = (params?.name && params?.name[0]) ?? false;
  const item = await findItemOrWanted(garden.repository, itemName);
  const links = await findLinks(garden, item);
  const content = await markdownToHtml(item.content);

  return {
    props: {
      item: {
        ...item,
        links,
        content,
      },
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const things = await garden.load();
  const items = await getPageItems(garden.repository, things);

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
