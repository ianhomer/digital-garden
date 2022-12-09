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

const baz = `
# Baz

Baz content linking to bars
`;

const fez = `
# Fez

Fez linking to bar
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
      expect(Object.keys(meta)).toHaveLength(2);
      expect(
        meta.foo.links.filter(justNaturalLinks).map(toLinkName)
      ).toStrictEqual(["foo"]);
    });

    it("should have multiple natural wanted without single wanted alias", async () => {
      const meta = await metaFrom({
        foo,
        baz,
      });
      expect(Object.keys(meta)).toHaveLength(3);
      expect(meta.bars.title).toBe("bars");

      expect(
        meta.foo.links.filter(justNaturalLinks).map(toLinkName)
      ).toStrictEqual(["foo", "bars"]);
      expect(meta.bars.links).toHaveLength(0);
    });

    it("should have multiple natural wanted and multiple wanted alias", async () => {
      const meta = await metaFrom({
        foo,
        fez,
        baz,
      });
      expect(Object.keys(meta)).toHaveLength(4);
      expect(meta.bars.title).toBe("bars");
      expect(
        meta.foo.links.filter(justNaturalLinks).map(toLinkName)
      ).toStrictEqual(["foo", "bars"]);
      expect(meta.bars.links.map(toLinkName)).toStrictEqual(["bar"]);
    });
  });
});
