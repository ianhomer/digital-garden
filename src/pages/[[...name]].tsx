import {
  findBackLinks,
  findImplicitBackLinks,
  findImplicitForwardLinks,
  findItem,
  getAllItems,
  Item,
} from "../lib/content";
import markdownToHtml from "../lib/markdownToHtml";

function ItemPage({ item }) {
  return (
    <div>
      <div dangerouslySetInnerHTML={{ __html: item.content }} />
      <ul>
        {item.links.map((link: string) => (
          <li key={link}>
            <a href={link}>{link}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function getStaticProps({ params }) {
  const item = await findItem(params.name);
  const explicitBackLinks = await findBackLinks(params.name);
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
    .sort();
  const content = await markdownToHtml(item.content || "no content");

  return {
    props: {
      item: {
        ...item,
        links,
        content,
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
