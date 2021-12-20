import fs from "fs";
import matter from "gray-matter";
import { join } from "path";

const gardensDirectory = join(process.cwd(), "gardens");

export class Item {
  name: string;
  content: string;

  constructor(name: string, load = false) {
    this.name = name;
    if (load) {
      const path = join(gardensDirectory, `${name}.md`);
      const fileContents = fs.readFileSync(path, "utf8");
      const itemMatter = matter(fileContents);
      this.content = itemMatter.content;
    }
  }
}

export function getItem() {
  return new Item("boxofjam/practice/digital-garden", true);
}

export function getAllItems() {
  return [new Item("digital-garden")];
}
