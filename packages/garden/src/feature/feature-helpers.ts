import { BaseItem } from "../base-item";
import { createGarden, MetaMap } from "../garden";

export const metaAndContentFrom = async (content: {
  [key: string]: string;
}) => {
  return {
    meta: await metaFrom(content),
    content: async (name: string) =>
      new BaseItem(`${name}.md`, content[name]).content,
  };
};

export const metaFrom = async (content: { [key: string]: string }) =>
  createGarden({ content, type: "inmemory" }).meta();

export const dump = (meta: MetaMap) => {
  console.log(JSON.stringify(meta, null, "  "));
};
