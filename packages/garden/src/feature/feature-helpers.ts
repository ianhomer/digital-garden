import { BaseItem } from "../base-item";
import { createGarden, MetaMap } from "../garden";

export const metaAndContentFrom = async (content: {
  [key: string]: string;
}) => {
  return {
    meta: await metaFrom(content),
    content: (name: string) =>
      new BaseItem(`${name}.md`, content[name]).content,
  };
};

export const metaFrom = async (content: { [key: string]: string }) =>
  createGarden({ content }).meta();

export const dump = (meta: MetaMap) => {
  console.log(JSON.stringify(meta, null, "  "));
};
