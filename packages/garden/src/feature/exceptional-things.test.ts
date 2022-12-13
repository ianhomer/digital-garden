import { metaFrom } from "./feature-helpers";

describe("exception thing", () => {
  it("should load link with name of a js prototype property", async () => {
    const meta = await metaFrom({
      exceptional: `# Heading 1

## Heading 1.1

Accepted constructor.

## Heading 1.2

Using constructors.
`,
    });
    const thing = meta["exceptional#heading-11"];
    expect(thing.links.map((link) => link.name)).toStrictEqual(["constructor"]);
  });
});
