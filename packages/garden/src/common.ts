export const unique = (value: string, index: number, self: string[]) =>
  self.indexOf(value) === index;

export const notUnique = (value: string, index: number, self: string[]) =>
  self.indexOf(value) !== index;
