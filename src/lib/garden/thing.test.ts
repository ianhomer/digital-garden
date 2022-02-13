import { Garden } from "./garden";
import { getMeta } from "./thing";

const garden: Garden = {
  config: {
    directory: "../../test/content/",
  },
};

it("gets base meta", () => {
  const meta = getMeta(garden, { name: "my-name", filename: "not-set" });
  expect(meta.name).toBe("my-name");
});
