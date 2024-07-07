/**
 * Generate the link name given for the text. This is a common normalisation for
 * any text so that it can be referenced in a URL.
 *
 * @param name - text to normalise to a link name
 * @returns normalised link name
 */
export const linkResolver = (name: string) =>
  name
    .replace(/[ \\/\\.]/g, "-")
    .toLowerCase()
    // normalize according to NFD - canonical decompisition - https://unicode.org/reports/tr15/
    // NFD effectively removes accents and reduces variations on to single form
    // more suitable for URLs
    .normalize("NFD")
    .replace(/[^a-z0-9-]/g, "");
