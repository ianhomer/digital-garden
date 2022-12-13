import { builder } from "@garden/core";

import findDeepLinks from "../find-deep-links";

describe("graph depth", () => {
  it("should allowed names of js prototype properties", async () => {
    const things = builder()
      .thing("from")
      .to("constructor")
      .thing("constructor")
      .build();
    const deepLinks = findDeepLinks(things, "constructor", 1);
    expect(deepLinks.map((link) => link.source)).toStrictEqual(["constructor"]);
  });
});
