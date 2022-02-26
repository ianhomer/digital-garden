import GraphDiagram from "../components/graph-diagram";
import {
  findBackLinks,
  findImplicitBackLinks,
  findImplicitForwardLinks,
  findItem,
  getAllItems,
} from "../lib/content";
import { garden } from "../lib/garden/garden";
import { Item, Link, LinkType } from "../lib/garden/types";
import { createGraph } from "../lib/graph/graph";
import markdownToHtml from "../lib/markdownToHtml";

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
        graph: createGraph(garden.findDeepLinks(things, item.name, 3)),
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
