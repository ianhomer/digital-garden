import { readdir } from "fs/promises";
import { resolve } from "path";

import { GardenConfig } from "./garden";

const shouldIncludeDirectory = (config: GardenConfig, name: string) =>
  !config.excludedDirectories.includes(name) && !name.startsWith(".");

async function* findFilesDeep(
  config: GardenConfig,
  directory: string
): AsyncIterable<string> {
  const directories = await readdir(directory, { withFileTypes: true });
  for (const child of directories) {
    const resolved = resolve(directory, child.name);
    if (child.isDirectory() && shouldIncludeDirectory(config, child.name)) {
      yield* findFilesDeep(config, resolved);
    } else {
      if (child.name.endsWith(".md")) {
        yield resolved;
      }
    }
  }
}

// Find all files within a given named directory
async function* findFilesInNamedDirectoryDeep(
  config: GardenConfig,
  directory: string,
  name: string
): AsyncIterable<string> {
  const directories = await readdir(directory, { withFileTypes: true });
  for (const child of directories) {
    const resolved = resolve(directory, child.name);
    if (child.isDirectory() && shouldIncludeDirectory(config, child.name)) {
      if (child.name == name) {
        const children = await readdir(resolved, { withFileTypes: true });
        for (const candidate of children) {
          if (candidate.isFile()) {
            yield candidate.name;
          }
        }
      }
      yield* findFilesInNamedDirectoryDeep(config, resolved, name);
    }
  }
}

export async function findAbsoluteFile(
  config: GardenConfig,
  directory: string,
  filename: string
): Promise<string | null> {
  const directories = await readdir(directory, { withFileTypes: true });
  // Files first
  for (const child of directories) {
    if (!child.isDirectory() && child.name == filename) {
      return resolve(directory, child.name);
    }
  }
  // ... then directories
  for (const child of directories) {
    if (child.isDirectory() && shouldIncludeDirectory(config, child.name)) {
      const resolved = resolve(directory, child.name);
      const candidate = await findAbsoluteFile(config, resolved, filename);
      if (candidate) {
        return candidate;
      }
    }
  }

  return null;
}

export async function findFile(
  config: GardenConfig,
  directory: string,
  filename: string
): Promise<string> {
  const found = await findAbsoluteFile(config, directory, filename);
  if (!found) {
    throw "Cannot find " + filename + " in " + directory;
  }

  return found.substring(resolve(directory).length + 1);
}

export async function findFiles(
  config: GardenConfig,
  directory: string
): Promise<string[]> {
  const files: string[] = [];
  for await (const file of findFilesDeep(config, directory)) {
    files.push(file);
  }
  return files;
}

export async function findFilesInNamedDirectory(
  config: GardenConfig,
  directory: string,
  name: string
): Promise<string[]> {
  const files: string[] = [];
  for await (const file of findFilesInNamedDirectoryDeep(
    config,
    directory,
    name
  )) {
    files.push(file);
  }
  return files;
}
