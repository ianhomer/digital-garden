import { isNotValidPageName, isValidPageName, pageResolver } from "./link";

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
  });

  it("should validate invalid page name", () => {
    expect(isNotValidPageName("foo-bar")).toBeFalsy();
  });
});
