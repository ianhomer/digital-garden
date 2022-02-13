import { Garden } from "./garden";
import { createThing } from "./thing";

const garden: Garden = {
  config: {
    directory: "./src/test/content/",
  },
};

it("gets base meta", () => {
  const thing = createThing(garden, "garden/my-name.md");
  expect(thing.name).toBe("my-name");
});
