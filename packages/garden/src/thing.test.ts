import { createGarden } from "./garden";

const garden = createGarden({
  directory: "./src/test/content/",
});

describe("thing", () => {
  it("should have name", () => {
    const thing = garden.thing("garden/my-name.md");
    expect(thing.name).toBe("my-name");
  });
});
