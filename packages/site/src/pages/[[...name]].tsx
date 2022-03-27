import { createGarden, findLinks, findWantedThings } from "@garden/garden";
import { findDeepLinks } from "@garden/graph";
import { Item, Link } from "@garden/types";
import { useState } from "react";

import config from "../../garden.config.js";
import GraphDiagram from "../components/graph-diagram";
import { useKey } from "../components/useKey";
import useWindowDimensions from "../components/useWindowDimensions";
import { findItem, getAllItems } from "../lib/content";
import { createGraph } from "../lib/graph/graph";
import markdownToHtml from "../lib/markdownToHtml";

const garden = createGarden(config);

function ItemPage({ item }) {
  const { height, width } = useWindowDimensions();
  const [depth, setDepth] = useState(2);
  const [scale, setScale] = useState(1.3);

  useKey((key) => setDepth(parseInt(key)), ["1", "2", "3", "4", "5"]);

  useKey(() => setScale(scale / 1.5), ["b"]);
  useKey(() => setScale(scale / 1.3), ["v"]);
  useKey(() => setScale(scale), ["c"]);
  useKey(() => setScale(scale * 1.3), ["x"]);
  useKey(() => setScale(scale * 1.5), ["z"]);

  return (
    <>
      <div className="container max-w-4xl px-4">
        <div dangerouslySetInnerHTML={{ __html: item.content }} />
        <ul className="links">
          {item.links.map((link: Link) => (
            <li key={link.name} className={link.type}>
              <a href={link.name}>{link.name}</a>
            </li>
          ))}
        </ul>
      </div>
      <GraphDiagram
        width={width}
        height={height}
        scale={scale}
        graph={createGraph(
          item.name,
          item.garden,
          findDeepLinks(item.garden, item.name, depth)
        )}
      />
    </>
  );
}

async function findItemOrWanted(name: string): Promise<Item> {
  try {
    return await findItem(name);
  } catch (error) {
    console.log(`Wanted page : ${name}`);
    return {
      name,
      content: `# ${name}\n\nWanted`,
    };
  }
}

export async function getStaticProps({ params }) {
  const item = await findItemOrWanted(params.name && params.name[0]);
  const links = await findLinks(item, params.name);
  const content = await markdownToHtml(item.content || "no content");
  const things = await garden.load();

  return {
    props: {
      item: {
        ...item,
        links,
        content,
        garden: things,
      },
    },
  };
}

export async function getStaticPaths() {
  const things = await garden.load();
  const items = [
    ...(await getAllItems()),
    ...[{ name: "" }],
    ...findWantedThings(things).map((name) => ({
      name,
    })),
  ];

  return {
    paths: items.map((item: Item) => ({
      params: {
        name: [item.name],
      },
    })),
    fallback: false,
  };
}

export default ItemPage;
