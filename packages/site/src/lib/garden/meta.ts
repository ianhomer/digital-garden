export interface Link {
  to: string;
}

export interface Meta {
  title: string;
  links: Array<Link>;
}

export type Things = { [key: string]: Meta };
