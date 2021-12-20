import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { Data, Node } from "unist";
import { visit } from "unist-util-visit";

function shortenLocalLinks() {
  return (tree: Node<Data>) => {
    visit(tree, (node: { type: string; url: string }) => {
      if (node.type === "link") {
        if (node.url.startsWith("./")) {
          node.url = "./" + /[^/]*$/.exec(node.url)[0];
        }
      }
    });
  };
}

export default async function markdownToHtml(markdown: string) {
  const vfile = await unified()
    .use(remarkParse)
    .use(shortenLocalLinks)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(markdown);
  return String(vfile);
}
