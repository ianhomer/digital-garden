import dotenv from "dotenv";
import fs from "fs";
import { join } from "path";
dotenv.config();

function resolveDirectory() {
  if (process.env.GARDENS_DIRECTORY) {
    return join(process.cwd(), process.env.GARDENS_DIRECTORY);
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
  const directory = resolveDirectory();
  return {
    gardens: gardensFromEnv(),
    hasMultiple: !fs.existsSync(`${directory}/README.md`),
    directory,
  };
}

export default generateDefault();
