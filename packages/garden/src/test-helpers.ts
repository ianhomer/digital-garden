import { GardenOptions } from "./garden";

export const iterableToArray = async (iterator: AsyncIterable<string>) => {
  const objects = [];
  for await (const object of iterator) {
    objects.push(object);
  }
  return objects;
};

export const garden1Config: GardenOptions = {
  allowGlobalMeta: false,
  directory: "../test-gardens/content/garden1",
  verbose: false,
};

export const garden1WithLiveMetaConfig: GardenOptions = {
  allowGlobalMeta: false,
  directory: "../test-gardens/content/garden1",
  verbose: false,
  liveMeta: true,
};

export const gardenConfig: GardenOptions = {
  allowGlobalMeta: false,
  directory: "../test-gardens/content",
  verbose: false,
};

export const toHex = (code: number, length: number) => {
  return code.toString(16).toUpperCase().padStart(length, "0");
};

export const toRawUnicode = (text: string) => {
  return text
    .split("")
    .map((character) => {
      const code = character.charCodeAt(0);
      if (code > 126 || code < 32) {
        return "\\u" + toHex(code, 4);
      } else {
        return character;
      }
    })
    .join("");
};
