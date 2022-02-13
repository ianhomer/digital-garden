import { Garden } from "./garden";
import { createThing, getMeta } from "./thing";

const garden: Garden = {
  config: {
    directory: "./src/test/content/",
  },
};

it("gets base meta", () => {
  const thing = createThing(garden, "garden/my-name.md");
  expect(thing.name).toBe("my-name");
});
