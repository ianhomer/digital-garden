import { BaseItem } from "../content";
import { createGarden } from "../garden";

export const gardenFrom = async (content: { [key: string]: string }) => {
  return {
    things: await createGarden({ content }).meta(),
    content: (name: string) =>
      new BaseItem(`${name}.md`, content[name]).content,
  };
};
