export const iterableToArray = async (iterator: AsyncIterable<string>) => {
  const objects = [];
  for await (const object of iterator) {
    objects.push(object);
  }
  return objects;
};

export const garden1Config = {
  allowGlobalMeta: false,
  directory: "../test-gardens/content/garden1",
  verbose: false,
};

export const gardenConfig = {
  allowGlobalMeta: false,
  directory: "../test-gardens/content",
  verbose: false,
};
