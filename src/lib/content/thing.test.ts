import { getMeta } from "./thing";

it("gets base meta", () => {
  const meta = getMeta({ name: "my-name", filename: "not-set" });
  expect(meta.name).toBe("my-name");
});
