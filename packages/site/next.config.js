export default {
  ...(process.env.GARDEN_STATIC === "true" ? { output: "export" } : {}),
  trailingSlash: true,
  transpilePackages: ["@garden/garden", "@garden/types", "@garden/graph"],
};
