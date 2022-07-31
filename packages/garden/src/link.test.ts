describe("link", () => {
  it("should render link in lowercase", () => {
    expect(pageResolver("Page")).toStrictEqual(["page"]);
  });
  it("should render space as dash", () => {
    expect(pageResolver("word 1")).toStrictEqual(["word-1"]);
  });
});
