import { metaAndContentFrom } from "./feature-helpers";

const thing = `
# Thing

Thing content
`;

const foo = `
# Foo

Foo content
`;

const bar = `
# Bar

Bar content
`;

describe("create garden", () => {
  it("should have a simple thing", async () => {
    const { meta, content } = await metaAndContentFrom({
      thing,
    });
    expect(Object.keys(meta)).toHaveLength(1);
    expect(meta.thing.title).toBe("Thing");
    expect(content("thing")).toBe(thing);
  });

  it("should have two simple things", async () => {
    const { meta, content } = await metaAndContentFrom({
      foo,
      bar,
    });
    expect(Object.keys(meta)).toHaveLength(2);
    expect(meta.foo.title).toBe("Foo");
    expect(meta.bar.title).toBe("Bar");
    expect(content("foo")).toBe(foo);
    expect(content("bar")).toBe(bar);
  });
});
