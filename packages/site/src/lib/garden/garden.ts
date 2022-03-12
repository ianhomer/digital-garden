import fs from "fs";
import lodash from "lodash";
import { join } from "path";
import { resolve } from "path";
const { transform } = lodash;

import config from "../../../garden.config";
import { findFilesDeep } from "./file";
import { findDeepLinks } from "./gardenGraph";
import { process } from "./markdown";
import { FileThing } from "./thing";
import { ItemLink, Link, Meta, Things } from "./types";

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
      const extra = {};
      ["archive", "not"].forEach((ignore) => {
        if (filename.includes(`/${ignore}/`)) {
          extra["value"] = 0;
        }
      });
      meta[thing.name] = {
        ...extra,
        ...process(thing.content),
      };
    } else {
      console.error(`File ${filename} is not in garden ${config.directory}`);
    }
  }

  return transform(
    meta,
    (result, thing, name) => {
      result[name] = transform(
        thing,
        (_thing, value, key) => {
          if (key === "links") {
            _thing[key] = value.map((link) =>
              transform(
                link,
                (_link, linkValue, linkKey) => {
                  _link[linkKey] = linkValue;
                  if (thing?.value == 0 || meta[linkValue]?.value == 0) {
                    _link["value"] = 0;
                  }
                  return true;
                },
                {}
              )
            );
          } else {
            _thing[key] = value;
          }
          return true;
        },
        {}
      );
    },
    {}
  );
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
    findDeepLinks,
    thing: (filename: string) => {
      return loadThing(config, filename);
    },
  };
};
export const garden = createGarden(config);
