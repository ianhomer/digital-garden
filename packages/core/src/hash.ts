export const hash = (source: string) => {
  let value = 0;
  if (source.length === 0) {
    return value;
  }
  for (let i = 0; i < source.length; i++) {
    value = (value << 5) - value + source.charCodeAt(i);
    value |= 0;
  }
  return Math.abs(value).toString(36);
};
