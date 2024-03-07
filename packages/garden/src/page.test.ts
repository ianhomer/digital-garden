import { createGarden, toConfig } from "./garden";
import { getPageItems } from "./page";
import { gardenConfig } from "./test-helpers";

const config = toConfig(gardenConfig);
const garden = createGarden(config);

describe("page", () => {
  it("should list pages", async () => {
    const items = await getPageItems(garden.repository);
    const names = items.map((item) => item.name);
    expect(names).toHaveLength(25);
  });
});
