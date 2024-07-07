import { linkResolver } from "./link-resolver";

// A page resolver plugin compatible with the remark-wiki-link pageResolver
export const pageResolver = (name: string) => [linkResolver(name)];
