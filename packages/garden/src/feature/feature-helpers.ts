import { BaseItem } from "../content";
import { createGarden } from "../garden";

export const metaAndContentFrom = async (content: {
  [key: string]: string;
}) => {
  return {
    meta: await createGarden({ content }).meta(),
    content: (name: string) =>
      new BaseItem(`${name}.md`, content[name]).content,
  };
};
