export default {
  input: "dist/index.js",
  output: {
    file: "bundle.js",
    format: "umd",
    name: "graph",
    globals: {
      d3: "d3",
      "d3-quadtree": "d3",
      "@garden/core": "core",
      "@garden/types": "types",
    },
  },
  external: ["d3", "d3-quadtree", "@garden/core", "@garden/types"],
};
