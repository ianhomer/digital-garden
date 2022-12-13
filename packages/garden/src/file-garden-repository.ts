import { ItemReference } from "@garden/types";
import fs from "fs";
import { join, resolve } from "path";

import { BaseGardenRepository } from "./base-garden-repository";
import { BaseItem } from "./base-item";
const { readdir } = fs.promises;

const shouldIncludeDirectory = (excludedDirectories: string[], name: string) =>
  !excludedDirectories.includes(name) && !name.startsWith(".");

export class FileItemReference implements ItemReference {
  name;
  filename;

  constructor(name: string, filename: string) {
    this.name = name;
    this.filename = filename;
  }
}

export class FileItem extends BaseItem {
  constructor(itemReference: FileItemReference, directory: string) {
    const fileContent = fs.readFileSync(
      join(directory, itemReference.filename),
      "utf8"
    );
    super(itemReference.name, itemReference.filename, fileContent);
  }
}

export class FileGardenRepository extends BaseGardenRepository {
  excludedDirectories;
  gardenDirectoryLength;
  directory;

  constructor(directory: string, excludedDirectories: string[] = []) {
    super();
    this.excludedDirectories = excludedDirectories;
    this.directory = directory;
    this.gardenDirectoryLength = resolve(directory).length + 1;
  }

  toItemReference(filename: string) {
    const matchName = /([^/]*).md$/.exec(filename);
    const name = matchName ? matchName[1] : filename;
    return new FileItemReference(this.normaliseName(name), filename);
  }

  toValue(itemReference: ItemReference) {
    if (itemReference instanceof FileItemReference) {
      // Fixed list of path elements that lead to a zero value thing which is
      // excluded from the graph. This is a cheap implementation of a value
      // concept that will evolved in the future. For now it helps reduce noise
      // in the graph.
      for (const ignore of ["archive", "not", "stop"]) {
        if (itemReference.filename.includes(`/${ignore}/`)) {
          return 0;
        }
      }
    }
    return super.toValue(itemReference);
  }

  toUri(itemReference: ItemReference) {
    if (itemReference instanceof FileItemReference) {
      return itemReference.filename;
    }
    return super.toUri(this.toUri);
  }

  async load(itemReference: ItemReference) {
    if (itemReference instanceof FileItemReference) {
      return new FileItem(itemReference, this.directory);
    }
    return super.load(itemReference);
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
      if (!child.isDirectory() && child.name.toLowerCase() === filename) {
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
      throw `Cannot find ${name} in ${this.directory}`;
    }
    return new FileItemReference(
      name,
      filename.substring(this.gardenDirectoryLength)
    );
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
        yield this.toItemReference(
          resolved.substring(this.gardenDirectoryLength)
        );
      }
    }
  }

  async *findAll() {
    yield* this.#findAllInDirectory(this.directory);
  }
}
