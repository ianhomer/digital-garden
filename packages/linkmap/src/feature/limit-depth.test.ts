import { builder, bySource } from "@garden/graph";

import findDeepLinks from "../find-deep-links";

describe("graph depth", () => {
  it("should be limited", async () => {
    const things = builder().deep("word", 6).build();
    const deepLinks = findDeepLinks(things, "word-1", 3);
    expect(deepLinks.find(bySource("word-4"))).toBeDefined();
    expect(deepLinks.find(bySource("word-5"))).toBeUndefined();
    expect(deepLinks.length).toBe(5);
    expect(deepLinks).toStrictEqual([
      { depth: 1, source: "word-1", target: "word-2", type: "to" },
      { depth: 1, source: "word-1", target: "word-0", type: "from" },
      { depth: 2, source: "word-2", target: "word-3", type: "to" },
      { depth: 3, source: "word-3", target: "word-4", type: "to" },
      { depth: 4, source: "word-4", target: "word-5", type: "to" },
    ]);
  });
});
