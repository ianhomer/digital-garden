import { Item } from "@garden/types";
import fs from "fs";
import matter from "gray-matter";
import { dirname, join, sep } from "path";

import { findFile, findFiles, findFilesInNamedDirectory } from "./find";
import { Garden, GardenConfig } from "./garden";

// const config = toConfig(options);
// const garden = createGarden(options);
// const gardensDirectory = config.directory;
// const hasMultipleGardens = !fs.existsSync(`${config.directory}/README.md`);

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

export async function findImplicitBackLinks(
  config: GardenConfig,
  name: string
): Promise<string[]> {
  return (await findFilesInNamedDirectory(config, config.directory, name))
    .filter((s) => s.endsWith(".md"))
    .map((backlink: string) => /([^/]*).md$/.exec(backlink)[1]);
}

export async function findImplicitForwardLinks(
  config: GardenConfig,
  item: Item
): Promise<string[]> {
  return Promise.resolve(
    dirname(item.filename)
      .split(sep)
      .slice(config.hasMultiple ? 1 : 0)
  );
}

export async function findBackLinks(
  garden: Garden,
  name: string
): Promise<string[]> {
  const things = await garden.load();
  return garden.findBackLinks(things, name).map((link) => link.name);
}

export async function findItem(config: GardenConfig, name: string | false) {
  return new FileItem(
    await findFile(config, config.directory, (name ? name : "README") + ".md"),
    true
  );
}

export async function getAllItems(config: GardenConfig): Promise<Item[]> {
  const files = await findFiles(config, config.directory);
  return files.map((filename) => {
    return new FileItem(filename);
  });
}
