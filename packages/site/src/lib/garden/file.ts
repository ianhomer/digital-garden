import fs from "fs";
import { resolve } from "path";
const { readdir } = fs.promises;

export async function* findFilesDeep(directory: string) {
  const directories = await readdir(directory, { withFileTypes: true });
  for (const child of directories) {
    const resolved = resolve(directory, child.name);
    if (child.isDirectory()) {
      yield* findFilesDeep(resolved);
    } else {
      if (child.name.endsWith(".md")) {
        yield resolved;
      }
    }
  }
}
