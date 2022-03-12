import { createGarden } from "./garden";

const garden = createGarden({
  directory: "./src/test/content/",
});

it("gets base meta", () => {
  const thing = garden.thing("garden/my-name.md");
  expect(thing.name).toBe("my-name");
});
