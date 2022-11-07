import { justExplicitLinks, toLinkName } from "../links";
import { metaFrom } from "./feature-helpers";

const foo = `
# Foo

Foo content linking to [[bar's thing]]
`;

const barsThing = `
# Bar's Thing

Bar's thing content
`;

describe("non-alphanumeric links", () => {
  it("should normalise apostrophe", async () => {
    const meta = await metaFrom({
      foo,
      "bars-thing": barsThing,
    });
    expect(Object.keys(meta)).toHaveLength(2);
    expect(
      meta.foo.links.filter(justExplicitLinks).map(toLinkName)
    ).toStrictEqual(["bars-thing"]);
  });
});
