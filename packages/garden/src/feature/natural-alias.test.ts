import { justNaturalLinks, toLinkName } from "../links";
import { metaFrom } from "./feature-helpers";

const foo = `
# Foo

Foo linking to bars
`;

const bar = `
# Bar

Bar linking to [[foo]]
`;

const gum = `
# Gum

Gum content
`;

describe("natural language", () => {
  describe("with plural of existing thing", () => {
    it("should have linked alias to singular thing", async () => {
      const meta = await metaFrom({
        foo,
        bar,
      });
      expect(Object.keys(meta)).toHaveLength(3);
      expect(meta.bars.title).toBe("bars");
      expect(
        meta.foo.links.filter(justNaturalLinks).map(toLinkName)
      ).toStrictEqual(["foo", "bars"]);
    });
  });

  describe("with plural of thing that does not exist", () => {
    it("should not have a linked alias", async () => {
      const meta = await metaFrom({
        foo,
        gum,
      });
      expect(Object.keys(meta)).toHaveLength(3);
      expect(meta.bars.title).toBe("bars");
      expect(
        meta.foo.links.filter(justNaturalLinks).map(toLinkName)
      ).toStrictEqual(["foo"]);
    });
  });
});
