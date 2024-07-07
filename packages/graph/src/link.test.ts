import { toParentName } from "./link";

describe("link", () => {
  describe("child", () => {
    it("should be able to parent from name", () => {
      expect(toParentName("foo#bar")).toBe("foo");
      expect(toParentName("foo")).toBeUndefined();
    });
  });
});
