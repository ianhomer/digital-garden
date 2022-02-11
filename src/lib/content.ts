import { exec } from "child_process";
import fs from "fs";
import matter from "gray-matter";
import { dirname, join, sep } from "path";
import { promisify } from "util";

import config from "../../garden.config";
import { findFile, findFiles, findFilesInNamedDirectory } from "./find";

const gardensDirectory = config.directory;

const hasMultipleGardens = !fs.existsSync(`${config.directory}/README.md`);

export class Item {
  name: string;
  filename: string;
  content: string;

  constructor(filename: string, load = false) {
    this.filename = filename;
    console.log(filename);
    this.name = /([^/]*).md$/.exec(filename)[1];
    if (load) {
      const path = join(gardensDirectory, `${filename}`);
      const fileContents = fs.readFileSync(path, "utf8");
      const itemMatter = matter(fileContents);
      this.content = itemMatter.content;
    }
  }
}

const splitLines = (s: string) => s.split(/\n/);

export async function findImplicitBackLinks(name: string): Promise<string[]> {
  return (await findFilesInNamedDirectory(gardensDirectory, name))
    .filter((s) => {
      s.endsWith(".md");
    })
    .map((backlink: string) => /([^/]*).md$/.exec(backlink)[1]);
}

export async function findImplicitForwardLinks(item: Item): Promise<string[]> {
  return Promise.resolve(
    dirname(item.filename)
      .split(sep)
      .slice(hasMultipleGardens ? 1 : 0)
  );
}

export async function findBackLinks(name: string): Promise<string[]> {
  const cmd = `rg -L -l '\\[${name}' ${gardensDirectory}`;
  return promisify(exec)(cmd)
    .then((ok) => {
      return splitLines(ok.stdout)
        .filter((line) => line.length > 0)
        .map((backlink) => /([^/]*).md$/.exec(backlink)[1])
        .sort();
    })
    .catch((error) => {
      console.log(`Error : ${error}`);
      return [];
    });
}

export async function findItem(name: string | false) {
  return new Item(
    await findFile(gardensDirectory, (name ? name : "README") + ".md"),
    true
  );
}

export async function getAllItems(): Promise<Item[]> {
  const files = await findFiles(gardensDirectory);
  return files.map((filename) => {
    return new Item(filename);
  });
}
