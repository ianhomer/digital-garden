import { resolve } from "path";

import { findFilesDeep } from "./file";

const gardenDirectory = "../test-gardens/content/garden2";
const resolvedGardenDirectory = resolve(gardenDirectory) + "/";
const toRelativeName = (filename: string) =>
  filename.replace(resolvedGardenDirectory, "");

it("should find deep files", async () => {
  const filenames = [];
  for await (const filename of findFilesDeep([], gardenDirectory)) {
    filenames.push(filename);
  }
  expect(filenames.length).toBe(1);
  expect(filenames.map(toRelativeName)).toContain("word/garden2-word.md");
});
