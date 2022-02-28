import { exec } from "child_process";
import fs from "fs";

import config from "../../garden.config.js";
import { garden } from "../lib/garden/garden";

const cmdCallback = (error, stdout, stderr) => {
  error && console.error(`exec error: ${error}`);
  console.log(stdout);
  console.error(stderr);
  garden
    .refresh()
    .then((meta) => console.log(`refreshed ${Object.keys(meta).length}`));
};

if (!fs.existsSync(config.directory)) {
  console.log(`Creating ${config.directory}`);
  fs.mkdirSync(config.directory);
}

if (!fs.existsSync(`${config.directory}/README.md`)) {
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

garden
  .refresh()
  .then((meta) => console.log(`refreshed ${Object.keys(meta).length}`));
