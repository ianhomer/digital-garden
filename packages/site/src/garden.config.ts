import dotenv from "dotenv";
import fs from "fs";
import { isAbsolute, join } from "path";
dotenv.config({ path: "../../.env" });

const gardenDirectoryFromEnv = process.env.GARDENS_DIRECTORY;

function resolveDirectory() {
  if (gardenDirectoryFromEnv) {
    return isAbsolute(gardenDirectoryFromEnv)
      ? gardenDirectoryFromEnv
      : join(process.cwd(), gardenDirectoryFromEnv);
  }
  if (isParentDirectoryGarden()) {
    return join(process.cwd(), "../../..");
  }
  return join(process.cwd(), ".gardens");
}

function gardensFromEnv(): Record<string, string> {
  return Object.keys(process.env)
    .filter((key) => key.startsWith("GARDEN_"))
    .reduce((map: Record<string, string>, key: string) => {
      map[key.substring(7).toLowerCase()] = process.env[key] ?? "n/a";
      return map;
    }, {});
}

// garden is the parent directory
function isParentDirectoryGarden() {
  return fs.existsSync(`../../../README.md`);
}

function generateDefault() {
  const gardens = gardensFromEnv();
  const directory = (() => {
    if (
      gardenDirectoryFromEnv ||
      isParentDirectoryGarden() ||
      Object.keys(gardens).length
    ) {
      return resolveDirectory();
    }
    // this is the zero config, clone and run config
    return join(process.cwd(), "../test-gardens/content");
  })();
  return {
    gardens,
    hasMultiple: !fs.existsSync(`${directory}/README.md`),
    directory,
  };
}

export default generateDefault();
