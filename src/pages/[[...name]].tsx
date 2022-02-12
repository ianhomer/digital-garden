import {
  findBackLinks,
  findImplicitBackLinks,
  findImplicitForwardLinks,
  findItem,
  getAllItems,
  Item,
} from "../lib/content";
import markdownToHtml from "../lib/markdownToHtml";

type Link = {
  link: string;
  type: string;
};

function ItemPage({ item }) {
  return (
    <div>
      <div dangerouslySetInnerHTML={{ __html: item.content }} />
      <ul className="links">
        {item.links.map((link: Link) => (
          <li key={link.link} className={link.type}>
            <a href={link.link}>{link.link}</a>
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
