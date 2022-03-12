import nextTranspileModules from "next-transpile-modules";

const withTranspileModules = nextTranspileModules(
  ["@garden/garden", "@garden/types", "@garden/graph"],
  {
    resolveSymlinks: true,
  }
);

export default withTranspileModules({});
