import { toConfig } from "@garden/garden";
import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

const scriptsAsString = process.env.SCRIPTS || "[]";
const scripts = JSON.parse(scriptsAsString);

function generateDefault() {
  return toConfig(
    {
      scripts,
      defaultGardenDirectory: "../test-gardens/content",
    },
    process.env,
  );
}

export default generateDefault();
