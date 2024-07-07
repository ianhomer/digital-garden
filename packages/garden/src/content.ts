import { hash } from "@garden/graph";
import { GardenRepository, Item } from "@garden/types";
import { dirname, sep } from "path";

import { findFilesInNamedDirectory } from "./find";
import { Garden, GardenConfig } from "./garden";

export async function findImplicitBackLinks(
  config: GardenConfig,
  name: string,
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
  item: Item,
): Promise<string[]> {
  return Promise.resolve(
    item.filename
      ? dirname(item.filename)
          .split(sep)
          .slice(config.hasMultiple ? 1 : 0)
      : [],
  );
}

export async function findBackLinks(
  garden: Garden,
  name: string,
): Promise<string[]> {
  const things = await garden.load();
  return garden.findBackLinks(things, name).map((link) => link.name);
}

const DEFAULT_NAME = "readme";

export async function findItem(
  repository: GardenRepository,
  name: string | false,
) {
  const itemReference = await repository.find(name ? name : DEFAULT_NAME);
  return repository.load(itemReference);
}

export async function findItemOrWanted(
  repository: GardenRepository,
  name: string | false,
): Promise<Item> {
  return findItem(repository, name).catch(() => ({
    name: name || DEFAULT_NAME,
    hash: hash(name || DEFAULT_NAME),
    content: `# ${name}\n\nWanted`,
  }));
}

export async function getAllItems(
  repository: GardenRepository,
): Promise<Item[]> {
  const array: Item[] = [];
  for await (const itemReference of repository.findAll()) {
    const hidden = await repository.isHidden(itemReference);
    if (!hidden) {
      const item = await repository.load(itemReference);
      array.push(item);
    }
  }

  // Add hashed names for entries with duplicate namings so that they
  // can still be resolved.
  const names = array.map((item) => item.name);
  const duplicateNames = names.filter(
    (item, index) => names.indexOf(item) !== index,
  );
  for (const item of array) {
    if (duplicateNames.indexOf(item.name) > -1) {
      array.push({
        name: item.name + "+" + item.hash,
        hash: item.hash,
        content: item.content,
      });
    }
  }

  return array;
}
