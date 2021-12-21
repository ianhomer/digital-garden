import { exec } from "child_process";
import fs from "fs";
import matter from "gray-matter";
import { join } from "path";
import { promisify } from "util";

import { findFile, findFiles } from "./find";

const gardensDirectory = join(process.cwd(), "gardens");

export class Item {
  name: string;
  filename: string;
  content: string;

  constructor(filename: string, load = false) {
    this.filename = filename;
    this.name = /([^/]*).md$/.exec(filename)[1];
    if (load) {
      const path = join(gardensDirectory, `${filename}`);
      const fileContents = fs.readFileSync(path, "utf8");
      const itemMatter = matter(fileContents);
      this.content = itemMatter.content;
    }
  }
}

const splitLines = (s:string) => s.split(/\n/);

export async function findBackLinks(filename: string): Promise<string[]> {
  const cmd = `rg -l '\\[${filename}' ${gardensDirectory}`;
  return promisify(exec)(cmd)
    .then((ok) => {
      console.log(ok.stdout);
      return splitLines(ok.stdout);
    })
    .catch((error) => {
      console.log(`Error : ${error}`);
      return ["no-back-links"];
    });
}

export async function findItem(name: string) {
  return new Item(await findFile(gardensDirectory, name + ".md"), true);
}

export async function getAllItems(): Promise<Item[]> {
  const files = await findFiles(gardensDirectory);
  return files.map((filename) => new Item(filename));
}
