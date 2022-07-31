export const linkResolver = (name: string) =>
  name.replace(/ /g, "-").toLowerCase();

// A page resolver plugin compatible with the remark-wiki-link pageResolver
export const pageResolver = (name: string) => [linkResolver(name)];
