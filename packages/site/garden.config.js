import dotenv from "dotenv";
import fs from "fs";
import { join } from "path";
dotenv.config({ path: "../../.env" });

const gardenDirectoryFromEnv = process.env.GARDENS_DIRECTORY;

function resolveDirectory() {
  if (gardenDirectoryFromEnv) {
    return join(process.cwd(), gardenDirectoryFromEnv);
  }
  return join(process.cwd(), ".gardens");
}

function gardensFromEnv() {
  return Object.keys(process.env)
    .filter((key) => key.startsWith("GARDEN_"))
    .reduce((map, key) => {
      map[key.substring(7).toLowerCase()] = process.env[key];
      return map;
    }, {});
}

function generateDefault() {
  const gardens = gardensFromEnv();
  const directory = (() => {
    if (gardenDirectoryFromEnv || Object.keys(gardens).length) {
      return resolveDirectory();
    }
    // this is the zero config, clone and run config
    return join(process.cwd(), "src/test/content");
  })();
  return {
    gardens,
    hasMultiple: !fs.existsSync(`${directory}/README.md`),
    directory,
  };
}

export default generateDefault();
