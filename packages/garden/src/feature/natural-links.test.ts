import { justNaturalLinks, toLinkName } from "../links";
import { metaFrom } from "./feature-helpers";

const foo = `
# Foo

To bar
`;

const bar = `
# Bar

To foo
`;

describe("natural link", () => {
  it("should have natural link", async () => {
    const meta = await metaFrom({
      foo,
      bar,
    });
    expect(
      meta.foo.links.filter(justNaturalLinks).map(toLinkName)
    ).toStrictEqual(["bar"]);
    expect(
      meta.bar.links.filter(justNaturalLinks).map(toLinkName)
    ).toStrictEqual(["foo"]);
  });
});
