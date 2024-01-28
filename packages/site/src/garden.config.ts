import { gardensFromEnv, toConfig } from "@garden/garden";
import dotenv from "dotenv";
import fs from "fs";
import { isAbsolute, join } from "path";
dotenv.config({ path: "../../.env" });

const scriptsAsString = process.env.SCRIPTS || "[]";
const scripts = JSON.parse(scriptsAsString);
const gardenDirectoryFromEnv = process.env.GARDENS_DIRECTORY;

function resolveDirectory() {
  if (gardenDirectoryFromEnv) {
    return isAbsolute(gardenDirectoryFromEnv)
      ? gardenDirectoryFromEnv
      : join(process.cwd(), gardenDirectoryFromEnv);
  }
  return join(process.cwd(), ".gardens");
}

function generateDefault() {
  const gardens = gardensFromEnv(process.env);
  const gardenRootDirectory = (() => {
    if (gardenDirectoryFromEnv || Object.keys(gardens).length) {
      return resolveDirectory();
    }
    // this is the zero config, clone and run config
    return join(process.cwd(), "../test-gardens/content");
  })();
  return toConfig({
    gardens,
    hasMultiple: !fs.existsSync(`${gardenRootDirectory}/README.md`),
    scripts,
    directory: gardenRootDirectory,
  });
}

export default generateDefault();
