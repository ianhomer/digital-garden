import { unified } from "unified";

import { Thing } from "./thing";

export async function process(thing: Thing) {
  const vfile = await unified();
}
