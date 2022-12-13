import markdownToHtml from "../markdownToHtml";

describe("missing languageg", () => {
  it("should default if language not recognised", async () => {
    const html = await markdownToHtml(`# Missing language

Missing language example

\`\`\`q
q language not known
\`\`\`
`);
    expect(html)
      .toBe(`<h1 id="missing-language"><a href="#missing-language">Missing language</a></h1>
<p>Missing language example</p>
<pre><code class="hljs language-q">q language not known
</code></pre>`);
  });
});
