const config = require("../../garden.config.js");
const { exec } = require("child_process");
const fs = require('fs');

console.log(config.gardens);
const cmdCallback = (error, stdout, stderr) => {
  error && console.error(`exec error: ${error}`);
  console.log(stdout);
  stderr && console.error(`stderr: ${stderr}`);
};

const gardens = config.gardens
Object.keys(gardens).forEach((garden) => {
  const gardenDirectory = `gardens/${garden}`
  if (fs.existsSync(gardenDirectory)) {
    console.log(`Cloning ${garden}`)
    exec(`echo ${value}`, cmdCallback);
  } else {
    console.log(`Garden ${gardenDirectory} already exists`)
  }
})
console.log("Pre-build ...");
console.log("test");
