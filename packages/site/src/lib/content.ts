import { createGarden } from "@garden/garden";
import { Item } from "@garden/types";
import fs from "fs";
import matter from "gray-matter";
import { dirname, join, sep } from "path";

import config from "../../garden.config";
import { findFile, findFiles, findFilesInNamedDirectory } from "./find";

const garden = createGarden(config);
const gardensDirectory = config.directory;

const hasMultipleGardens = !fs.existsSync(`${config.directory}/README.md`);

export class FileItem implements Item {
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

export async function findImplicitBackLinks(name: string): Promise<string[]> {
  return (await findFilesInNamedDirectory(config, gardensDirectory, name))
    .filter((s) => s.endsWith(".md"))
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
  const things = await garden.load();
  return garden.findBackLinks(things, name).map((link) => link.name);
}

export async function findItem(name: string | false) {
  return new FileItem(
    await findFile(config, gardensDirectory, (name ? name : "README") + ".md"),
    true
  );
}

export async function getAllItems(): Promise<Item[]> {
  const files = await findFiles(config, gardensDirectory);
  return files.map((filename) => {
    return new FileItem(filename);
  });
}
