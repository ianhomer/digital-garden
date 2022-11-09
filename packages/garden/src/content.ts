import { Item } from "@garden/types";
import { dirname, join, sep } from "path";

import { FileGardenRepository } from "./file-garden-repository";
import { findFile, findFiles, findFilesInNamedDirectory } from "./find";
import { Garden, GardenConfig } from "./garden";

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
  return new FileGardenRepository(
    config.directory,
    config.excludedDirectories
  ).load(name ? name : DEFAULT_NAME);
}

export async function findItemOrWanted(
  config: GardenConfig,
  name: string | false
): Promise<Item> {
  return findItem(config, name).catch(() => ({
    name: name || DEFAULT_NAME,
    content: `# ${name}\n\nWanted`,
  }));
}

export async function getAllItems(config: GardenConfig): Promise<Item[]> {
  const gardenRepository = new FileGardenRepository(
    config.directory,
    config.excludedDirectories
  );
  const array = [];
  for await (const itemReference of gardenRepository.findAll()) {
    array.push(await gardenRepository.load(itemReference));
  }
  return array;
}
