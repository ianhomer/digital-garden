import { findFilesDeep } from "./file";

const garden2Directory = "../test-gardens/content/garden2";

it("should find files deep", async () => {
  const filenames = [];
  for await (const filename of findFilesDeep(garden2Directory)) {
    filenames.push(filename);
  }
  expect(filenames.length).toBe(2);
});
