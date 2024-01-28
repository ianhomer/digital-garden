import { toConfig } from "@garden/garden";
import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

const scriptsAsString = process.env.SCRIPTS || "[]";
const scripts = JSON.parse(scriptsAsString);

function generateDefault() {
  const config = toConfig(
    {
      scripts,
      defaultGardenDirectory: "../test-gardens/content",
    },
    process.env,
  );
  console.log(config);
  return config;
}

export default generateDefault();
