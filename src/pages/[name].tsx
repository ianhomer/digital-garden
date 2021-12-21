import { findBackLinks, findItem, getAllItems, Item } from "../lib/content";
import markdownToHtml from "../lib/markdownToHtml";

function ItemPage({ item }) {
  return (
    <div>
      <div dangerouslySetInnerHTML={{ __html: item.content }} />
      <ul>
        {item.backlinks.map((link: string) => (
          <li>
            <a key={link} href={link}>
              {link}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function getStaticProps({ params }) {
  const item = await findItem(params.name);
  const backlinks = await findBackLinks(params.name);
  const content = await markdownToHtml(item.content || "no content");

  return {
    props: {
      item: {
        ...item,
        backlinks,
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
          name: item.name,
        },
      };
    }),
    fallback: false,
  };
}

export default ItemPage;
