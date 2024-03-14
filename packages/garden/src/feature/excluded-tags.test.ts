import { createGarden } from "../garden";

export const metaFrom = async (content: { [key: string]: string }) =>
  createGarden({
    content,
    type: "inmemory",
    publish: { exclude: ["excluded"], include: [] },
  }).meta();

const excluded = `---
tags: excluded
---

# Excluded
`;

const included = `# Included
`;

describe("excluded by tags", () => {
  it("should exclude content that is excluded", async () => {
    const meta = await metaFrom({
      excluded,
    });

    expect(Object.keys(meta)).toHaveLength(0);
  });

  it("should include content that is no excluded", async () => {
    const meta = await metaFrom({
      included,
    });

    expect(Object.keys(meta)).toHaveLength(1);
  });
});
