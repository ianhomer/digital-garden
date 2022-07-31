export const linkResolver = (name: string) =>
  name.replace(/ /g, "-").toLowerCase();

export const pageResolver = (name: string) => [linkResolver(name)];
