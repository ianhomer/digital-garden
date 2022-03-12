import { useState } from "react";

import GraphDiagram from "../components/graph-diagram";
import { useKey } from "../components/useKey";
import useWindowDimensions from "../components/useWindowDimensions";
import {
  findBackLinks,
  findImplicitBackLinks,
  findImplicitForwardLinks,
  findItem,
  getAllItems,
} from "../lib/content";
import { findWantedThings, garden } from "../lib/garden/garden";
import { findDeepLinks } from "../lib/garden/gardenGraph";
import { Item, Link, LinkType } from "../lib/garden/types";
import { createGraph } from "../lib/graph/graph";
import markdownToHtml from "../lib/markdownToHtml";

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
  const explicitBackLinks = params.name
    ? await findBackLinks(params.name[0])
    : [];
  const implicitBackLinks = await findImplicitBackLinks(params.name);
  const implicitForwardLinks = item.filename
    ? await findImplicitForwardLinks(item)
    : [];
  const links = Array.from(
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
