import { exec } from "child_process";
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
    this.name = /([^/]*).md$/.exec(filename)[1];
    if (load) {
      const path = join(gardensDirectory, `${filename}`);
      const fileContents = fs.readFileSync(path, "utf8");
      const itemMatter = matter(fileContents);
      this.content = itemMatter.content;
    }
  }
}

export async function findBackLinks(filename: string): Promise<string[]> {
  const cmd = "rg -l '\\[" + filename + "' " + gardensDirectory;
  const lines = []
  exec(cmd, function (err, stdout:string, stderr) {
    const split = (str:string) => str.split(/\r?\n/);
    console.log(stdout)
    lines.push(split(stdout))
    if (err) {
      console.log(`No backlinks found for {filename}`)
    }
    process.stdout.write(stderr);
  });
  console.log(lines)
  return [];
}

export async function findItem(name: string) {
  return new Item(await findFile(gardensDirectory, name + ".md"), true);
}

export async function getAllItems(): Promise<Item[]> {
  const files = await findFiles(gardensDirectory);
  return files.map((filename) => new Item(filename));
}
