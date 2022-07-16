export interface Item {
  name: string;
  filename?: string;
  content: string;
}

export interface Link {
  name: string;
  type?: LinkType;
  value?: number;
}

export interface ItemLink {
  source: string;
  target: string;
  depth: number;
  type: LinkType;
}

export interface Meta {
  title: string;
  links: Array<Link>;
  value?: number;
}

export enum LinkType {
  To = "to",
  From = "from",
  Has = "has",
  In = "in",
  NaturalTo = "natural",
  NaturalFrom = "naturalFrom",
}

export type Things = { [key: string]: Meta };
