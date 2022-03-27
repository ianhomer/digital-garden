import { resolve } from "path";

import { findFilesDeep } from "./file";
import { iterableToArray } from "./test-helpers";

const gardenDirectory = "../test-gardens/content/garden2";
const resolvedGardenDirectory = resolve(gardenDirectory) + "/";
const toRelativeName = (filename: string) =>
  filename.replace(resolvedGardenDirectory, "");

describe("file module", () => {
  it("should find deep files", async () => {
    const filenames = await iterableToArray(findFilesDeep([], gardenDirectory));
    expect(filenames.length).toBe(1);
    expect(filenames.map(toRelativeName)).toContain("word/garden2-word.md");
  });
});
