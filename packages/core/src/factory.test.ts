import { factory } from "./factory";
import { byName } from "./link";

describe("factor", () => {
  it("should create empty things", () => {
    const things = factory().build();
    expect(Object.keys(things)).toHaveLength(0);
  });

  it("should create a single thing", () => {
    const things = factory().thing("foo").new().build();
    expect(Object.keys(things)).toHaveLength(1);
    expect(things.foo.title).toStrictEqual("foo");
  });

  it("should create linked things", () => {
    const things = factory().thing("foo").new().linked("bar", "foo").build();
    expect(Object.keys(things)).toHaveLength(2);
    expect(things.bar.links.find(byName("foo"))).toBeDefined();
    expect(things.foo.title).toStrictEqual("foo");
  });

  it("should create deep links", () => {
    const things = factory().deep("word", 6).build();
    expect(Object.keys(things)).toHaveLength(6);
  });
});
