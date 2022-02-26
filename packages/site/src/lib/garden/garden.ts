import fs from "fs";
import { join } from "path";
import { resolve } from "path";

import config from "../../../garden.config";
import { findFilesDeep } from "./file";
import { process } from "./markdown";
import { FileThing } from "./thing";
import { ItemLink, Link, LinkType, Meta, Things } from "./types";

const gardenMetaFile = ".garden-meta.json";

export interface Garden {
  config: GardenConfig;
  thing: (filename: string) => FileThing;
  findBackLinks: (things: Things, name: string) => Array<Link>;
  findDeepLinks: (
    things: Things,
    name: string,
    depth: number
  ) => Array<ItemLink>;
  meta: () => Promise<Things>;
  load: () => Promise<Things>;
  refresh: () => Promise<Things>;
}
export interface GardenConfig {
  directory: string;
  gardens?: { [key: string]: string };
}

const loadThing = (config: GardenConfig, filename: string): FileThing => {
  return {
    filename,
    name: /([^/]*).md$/.exec(filename)[1],
    content: () =>
      fs.readFileSync(join(config.directory, `${filename}`), "utf8"),
  };
};

const generateMeta = async (
  config: GardenConfig
): Promise<{ [key: string]: Meta }> => {
  const gardenDirectory = resolve(config.directory);

  const meta = {};
  for await (const filename of findFilesDeep(config.directory)) {
    if (filename.startsWith(gardenDirectory)) {
      const thing = loadThing(
        config,
        filename.substring(gardenDirectory.length)
      );
      meta[thing.name] = process(thing.content);
    } else {
      console.error(`File ${filename} is not in garden ${config.directory}`);
    }
  }
  return meta;
};

const getMetaFilename = (config: GardenConfig) =>
  join(config.directory, gardenMetaFile);

const refresh = async (config: GardenConfig) => {
  const meta = await generateMeta(config);
  const fullGardenMetaFile = getMetaFilename(config);
  console.log(
    `Refreshing ${fullGardenMetaFile} : ${Object.keys(meta).length} things`
  );
  fs.writeFileSync(fullGardenMetaFile, JSON.stringify(meta));
  return meta;
};

async function loadMeta(config: GardenConfig) {
  const metaFilename = getMetaFilename(config);
  if (fs.existsSync(metaFilename)) {
    const content = fs.readFileSync(join(config.directory, gardenMetaFile));
    return JSON.parse(content.toString("utf8"));
  } else {
    console.log(`Meta file ${metaFilename} does not exist`);
    return {};
  }
}

const findBackLinks = (things: Things, name: string) => {
  return Object.keys(things)
    .filter((fromName) => {
      return things[fromName].links.map((link) => link.name).includes(name);
    })
    .map((fromName) => ({ name: fromName }));
};

const findDeepLinks = (
  things: Things,
  name: string,
  maxDepth: number,
  depth = 1
) => {
  if (!(name in things)) {
    return [];
  }
  const directLinks = [
    ...things[name].links.map((link) => ({
      source: name,
      target: link.name,
      depth,
      type: LinkType.To,
    })),
    ...Object.keys(things)
      .filter((fromName) => {
        return things[fromName].links.map((link) => link.name).includes(name);
      })
      .map((fromName) => ({
        source: name,
        target: fromName,
        depth,
        type: LinkType.From,
      })),
  ];
  return [
    ...directLinks,
    ...(maxDepth < depth + 1
      ? []
      : directLinks
          .map((link) =>
            findDeepLinks(things, link.target, maxDepth, depth + 1)
          )
          .flat()),
  ].filter(
    (value, index, self) =>
      index ===
      self.findIndex(
        (compareTo) =>
          (value.source == compareTo.source &&
            value.target == compareTo.target) ||
          (value.source == compareTo.target && value.target == compareTo.source)
      )
  );
};

export const createGarden = (config: GardenConfig): Garden => {
  return {
    config,
    meta: async () => await generateMeta(config),
    refresh: async () => await refresh(config),
    load: async () => await loadMeta(config),
    findBackLinks: (things: Things, name: string) => {
      return findBackLinks(things, name);
    },
    findDeepLinks,
    thing: (filename: string) => {
      return loadThing(config, filename);
    },
  };
};
export const garden = createGarden(config);
