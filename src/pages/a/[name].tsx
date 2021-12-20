import { Item, getItem, getAllItems } from "../../lib/content"
import markdownToHtml from '../../lib/markdownToHtml'

function ItemPage({item}) {
  return <div dangerouslySetInnerHTML={{ __html: item.content }}/>;
}

export async function getStaticProps({ params }) {
  const item = getItem()
  console.log(item)
  const content = await markdownToHtml(item.content || "no content")

  return {
    props: {
      item: {
        ...item,
        content,
      },
    },
  }
}


export async function getStaticPaths() {
  const items = getAllItems()

  return {
    paths: items.map((item: Item) => {
      return {
        params: {
          name: item.name,
        },
      }
    }),
    fallback: false,
  }
}

export default ItemPage;
