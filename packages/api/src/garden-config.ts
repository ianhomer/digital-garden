import { toConfig } from "@garden/garden";

function generateDefault() {
  return toConfig(
    {
      defaultGardenDirectory: "../test-gardens/content",
    },
    process.env,
  );
}

export default generateDefault();
