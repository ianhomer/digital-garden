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
  external: ["d3", "d3-quadtree"],
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
        // rootDir: path.resolve(projectRootDir, ".."),
        // rootDirs: [
        //   path.resolve(projectRootDir, "../core"),
        //   // path.resolve(projectRootDir, "../types"),
        //   path.resolve(projectRootDir, "../graph"),
        // ],
      },
      // filterRoot: path.resolve(projectRootDir, "..")
      // exclude: ["node_modules/(?!@garden)","**/*.test.ts"]
    }),
  ],
};
