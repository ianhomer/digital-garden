// convenience function to filter out duplicates in an array
export const unique = (value: string, index: number, self: string[]) =>
  self.indexOf(value) === index;
