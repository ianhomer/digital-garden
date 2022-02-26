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
import { Link } from "../lib/garden/meta";
import markdownToHtml from "../lib/markdownToHtml";
import { Graph, NodeType } from "../types/graph";

const createGraph = (item, links): Graph => {
  return {
    nodes: [
      {
        id: item.name,
        type: NodeType.Thing,
      },
      ...links.map((link) => ({
        id: link.name,
        type: NodeType.Thing,
      })),
    ],
    links: links.map((link) => ({
      target: item.name,
      source: link.name,
    })),
  };
};

function ItemPage({ item }) {
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
    .map(
      (link): Link => ({
        name: link,
        type: ((link) => {
          if (explicitBackLinks.includes(link)) {
            return "from";
          } else if (implicitBackLinks.includes(link)) {
            return "has";
          }
          return "in";
        })(link),
      })
    );
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
    paths: items.map((item: Item) => ({
      params: {
        name: item.name == "README" ? [] : [item.name],
      },
    })),
    fallback: false,
  };
}

export default ItemPage;
