import { metaFrom } from "./feature-helpers";

const archived = `
# Archived thing

Archived content
`;

const foo = `
# Foo

Link to [[archived]] thing
`;

describe("archived thing", () => {
  // Given thing is archived
  // Then the thing should have zero value
  it("should have zero value", async () => {
    const meta = await metaFrom({
      "archive-archived": archived,
    });
    expect(meta["archive-archived"].title).toBe("Archived thing");
    expect(meta["archive-archived"].value).toBe(0);
  });

  // Given thing links to archived thing
  // Then the link should have zero value
  it("should should have zero value from non-archived thing", async () => {
    const meta = await metaFrom({
      "archive-archived": archived,
      foo,
    });
    expect(meta.foo.links[0].value).toBe(0);
  });
});
