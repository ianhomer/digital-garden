export interface Nameable {
  name: string;
}

export interface Link extends Nameable {
  type: LinkType;
  value: number;
}

export interface ItemLink {
  source: string;
  target: string;
  depth: number;
  type: LinkType;
}

export interface ItemMeta {
  title: string;
  hash: string;
  type: ItemType;
  aliases: Array<string>;
  links: Array<Link>;
  value: number;
}

export enum ItemType {
  Item = "item",
  Wanted = "wanted",
  ImplicitlyWanted = "implictlyWanted",
  Child = "child",
}

export enum LinkType {
  To = "to",
  From = "from",
  Has = "has",
  In = "in",
  Child = "child",
  ImplicitTo = "implicit",
  ImplicitFrom = "implicitFrom",
  ImplicitAlias = "implicitAlias",
}

export type Items = { [key: string]: ItemMeta };
