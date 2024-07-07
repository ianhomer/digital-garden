const ALLOWED_ALTERNATIVE_PAGE_NAMES = [""];

export const isValidPageName = (name: string) =>
  /^[0-9a-z\\-]+(\+[0-9a-z]{2,6})?$/.test(name) ||
  ALLOWED_ALTERNATIVE_PAGE_NAMES.includes(name);

export const isNotValidPageName = (name: string) => !isValidPageName(name);
