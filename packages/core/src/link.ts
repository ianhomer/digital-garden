import { ItemLink, Nameable } from "@garden/types";

export const linkResolver = (name: string) =>
  name
    .replace(/[ \\/\\.]/g, "-")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "");

// A page resolver plugin compatible with the remark-wiki-link pageResolver
export const pageResolver = (name: string) => [linkResolver(name)];

const ALLOWED_ALTERNATIVE_PAGE_NAMES = [""];

export const isValidPageName = (name: string) =>
  /^[0-9a-z\\-]+(\+[0-9a-z]{2,6})?$/.test(name) ||
  ALLOWED_ALTERNATIVE_PAGE_NAMES.includes(name);

export const isNotValidPageName = (name: string) => !isValidPageName(name);

export const toParentName = (name: string) => {
  const index = name.indexOf("#");
  return index > 0 ? name.slice(0, index) : undefined;
};

export const bySource = (source: string) => (link: ItemLink) =>
  link.source === source;

export const byName = (name: string) => (nameable: Nameable) =>
  nameable.name === name;
