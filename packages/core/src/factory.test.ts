describe("factor", () => {
  it("should create empty things", () => {
    const things = factory().create();
    expect(things.length).toBe(0);
  });

  it("should create a single thing", () => {
    const things = factory().thing("foo").create();
    expect(things.length).toBe(1);
    expect(things.foo).toStrictEqual({});
  });

  it("should create linked things", () => {
    const things = factory().thing("foo").push().linked("bar", "foo").create();
    expect(things.length).toBe(2);
    expect(things.bar.links.foo).toStrictEqual({});
    expect(things.foo).toStrictEqual({});
  });
});
