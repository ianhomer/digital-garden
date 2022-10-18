import { createGarden } from "@garden/garden";
import { exec } from "child_process";
import fs from "fs";
import { join } from "path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import config from "../garden.config";

const argv = yargs(hideBin(process.argv)).parseSync();
const garden = createGarden(config);

const refresh = (filenameToPatch?: string) =>
  garden.refresh(filenameToPatch).then((meta) => {
    console.log(`refreshed ${Object.keys(meta).length} items`);
    fs.copyFileSync(garden.getMetaFilename(), "public/garden.json");
  });

const cmdCallback = (error: Error | null, stdout: string, stderr: string) => {
  error && console.error(`exec error: ${error}`);
  console.log(stdout);
  console.error(stderr);
  refresh();
};

const mkdir = (directory: string) => {
  if (!fs.existsSync(directory)) {
    console.log(`Creating ${directory}`);
    fs.mkdirSync(directory);
  }
};

mkdir(config.directory);

if (config.hasMultiple) {
  const gardens = config.gardens;
  Object.keys(gardens).forEach((gardenName: string) => {
    const gardenDirectory = `${config.directory}/${gardenName}`;
    if (fs.existsSync(gardenDirectory)) {
      console.log(`Garden ${gardenDirectory} already exists`);
    } else {
      const url = gardens[gardenName];
      console.log(`Cloning ${gardenName} to ${gardenDirectory}`);
      exec(`git clone ${url} ${gardenDirectory}`, cmdCallback);
    }
  });
}

const filenameToPatch =
  typeof argv.patch === "string"
    ? join(garden.config.directory, argv.patch)
    : undefined;
refresh(filenameToPatch);
