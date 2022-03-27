import { findItem } from "./content";
import { createGarden } from "./garden";
import { garden1Config } from "./test-helpers";

const garden = createGarden(garden1Config);

describe("content", () => {
  it("should find item", async () => {
    const name = "word-1";
    const item = await findItem(garden.config, name);
    expect(item.name).toBe("word-1");
  });
});
