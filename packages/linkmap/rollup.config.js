import typescript from "@rollup/plugin-typescript";

export default {
  input: "src/index.ts",
  output: {
    file: "bundle.js",
    format: "umd",
    name: "linkmap",
    globals: {
      d3: "d3",
      "d3-quadtree": "d3",
    },
  },
  external: ["d3", "d3-quadtree"],
  plugins: [typescript()],
};
