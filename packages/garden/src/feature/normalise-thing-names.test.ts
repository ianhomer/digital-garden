import { metaAndContentFrom } from "./feature-helpers";

const thing = `
# Thing

Thing content
`;

describe("normalise thing names", () => {
  it("should treat upper case names as lower case", async () => {
    const { meta } = await metaAndContentFrom({
      THING: thing,
    });
    console.log(JSON.stringify(meta, null, "  "));
    expect(Object.keys(meta)).toHaveLength(1);
    expect(meta.thing.title).toBe("Thing");
  });
});
