import fs from "fs";
import { resolve } from "path";
const { readdir } = fs.promises;

const shouldIncludeDirectory = (excludedDirectories: string[], name: string) =>
  !excludedDirectories.includes(name) && !name.startsWith(".");

export async function* findFilesDeep(
  excludedDirectories: string[],
  directory: string
): AsyncIterable<string> {
  const directories = await readdir(directory, { withFileTypes: true });
  for (const child of directories) {
    const resolved = resolve(directory, child.name);
    if (child.isDirectory()) {
      if (shouldIncludeDirectory(excludedDirectories, child.name)) {
        yield* findFilesDeep(excludedDirectories, resolved);
      }
    } else {
      if (child.name.endsWith(".md")) {
        yield resolved;
      }
    }
  }
}
