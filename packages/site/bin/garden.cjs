#!/usr/bin/env node

// Spin up local garden

console.log("Local Garden");

const gardensDirectory = process.cwd();

const path = require("path");
const siteRoot = path.normalize(path.dirname(__filename) + "/..");

const subprocess = require("child_process").spawn(
  "pnpm",
  ["dev:hot", "--", gardensDirectory],
  {
    cwd: siteRoot,
    env: {
      ...process.env,
      GARDENS_DIRECTORY: gardensDirectory,
    },
    detached: false,
    stdio: "inherit",
  }
);

subprocess.on("error", (err) => {
  console.error(`Cannot start garden : ${err}`);
});
