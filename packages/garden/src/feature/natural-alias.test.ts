import { justNaturalLinks, toLinkName } from "../links";
import { metaFrom } from "./feature-helpers";

const foo = `
# Foo

Foo linking to bars
`;

const bar = `
# Bar

Bar linking to [[foo]]
`;

const gum = `
# Gum

Gum content
`;

describe("natural alias", () => {
  it("should have linked alias when destination exists", async () => {
    const meta = await metaFrom({
      foo,
      bar,
    });
    expect(Object.keys(meta)).toHaveLength(3);
    expect(meta.bars.title).toBe("bars");
    expect(
      meta.foo.links.filter(justNaturalLinks).map(toLinkName)
    ).toStrictEqual(["foo", "bars"]);
  });

  it("should not have linked alias since when destination does not exist", async () => {
    const meta = await metaFrom({
      foo,
      gum,
    });
    expect(Object.keys(meta)).toHaveLength(3);
    expect(meta.bars.title).toBe("bars");
    expect(
      meta.foo.links.filter(justNaturalLinks).map(toLinkName)
    ).toStrictEqual(["foo"]);
  });
});
