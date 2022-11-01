import { Item } from "@garden/types";
import fs from "fs";
import matter from "gray-matter";
import { dirname, join, sep } from "path";

import { findFile, findFiles, findFilesInNamedDirectory } from "./find";
import { Garden, GardenConfig } from "./garden";
import { logger } from "./logger";

// const config = toConfig(options);
// const garden = createGarden(options);
// const gardensDirectory = config.directory;
// const hasMultipleGardens = !fs.existsSync(`${config.directory}/README.md`);

export class FileItem implements Item {
  name: string;
  filename: string;
  content: string;

  constructor(gardensDirectory: string, filename: string, load = false) {
    this.filename = filename;
    const match = /([^/]*).md$/.exec(filename);
    this.name = match ? match[1] : this.filename;
    if (load) {
      const path = join(gardensDirectory, `${filename}`);
      const fileContents = fs.readFileSync(path, "utf8");
      const itemMatter = matter(fileContents);
      this.content = itemMatter.content;
    } else {
      this.content = `${this.name} not loaded`;
    }
  }
}

export async function findImplicitBackLinks(
  config: GardenConfig,
  name: string
): Promise<string[]> {
  return (await findFilesInNamedDirectory(config, config.directory, name))
    .filter((s) => s.endsWith(".md"))
    .map((backlink: string) => {
      const match = /([^/]*).md$/.exec(backlink);
      return match ? match[1] : backlink;
    });
}

export async function findImplicitForwardLinks(
  config: GardenConfig,
  item: Item
): Promise<string[]> {
  return Promise.resolve(
    item.filename
      ? dirname(item.filename)
          .split(sep)
          .slice(config.hasMultiple ? 1 : 0)
      : []
  );
}

export async function findBackLinks(
  garden: Garden,
  name: string
): Promise<string[]> {
  const things = await garden.load();
  return garden.findBackLinks(things, name).map((link) => link.name);
}

const DEFAULT_NAME = "README";

export async function findItem(config: GardenConfig, name: string | false) {
  return new FileItem(
    config.directory,
    await findFile(
      config,
      config.directory,
      (name ? name : DEFAULT_NAME) + ".md"
    ),
    true
  );
}

export async function findItemOrWanted(
  config: GardenConfig,
  name: string | false
): Promise<Item> {
  try {
    return await findItem(config, name);
  } catch (error) {
    return {
      name: name || DEFAULT_NAME,
      content: `# ${name}\n\nWanted`,
    };
  }
}

export async function getAllItems(config: GardenConfig): Promise<Item[]> {
  const files = await findFiles(config, config.directory);
  return files.map((filename) => {
    return new FileItem(config.directory, filename);
  });
}
