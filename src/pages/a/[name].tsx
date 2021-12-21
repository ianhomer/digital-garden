import { findBackLinks, findItem, getAllItems, Item } from "../../lib/content";
import markdownToHtml from "../../lib/markdownToHtml";

function ItemPage({ item }) {
  return <div dangerouslySetInnerHTML={{ __html: item.content }} />;
}

export async function getStaticProps({ params }) {
  const item = await findItem(params.name);
  const backlinks = await findBackLinks(params.name);
  console.log(backlinks);
  const content = await markdownToHtml(item.content || "no content");

  return {
    props: {
      item: {
        ...item,
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
