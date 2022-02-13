import { createGarden } from "./garden";

const garden = createGarden({
  directory: "./src/test/content",
});

it("should create garden", () => {
  expect(garden.config.directory).toBe("./src/test/content");
});

it("should create meta", () => {
  const meta = garden.meta();
  expect(Object.keys(meta).length).toBe(2);
});
