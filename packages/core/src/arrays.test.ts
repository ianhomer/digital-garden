import { unique } from "./arrays";

describe("arrays", () => {
  it("should dedupe array", () => {
    expect(["a", "a", "b"].filter(unique)).toStrictEqual(["a", "b"]);
  });
});
