import { useEffect, useState } from "react";

import GraphDiagram from "../components/graph-diagram";
import {
  findBackLinks,
  findImplicitBackLinks,
  findImplicitForwardLinks,
  findItem,
  getAllItems,
  Item,
} from "../lib/content";
import { garden } from "../lib/garden/garden";
import markdownToHtml from "../lib/markdownToHtml";
import { Graph, NodeType } from "../types/graph";

const createGraph = (item, links): Graph => {
  return {
    nodes: [
      {
        id: item.name,
        type: NodeType.Thing,
        label: item.name,
      },
      ...links.map((link) => {
        return {
          id: link.link,
          type: NodeType.Thing,
          label: link.link,
        };
      }),
    ],
    links: links.map((link) => {
      return {
        target: item.name,
        source: link.link,
      };
    }),
  };
};

type Relation = {
  link: string;
  type: string;
};

function ItemPage({ item }) {
  return (
    <>
      <div className="container max-w-4xl px-4">
        <div dangerouslySetInnerHTML={{ __html: item.content }} />
        <ul className="links">
          {item.links.map((link: Relation) => (
            <li key={link.link} className={link.type}>
              <a href={link.link}>{link.link}</a>
            </li>
          ))}
        </ul>
        <footer>{Object.keys(item.garden).length} things</footer>
      </div>
      <GraphDiagram graph={item.graph} />
    </>
  );
}

export async function getStaticProps({ params }) {
  const item = await findItem(params.name);
  const explicitBackLinks = params.name
    ? await findBackLinks(params.name[0])
    : [];
  const implicitBackLinks = await findImplicitBackLinks(params.name);
  const implicitForwardLinks = await findImplicitForwardLinks(item);
  const links = Array.from(
    new Set([
      ...implicitForwardLinks,
      ...explicitBackLinks,
      ...implicitBackLinks,
    ]).values()
  )
    .filter((name) => name !== "README" && name !== item.name)
    .sort()
    .map((link) => {
      return {
        link: link,
        type: ((link) => {
          if (explicitBackLinks.includes(link)) {
            return "back";
          } else if (implicitBackLinks.includes(link)) {
            return "implicitBack";
          }
          return "implicitForward";
        })(link),
      };
    });
  const content = await markdownToHtml(item.content || "no content");

  return {
    props: {
      item: {
        ...item,
        links,
        content,
        garden: await garden.load(),
        graph: createGraph(item, links),
      },
    },
  };
}

export async function getStaticPaths() {
  const items = await getAllItems();

  return {
    paths: items.map((item: Item) => {
      return {
        params: {
          name: item.name == "README" ? [] : [item.name],
        },
      };
    }),
    fallback: false,
  };
}

export default ItemPage;
