import { createGarden } from "@garden/garden";
import { exec } from "child_process";
import fs from "fs";
import { join } from "path";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import config from "../../garden.config.js";

const argv = yargs(hideBin(process.argv)).argv;
const garden = createGarden(config);

const refresh = (filenameToPatch?: string) =>
  garden
    .refresh(filenameToPatch)
    .then((meta) => console.log(`refreshed ${Object.keys(meta).length} items`));

const cmdCallback = (error, stdout, stderr) => {
  error && console.error(`exec error: ${error}`);
  console.log(stdout);
  console.error(stderr);
  refresh();
};

if (!fs.existsSync(config.directory)) {
  console.log(`Creating ${config.directory}`);
  fs.mkdirSync(config.directory);
}

if (config.hasMultiple) {
  const gardens = config.gardens;
  Object.keys(gardens).forEach((garden) => {
    const gardenDirectory = `${config.directory}/${garden}`;
    if (fs.existsSync(gardenDirectory)) {
      console.log(`Garden ${gardenDirectory} already exists`);
    } else {
      const url = gardens[garden];
      console.log(`Cloning ${garden} to ${gardenDirectory}`);
      exec(`git clone ${url} ${gardenDirectory}`, cmdCallback);
    }
  });
}

const filenameToPatch = argv.patch
  ? join(config.directory, argv.patch || "unexpected-file-name")
  : undefined;
refresh(filenameToPatch);
