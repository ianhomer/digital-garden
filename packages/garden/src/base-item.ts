import { Item } from "@garden/types";
import matter from "gray-matter";

export class BaseItem implements Item {
  name: string;
  filename: string;
  content: string;

  constructor(name: string, filename: string, content: string) {
    this.filename = filename;
    this.name = name;

    const itemMatter = matter(content);
    this.content = itemMatter.content;
  }
}
