import { builder } from "./builder";
import { byName } from "./link";

describe("factor", () => {
  it("should create empty items", () => {
    const items = builder().build();
    expect(Object.keys(items)).toHaveLength(0);
  });

  it("should create a single item", () => {
    const items = builder().name("foo").build();
    expect(Object.keys(items)).toHaveLength(1);
    expect(items.foo.title).toStrictEqual("foo");
  });

  it("should create linked items", () => {
    const items = builder().name("foo").and().name("bar").to("foo").build();
    expect(Object.keys(items)).toHaveLength(2);
    expect(items.bar.links.find(byName("foo"))).toBeDefined();
    expect(items.foo.title).toStrictEqual("foo");
  });

  it("should create deep links", () => {
    const things = builder().deep("word", 6).build();
    expect(Object.keys(things)).toHaveLength(6);
  });

  it("should create many items", () => {
    const items = builder().many(50).build();
    expect(Object.keys(items)).toHaveLength(50);
  });
});
