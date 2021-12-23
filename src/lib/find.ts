import { resolve } from "path";
const { readdir } = require("fs").promises;

async function* findFilesDeep(directory: string) {
  const directories = await readdir(directory, { withFileTypes: true });
  for (const child of directories) {
    const resolved = resolve(directory, child.name);
    if (child.isDirectory() || child.isSymbolicLink()) {
      yield* findFilesDeep(resolved);
    } else {
      if (child.name.endsWith(".md")) {
        yield resolved;
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
    if (child.isDirectory() || child.isSymbolicLink()) {
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

  return found.substring(directory.length);
}

export async function findFiles(directory: string): Promise<string[]> {
  const files: string[] = [];
  for await (const file of findFilesDeep(directory)) {
    files.push(file);
  }
  return files;
}
