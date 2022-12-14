import { Item, ItemReference } from "@garden/types";
import matter from "gray-matter";

import { MarkdownMessage } from "./markdown-message";

const safeMatter = (content: string) => {
  try {
    // Note that the gray matter API caches the results if there are no options.
    // Caching is not desired in this system so this side effect is appropriate.
    return matter(content, { language: "yaml" });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : JSON.stringify(error);
    return {
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
  hash: string;

  constructor(itemReference: ItemReference, filename: string, content: string) {
    this.filename = filename;
    this.name = itemReference.name;
    this.hash = itemReference.hash;

    const itemMatter = safeMatter(content);
    this.content = itemMatter.content;
  }
}
