import markdownToHtml from "../markdownToHtml";

describe("missing languageg", () => {
  it("should default if language not recognised", async () => {
    const html = markdownToHtml(`# Missing language

Missing language example

\`\`\`q
q language not known
\`\`\`
`);
    expect(html).toBe("XXX");
  });
});
