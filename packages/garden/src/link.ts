export const linkResolver = (name: string) =>
  name
    .replace(/ /g, "-")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "");

// A page resolver plugin compatible with the remark-wiki-link pageResolver
export const pageResolver = (name: string) => [linkResolver(name)];

export const isValidPageName = (name: string) => /^[0-9a-z\\-]+$/.test(name);

export const isNotValidPageName = (name: string) => !isValidPageName(name);

export const toParentName = (name: string) => {
  const index = name.indexOf("#");
  return index > 0 ? name.slice(0, index) : undefined;
};
