import remarkParse from "remark-parse";
import { unified } from "unified";

import { Thing } from "./thing";

export async function parse(thing: Thing) {
  return await unified().use(remarkParse).process(thing.getContent());
}
