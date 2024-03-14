import { createGarden } from "./garden";

const noTags = `# no tags`;

const excluded = `---
tags: excluded
---

# excluded
`;

const included = `---
tags: included
---

# included
`;

describe("base garden repository", () => {
  it("should include item by default", async () => {
    const meta = await createGarden({
      content: { noTags },
      type: "inmemory",
    }).meta();
    expect(Object.keys(meta)).toHaveLength(1);
  });

  it("should include item all items if no publish config", async () => {
    const meta = await createGarden({
      content: { noTags, excluded, included },
      publish: {
        exclude: [],
        include: [],
      },
      type: "inmemory",
    }).meta();
    expect(Object.keys(meta)).toHaveLength(3);
  });

  it("should exclude item if excluded in config", async () => {
    const meta = await createGarden({
      content: { noTags, excluded, included },
      publish: {
        exclude: ["excluded"],
        include: [],
      },
      type: "inmemory",
    }).meta();
    expect(Object.keys(meta)).toHaveLength(2);
  });

  it("should include only included item if included in config", async () => {
    const meta = await createGarden({
      content: { noTags, excluded, included },
      publish: {
        exclude: [],
        include: ["included"],
      },
      type: "inmemory",
    }).meta();
    expect(Object.keys(meta)).toHaveLength(1);
    expect(meta["excluded"]).toBeUndefined();
    expect(meta["included"]).toBeDefined();
  });
});
