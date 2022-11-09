import { GardenRepository, ItemReference } from "@garden/types";
import fs from "fs";
import { resolve } from "path";

import { BaseItem } from "./base-item";
const { readdir } = fs.promises;

const shouldIncludeDirectory = (excludedDirectories: string[], name: string) =>
  !excludedDirectories.includes(name) && !name.startsWith(".");

const withoutMarkdownExtension = (filename: string) =>
  filename.substring(0, filename.length - 3);

class FileItemReference implements ItemReference {
  name;
  filename;

  constructor(name: string, filename: string) {
    this.name = name;
    this.filename = filename;
  }
}

export class FileItem extends BaseItem {
  constructor(filename: string) {
    const fileContent = fs.readFileSync(filename, "utf8");
    super(filename, fileContent);
  }
}

export class FileGardenRepository implements GardenRepository {
  excludedDirectories;
  directory;

  constructor(directory: string, excludedDirectories: string[] = []) {
    this.excludedDirectories = excludedDirectories;
    this.directory = directory;
  }

  async load(itemReference: ItemReference | string) {
    if (itemReference instanceof FileItemReference) {
      return new FileItem(itemReference.filename);
    } else if (typeof itemReference === "string") {
      return new FileItem(
        ((await this.find(itemReference)) as FileItemReference).filename
      );
    } else {
      throw `Cannot load ${itemReference.name} since not a FileItemReference`;
    }
  }

  async #findInDirectory(
    explicitDirectory: string,
    filename: string
  ): Promise<string | false> {
    const directories = await readdir(explicitDirectory, {
      withFileTypes: true,
    });
    // Files first
    for (const child of directories) {
      if (!child.isDirectory() && child.name == filename) {
        return resolve(explicitDirectory, child.name);
      }
    }
    // ... then directories
    for (const child of directories) {
      if (
        child.isDirectory() &&
        shouldIncludeDirectory(this.excludedDirectories, child.name)
      ) {
        const resolved = resolve(explicitDirectory, child.name);
        const candidate = await this.#findInDirectory(resolved, filename);
        if (candidate) {
          return candidate;
        }
      }
    }

    return false;
  }

  async find(name: string) {
    const filename = await this.#findInDirectory(this.directory, `${name}.md`);
    if (!filename) {
      throw `Cannot find ${name}`;
    }
    return new FileItemReference(name, filename);
  }

  async *#findAllInDirectory(
    explicitDirectory: string
  ): AsyncIterable<ItemReference> {
    const directories = await readdir(explicitDirectory, {
      withFileTypes: true,
    });
    for (const child of directories) {
      const resolved = resolve(explicitDirectory, child.name);
      if (
        child.isDirectory() &&
        shouldIncludeDirectory(this.excludedDirectories, child.name)
      ) {
        yield* this.#findAllInDirectory(resolved);
      }
    }

    for (const child of directories) {
      const resolved = resolve(explicitDirectory, child.name);
      if (!child.isDirectory() && child.name.endsWith(".md")) {
        yield new FileItemReference(
          withoutMarkdownExtension(child.name),
          resolved
        );
      }
    }
  }

  async *findAll() {
    yield* this.#findAllInDirectory(this.directory);
  }
}
