// import remarkParse from "remark-parse";
// import { unified } from "unified";

import { Thing } from "./thing";

export function parse(thing: Thing) {
  return {
    type: "root",
  };
  // return await unified().use(remarkParse).process(thing.getContent());
}
