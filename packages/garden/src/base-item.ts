import { Item, ItemReference, ThingData } from "@garden/types";
import matter, { GrayMatterFile } from "gray-matter";

import { MarkdownMessage } from "./markdown-message";

export type Matter = GrayMatterFile<string> & {
  data: ThingData;
};

const safeMatter = (content: string) => {
  try {
    // Note that the gray matter API caches the results if there are no options.
    // In this system, caching is undesirable since it masks potential errors
    // and complicates reloading. Explicitly setting the language for the
    // frontmatter, other than setting our desired front matter also has the
    // desired side effect that caching is disabled.
    return matter(content, { language: "yaml" }) as Matter;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : JSON.stringify(error);
    return {
      data: { tags: [] },
      content:
        content +
        new MarkdownMessage("Frontmatter error", message).toMarkdown(),
    };
  }
};

export class BaseItem implements Item {
  name: string;
  filename: string;
  content: string;
  data: ThingData;
  hash: string;

  constructor(itemReference: ItemReference, filename: string, content: string) {
    this.filename = filename;
    this.name = itemReference.name;
    this.hash = itemReference.hash;

    const itemMatter = safeMatter(content);
    this.content = itemMatter.content;
    this.data = itemMatter.data;
  }
}
