import { expect } from "@jest/globals";
import type { MatcherFunction } from "expect";

import { justExplicitLinks, toLinkName } from "./links";

const toHaveExplicitLinks: MatcherFunction<[linkNames: string[]]> = (
  actual,
  linkNames,
) => {
  expect(actual.links.filter(justExplicitLinks).map(toLinkName)).toStrictEqual(
    linkNames,
  );
};

expect.extend({
  toHaveExplicitLinks,
});
