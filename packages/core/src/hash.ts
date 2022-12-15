import { linkResolver } from "./link";

// cheap checksum
export const hash = (source: string) => {
  if (source.length === 0) {
    return "0";
  }
  let value = 0;
  // classic checksum
  for (let i = 0; i < source.length; i++) {
    // shift (1->32), minus current and add new character
    value = (value << 5) - value + source.charCodeAt(i);
    // bitwise to 32 bit integer
    value |= 0;
  }
  // redix with radix 36, i.e. characters 0-9a-z
  return Math.abs(value).toString(36); // + linkResolver(source);
};
