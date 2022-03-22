import { resolve } from "path";

const { readdir } = require("fs").promises;

async function* findFilesDeep(directory: string) {
  const directories = await readdir(directory, { withFileTypes: true });
  for (const child of directories) {
    const resolved = resolve(directory, child.name);
    if (child.isDirectory() && !["node_modules"].includes(child.name)) {
      yield* findFilesDeep(resolved);
    } else {
      if (child.name.endsWith(".md")) {
        yield resolved;
      }
    }
  }
}

// Find all files within a given named directory
async function* findFilesInNamedDirectoryDeep(directory: string, name: string) {
  const directories = await readdir(directory, { withFileTypes: true });
  for (const child of directories) {
    const resolved = resolve(directory, child.name);
    if (child.isDirectory()) {
      if (!child.name.startsWith(".")) {
        if (child.name == name) {
          const children = await readdir(resolved, { withFileTypes: true });
          for (const candidate of children) {
            if (candidate.isFile()) {
              yield candidate.name;
            }
          }
        }
        yield* findFilesInNamedDirectoryDeep(resolved, name);
      }
    }
  }
}

export async function findAbsoluteFile(
  directory: string,
  filename: string
): Promise<string> {
  const directories = await readdir(directory, { withFileTypes: true });
  for (const child of directories) {
    const resolved = resolve(directory, child.name);
    if (child.isDirectory()) {
      const candidate = await findAbsoluteFile(resolved, filename);
      if (candidate) {
        return candidate;
      }
    } else {
      if (child.name == filename) {
        return resolved;
      }
    }
  }
  return null;
}

export async function findFile(
  directory: string,
  filename: string
): Promise<string> {
  const found = await findAbsoluteFile(directory, filename);
  if (!found) {
    throw "Cannot find " + filename + " in " + directory;
  }

  return found.substring(directory.length + 1);
}

export async function findFiles(directory: string): Promise<string[]> {
  const files: string[] = [];
  for await (const file of findFilesDeep(directory)) {
    files.push(file);
  }
  return files;
}

export async function findFilesInNamedDirectory(
  directory: string,
  name: string
): Promise<string[]> {
  const files: string[] = [];
  for await (const file of findFilesInNamedDirectoryDeep(directory, name)) {
    files.push(file);
  }
  return files;
}
