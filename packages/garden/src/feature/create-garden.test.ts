import { gardenFrom } from "./feature-helpers";

describe("create garden", () => {
  it("should have a thing", async () => {
    const { things, content } = await gardenFrom({
      thing: "# Thing\n\nthing content",
    });
    expect(Object.keys(things)).toHaveLength(1);
    expect(things.thing.title).toBe("Thing");
    expect(content("thing")).toBe("# Thing\n\nthing content");
  });
});
