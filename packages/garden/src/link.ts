export const linkResolver = (name: string) =>
  name.replace(/ /g, "-").toLowerCase();

// A page resolver plugin compatible with the remark-wiki-link pageResolver
export const pageResolver = (name: string) => [linkResolver(name)];

export const isValidPageName = (name: string) => /^[0-9a-z\\-]+$/.test(name);

export const isNotValidPageName = (name: string) => !isValidPageName(name);
