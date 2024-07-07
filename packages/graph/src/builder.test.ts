import { builder } from "./builder";
import { byName } from "./link";

describe("factor", () => {
  it("should create empty things", () => {
    const things = builder().build();
    expect(Object.keys(things)).toHaveLength(0);
  });

  it("should create a single thing", () => {
    const things = builder().name("foo").build();
    expect(Object.keys(things)).toHaveLength(1);
    expect(things.foo.title).toStrictEqual("foo");
  });

  it("should create linked things", () => {
    const things = builder().name("foo").and().name("bar").to("foo").build();
    expect(Object.keys(things)).toHaveLength(2);
    expect(things.bar.links.find(byName("foo"))).toBeDefined();
    expect(things.foo.title).toStrictEqual("foo");
  });

  it("should create deep links", () => {
    const things = builder().deep("word", 6).build();
    expect(Object.keys(things)).toHaveLength(6);
  });

  it("should create many things", () => {
    const things = builder().many(50).build();
    expect(Object.keys(things)).toHaveLength(50);
  });
});
