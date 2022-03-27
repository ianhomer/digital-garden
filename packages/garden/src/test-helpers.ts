export const iterableToArray = async (iterator: AsyncIterable<string>) => {
  const objects = [];
  for await (const object of iterator) {
    objects.push(object);
  }
  return objects;
};
