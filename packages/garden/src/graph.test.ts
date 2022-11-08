import { findDeepLinks } from "./graph";

it("should get deep links", async () => {
  const things = {
    "word-1": { title: "x", links: [{ name: "word-2" }] },
    "word-2": { title: "x", links: [] },
  };
  const deepLinks = findDeepLinks(things, "word-2", 3);
  expect(deepLinks.length).toBe(1);
});
