import { Item } from "@garden/types";
import matter from "gray-matter";

export class BaseItem implements Item {
  name: string;
  filename: string;
  content: string;

  constructor(filename: string, content: string) {
    this.filename = filename;
    const match = /([^/]*).md$/.exec(filename);
    this.name = match ? match[1] : this.filename;

    const itemMatter = matter(content);
    this.content = itemMatter.content;
  }
}
