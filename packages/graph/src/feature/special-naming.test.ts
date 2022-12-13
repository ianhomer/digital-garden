import { builder } from "@garden/core";

import findDeepLinks from "../find-deep-links";

describe("graph depth", () => {
  it("should allowed names of js prototype properties", async () => {
    const things = builder().thing("from").to("constructor").build();
    const deepLinks = findDeepLinks(things, "word-1", 3);
    expect(deepLinks).toStrictEqual({});
  });
});
