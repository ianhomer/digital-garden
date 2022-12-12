import { metaFrom } from "./feature-helpers";

describe("exception thing", () => {
  it("should load OK", async () => {
    const meta = await metaFrom({
      exceptional: `# Test file

## Heading 1.1

### Heading Test

Accepted by the \`K()\` constructor.

### Heading 1.1.1

Many q threads.

## Heading 1.2

### Heading 1.2.1

Using typed constructors.
`,
    });
    const thing1 = meta.exceptional;
    console.log(JSON.stringify(thing1, null, "  "));
    const thing2 = meta["exceptional#heading-test"];
    console.log(JSON.stringify(thing2, null, "  "));
    console.log(JSON.stringify(thing2.links.map((link) => link.name)));
    expect(thing2.links.map((link) => link.name)).toStrictEqual([]);
  });
});
