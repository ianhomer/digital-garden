import { findFile } from "./find";
import { createGarden } from "./garden";
import { garden1Config } from "./test-helpers";

const garden = createGarden(garden1Config);

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
