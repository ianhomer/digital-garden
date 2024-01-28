import { toConfig } from "@garden/garden";

function generateDefault() {
  return toConfig(
    {
      defaultGardenDirectory: "../test-gardens/content",
    },
    process.cwd(),
    process.env,
  );
}

export default generateDefault();
