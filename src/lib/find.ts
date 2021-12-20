import { resolve } from "path";
const { readdir } = require("fs").promises;

async function* findFilesAsync(directory: string) {
  const directories = await readdir(directory, { withFileTypes: true });
  for (const child of directories) {
    const resolved = resolve(directory, child.name);
    if (child.isDirectory()) {
      yield* findFilesAsync(resolved);
    } else {
      if (child.name.endsWith(".md")) {
        yield resolved;
      }
    }
  }
}

export async function findFiles(directory: string): Promise<string[]> {
  const files: string[] = [];
  for await (const file of findFilesAsync(directory)) {
    files.push(file);
  }
  return files;
}
