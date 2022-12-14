import { createGarden, toConfig } from "./garden";
import { getPageItems } from "./page";
import { gardenConfig } from "./test-helpers";

const config = toConfig(gardenConfig);
const garden = createGarden(config);

describe("page", () => {
  it("should list pages", async () => {
    const things = await garden.meta();
    const items = await getPageItems(garden.repository, things);
    const names = items.map((item) => item.name);
    expect(names).toHaveLength(46);
  });
});
