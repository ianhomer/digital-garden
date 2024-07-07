import { pageResolver } from ".";

describe("page-resolver", () => {
  it("should render link in lowercase", () => {
    expect(pageResolver("Page")).toStrictEqual(["page"]);
  });
  it("should render space as dash", () => {
    expect(pageResolver("word 1")).toStrictEqual(["word-1"]);
  });
  it("should normalised accented characters", () => {
    expect(pageResolver("áxâxÅxôxéxý")).toStrictEqual(["axaxaxoxexy"]);
  });
});
