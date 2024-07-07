import { isNotValidPageName, isValidPageName } from ".";

describe("link", () => {
  it("should validate page name", () => {
    expect(isValidPageName("foo-bar")).toBeTruthy();
    expect(isValidPageName("123-foo-bar")).toBeTruthy();
    expect(isValidPageName("foo-bar>")).toBeFalsy();
    expect(isValidPageName("README")).toBeFalsy();
    expect(isValidPageName("")).toBeTruthy();
  });

  it("should validate invalid page name", () => {
    expect(isNotValidPageName("foo-bar")).toBeFalsy();
  });
});
