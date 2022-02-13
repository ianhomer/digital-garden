import remarkParse from "remark-parse";
import { unified } from "unified";

import { Thing } from "./thing";

export function parse(thing: Thing) {
  return unified().use(remarkParse).parse(thing.content());
}
