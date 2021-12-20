import fs from "fs";
import matter from "gray-matter";
import { join } from "path";

import { findFile, findFiles } from "./find";

const gardensDirectory = join(process.cwd(), "gardens");

export class Item {
  name: string;
  filename: string;
  content: string;

  constructor(filename: string, load = false) {
    this.filename = filename;
    this.name = /[^/]*$/.exec(filename)[0];
    if (load) {
      const path = join(gardensDirectory, `${filename}`);
      const fileContents = fs.readFileSync(path, "utf8");
      const itemMatter = matter(fileContents);
      this.content = itemMatter.content;
    }
  }
}

export async function findItem(name: string) {
  return new Item(await findFile(gardensDirectory, name), true);
}

export async function getAllItems(): Promise<Item[]> {
  const files = await findFiles(gardensDirectory);
  return files.map((filename) => new Item(filename));
}
