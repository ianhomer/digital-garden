const config = require("../../garden.config.js");
const { exec } = require("child_process");
const fs = require("fs");

const cmdCallback = (error, stdout, stderr) => {
  error && console.error(`exec error: ${error}`);
  console.log(stdout);
  console.error(stderr);
};

const gardens = config.gardens;
Object.keys(gardens).forEach((garden) => {
  const gardenDirectory = `gardens/${garden}`;
  if (fs.existsSync(gardenDirectory)) {
    console.log(`Garden ${gardenDirectory} already exists`);
  } else {
    const url = gardens[garden];
    console.log(`Cloning ${garden}`);
    exec(`git clone ${url} ${gardenDirectory}`, cmdCallback);
  }
});
