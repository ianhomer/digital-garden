import { GardenRepository, Item } from "@garden/types";
import { dirname, sep } from "path";

import { findFilesInNamedDirectory } from "./find";
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

export async function findItem(
  repository: GardenRepository,
  name: string | false
) {
  return repository.load(name ? name : DEFAULT_NAME);
}

export async function findItemOrWanted(
  repository: GardenRepository,
  name: string | false
): Promise<Item> {
  return findItem(repository, name).catch(() => ({
    name: name || DEFAULT_NAME,
    content: `# ${name}\n\nWanted`,
  }));
}

export async function getAllItems(
  repository: GardenRepository
): Promise<Item[]> {
  const array = [];
  for await (const itemReference of repository.findAll()) {
    array.push(await repository.load(itemReference));
  }
  return array;
}
