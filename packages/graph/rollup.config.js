import alias from "@rollup/plugin-alias";
import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import path from "path";
const projectRootDir = path.resolve(__dirname);

export default {
  input: "src/index.ts",
  output: {
    file: "bundle.js",
    format: "umd",
    name: "graph",
    globals: {
      d3: "d3",
      "d3-quadtree": "d3",
    },
  },
  external: ["d3", "d3-quadtree", "@garden/core"],
  plugins: [
    // alias({
    //   entries: [{ find: "@garden/types", replacement:path.resolve(projectRootDir, "../types") }],
    // }),
    // nodeResolve({
    //   rootDir: path.join(projectRootDir, '../..'),
    //   preserveSymlinks : true,
    //   resolveOnly: ["@garden/types"]
    // }),
    typescript({
      compilerOptions: {
        preserveSymlinks: false,
        rootDir: "/Users/ian/projects/my/digital-garden/packages/",
        rootDirs: [
          "/Users/ian/projects/my/digital-garden/packages/types",
          "/Users/ian/projects/my/digital-garden/packages/graph",
        ],
      },
      filterRoot: false, //"/Users/ian/projects/my/digital-garden",
      // exclude: ["node_modules/(?!@garden)","**/*.test.ts"]
    }),
  ],
};
