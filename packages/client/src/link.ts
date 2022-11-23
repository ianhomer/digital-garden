const toParentName = (name: string) => {
  const index = name.indexOf("#");
  return index > 0 ? name.slice(0, index) : undefined;
};

export { toParentName };
