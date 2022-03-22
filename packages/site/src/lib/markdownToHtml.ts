import langGherkin from "highlight.js/lib/languages/gherkin";
import langGroovy from "highlight.js/lib/languages/groovy";
import langProperties from "highlight.js/lib/languages/properties";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import remarkWikiLink from "remark-wiki-link";
import { unified } from "unified";
import { Data, Node } from "unist";
import { visit } from "unist-util-visit";

const languages = {
  gherkin: langGherkin,
  groovy: langGroovy,
  properties: langProperties,
};

function shortenLocalLinks() {
  return (tree: Node<Data>) => {
    visit(tree, (node: { type: string; url: string }) => {
      if (node.type === "link") {
        if (node.url.startsWith("./")) {
          const match = /([^/]*).md$/.exec(node.url);
          node.url = match ? "./" + match[1] : node.url;
        }
      }
    });
  };
}

export default async function markdownToHtml(markdown: string) {
  const vfile = await unified()
    .use(remarkWikiLink, {
      hrefTemplate: (permalink: string) => `${permalink}`,
    })
    .use(remarkParse)
    .use(remarkGfm)
    .use(shortenLocalLinks)
    .use(remarkRehype)
    .use(rehypeStringify)
    .use(rehypeHighlight, { languages: languages })
    .process(markdown);
  return String(vfile);
}
