import { Link, Meta, Things } from "@garden/types";
import fs from "fs";
import { join } from "path";
import { resolve } from "path";

import { findFilesDeep } from "./file";
import { process } from "./markdown";
import { FileThing } from "./thing";

const gardenMetaFile = ".garden-meta.json";

export interface Garden {
  config: GardenConfig;
  thing: (filename: string) => FileThing;
  findBackLinks: (things: Things, name: string) => Array<Link>;
  meta: () => Promise<Things>;
  load: () => Promise<Things>;
  refresh: () => Promise<Things>;
}
export interface GardenConfig {
  directory: string;
  gardens?: { [key: string]: string };
}

const loadThing = (config: GardenConfig, filename: string): FileThing => {
  const match = /([^/]*).md$/.exec(filename);
  return {
    filename,
    name: match ? match[1] : "filename",
    content: () =>
      fs.readFileSync(join(config.directory, `${filename}`), "utf8"),
  };
};

const generateMeta = async (
  config: GardenConfig
): Promise<{ [key: string]: Meta }> => {
  const gardenDirectory = resolve(config.directory);

  const meta: { [key: string]: Meta } = {};
  for await (const filename of findFilesDeep(config.directory)) {
    if (filename.startsWith(gardenDirectory)) {
      const thing = loadThing(
        config,
        filename.substring(gardenDirectory.length)
      );
      const extra: { value?: number } = {};
      ["archive", "not", "stop"].forEach((ignore) => {
        if (filename.includes(`/${ignore}/`)) {
          extra.value = 0;
        }
      });
      meta[thing.name] = {
        ...process(thing.content),
        ...extra,
      };
    } else {
      console.error(`File ${filename} is not in garden ${config.directory}`);
    }
  }

  const transformedMeta: { [key: string]: Meta } = {};

  Object.keys(meta).map((key) => {
    const thing = meta[key];
    transformedMeta[key] = {
      title: thing.title,
      value: thing.value,
      links: thing.links.map((link) => {
        const transformedLink: Link = { name: link.name };
        if (thing?.value == 0 || meta[link.name]?.value == 0) {
          transformedLink.value = 0;
        }
        return transformedLink;
      }),
    };
  });

  return transformedMeta;
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

export const findKnownThings = (things: Things) => {
  return Object.keys(things);
};

export const findLinkedThings = (things: Things) => {
  return Object.values(things)
    .map((thing) => thing.links.map((link: Link) => link.name))
    .flat();
};

export const findWantedThings = (things: Things) => {
  const knownThings = findKnownThings(things);
  return findLinkedThings(things).filter(
    (name: string) => !knownThings.includes(name)
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
    thing: (filename: string) => {
      return loadThing(config, filename);
    },
  };
};
