import { ItemLink, Nameable } from "./types";

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
