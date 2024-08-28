import { createGarden } from "../garden";

export const metaFrom = async (content: { [key: string]: string }) =>
  createGarden({
    content,
    type: "inmemory",
    publish: { exclude: [], include: ["included"] },
  }).meta();

const excluded = `
# Excluded
`;

const included = `---
tags: included
---

# Included
`;

describe("included by tags", () => {
  it("should include content that is included", async () => {
    const meta = await metaFrom({
      included,
    });

    expect(Object.keys(meta)).toHaveLength(1);
  });

  it("should not include content that is not included", async () => {
    const meta = await metaFrom({
      excluded,
    });

    expect(Object.keys(meta)).toHaveLength(0);
  });
});
