import { justNaturalLinks, toLinkName } from "../links";
import { metaFrom } from "./feature-helpers";

const foo = `
# Foo

To a bar
`;

const bar = `
# Bar

To a foo
`;

const baz = `
# Baz

To a bar
`;

describe("natural language", () => {
  it("should have a natural link to existing thing", async () => {
    const meta = await metaFrom({
      foo,
      bar,
    });
    expect(
      meta.foo.links.filter(justNaturalLinks).map(toLinkName),
    ).toStrictEqual(["bar"]);
    expect(
      meta.bar.links.filter(justNaturalLinks).map(toLinkName),
    ).toStrictEqual(["foo"]);
  });

  it("should have a natural link to a shared wanted thing", async () => {
    const meta = await metaFrom({
      foo,
      baz,
    });
    expect(
      meta.foo.links.filter(justNaturalLinks).map(toLinkName),
    ).toStrictEqual(["bar"]);
    expect(
      meta.baz.links.filter(justNaturalLinks).map(toLinkName),
    ).toStrictEqual(["bar"]);
  });
});
