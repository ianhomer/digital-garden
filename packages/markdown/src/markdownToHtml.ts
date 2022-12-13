import { pageResolver } from "@garden/core";
import langGherkin from "highlight.js/lib/languages/gherkin";
import langGroovy from "highlight.js/lib/languages/groovy";
import langProperties from "highlight.js/lib/languages/properties";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkDirective from "remark-directive";
import remarkEmoji from "remark-emoji";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import remarkWikiLink from "remark-wiki-link";
import { unified } from "unified";
import { Data, Node } from "unist";
import { visit } from "unist-util-visit";

import { remarkGardenDirectives } from "./remark-garden-directives";

const languages = {
  gherkin: langGherkin,
  groovy: langGroovy,
  properties: langProperties,
};

function shortenLocalLinks() {
  return (tree: Node<Data>) => {
    visit(tree, (node: { type: string; url?: string }) => {
      if (
        "url" in node &&
        node.type === "link" &&
        node.url &&
        node.url.startsWith("./")
      ) {
        const match = /([^/]*).md$/.exec(node.url);
        node.url = match ? "/" + match[1] : node.url;
      }
    });
  };
}

export default async function markdownToHtml(markdown: string) {
  const vfile = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkWikiLink, {
      hrefTemplate: (permalink: string) => `/${permalink}`,
      pageResolver,
    })
    .use(remarkDirective)
    .use(remarkEmoji)
    .use(shortenLocalLinks)
    .use(remarkRehype)
    .use(rehypeStringify)
    .use(rehypeHighlight, { languages: languages, ignoreMissing: true })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: "wrap" })
    .use(remarkGardenDirectives)
    .process(markdown);
  return String(vfile);
}
