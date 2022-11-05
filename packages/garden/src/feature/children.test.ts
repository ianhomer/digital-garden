import { metaFrom } from "./feature-helpers";

const foo = `
# Foo

To [[another foo]]

## Bar

To [[another bar]]

## Baz

To [[another baz]]
`;

describe("thing with sections", () => {
  it("should have children that link to explicit things", async () => {
    const meta = await metaFrom({
      foo,
    });
    expect(Object.keys(meta)).toHaveLength(3);
    expect(meta.foo.links[0].name).toBe("another-foo");
    expect(meta["foo#bar"].links[0].name).toBe("another-bar");
    expect(meta["foo#baz"].links[0].name).toBe("another-baz");
  });
});
