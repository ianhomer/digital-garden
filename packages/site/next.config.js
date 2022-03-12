import nextTranspileModules from "next-transpile-modules";

const withTranspileModules = nextTranspileModules(["@garden/garden"], {
  resolveSymlinks: true,
});

export default withTranspileModules({});
