import {
  isNotValidPageName,
  isValidPageName,
  pageResolver,
  toParentName,
} from "./link";

describe("link", () => {
  it("should render link in lowercase", () => {
    expect(pageResolver("Page")).toStrictEqual(["page"]);
  });
  it("should render space as dash", () => {
    expect(pageResolver("word 1")).toStrictEqual(["word-1"]);
  });

  it("should validate page name", () => {
    expect(isValidPageName("foo-bar")).toBeTruthy();
    expect(isValidPageName("123-foo-bar")).toBeTruthy();
    expect(isValidPageName("foo-bar>")).toBeFalsy();
    expect(isValidPageName("README")).toBeTruthy();
    expect(isValidPageName("")).toBeTruthy();
  });

  it("should validate invalid page name", () => {
    expect(isNotValidPageName("foo-bar")).toBeFalsy();
  });

  describe("child", () => {
    it("should be able to parent from name", () => {
      expect(toParentName("foo#bar")).toBe("foo");
      expect(toParentName("foo")).toBeUndefined();
    });
  });
});
