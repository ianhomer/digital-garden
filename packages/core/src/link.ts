import { ItemLink, Nameable } from "@garden/types";

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

// A page resolver plugin compatible with the remark-wiki-link pageResolver
export const pageResolver = (name: string) => [linkResolver(name)];

const ALLOWED_ALTERNATIVE_PAGE_NAMES = [""];

export const isValidPageName = (name: string) =>
  /^[0-9a-z\\-]+(\+[0-9a-z]{2,6})?$/.test(name) ||
  ALLOWED_ALTERNATIVE_PAGE_NAMES.includes(name);

export const isNotValidPageName = (name: string) => !isValidPageName(name);

/**
 * Get the parent name of an item based on the child name. A child name is
 * composed of the parent name followed by the "#" character and then the
 * relative child name, e.g. a-parent#a-child.
 *
 * @param name - child name
 * @returns parent name
 **/
export const toParentName = (name: string) => {
  const index = name.indexOf("#");
  return index > 0 ? name.slice(0, index) : undefined;
};

export const bySource = (source: string) => (link: ItemLink) =>
  link.source === source;

export const byName = (name: string) => (nameable: Nameable) =>
  nameable.name === name;
