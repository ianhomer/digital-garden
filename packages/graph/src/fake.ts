/**
 * Returns a fake name. The same fake name is return each time called with given
 * parameters. This is useful for generating a variety of test names for the
 * garden
 *
 * @param index - number indicating which fake name to return
 * @returns string fake name
 */
export const toFakeName = (
  index: number,
  words = ["foo", "bar", "baz", "qux", "fez", "tik", "mox"],
) => {
  const radix = words.length;
  return index
    .toString(radix)
    .split("")
    .reverse()
    .map((i) => words[parseInt(i)])
    .join("-");
};
