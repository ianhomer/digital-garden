import { justExplicitLinks, toLinkName } from "../links";
import { metaFrom } from "./feature-helpers";

const foo = `
# Foo

Foo content linking to [[bar]]
`;

const bar = `
# Bar

Bar content linking to [[foo]]
`;

describe("content with explicit link to existing things", () => {
  it("should have links to existing things", async () => {
    const meta = await metaFrom({
      foo,
      bar,
    });
    expect(Object.keys(meta)).toHaveLength(2);
    expect(meta.foo.title).toBe("Foo");
    expect(meta.bar.title).toBe("Bar");
    expect(
      meta.foo.links.filter(justExplicitLinks).map(toLinkName)
    ).toStrictEqual(["bar"]);
    expect(
      meta.bar.links.filter(justExplicitLinks).map(toLinkName)
    ).toStrictEqual(["foo"]);
  });
});
