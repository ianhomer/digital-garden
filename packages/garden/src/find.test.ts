import { findFile } from "./find";
import { createGarden } from "./garden";

const garden = createGarden({
  allowGlobalMeta: false,
  directory: "../test-gardens/content/garden1",
  verbose: false,
});

describe("content", () => {
  it("should find item", async () => {
    const name = "word-1.md";
    const filename = await findFile(
      garden.config,
      garden.config.directory,
      name
    );
    expect(filename).toBe("word/word-1.md");
  });
});
