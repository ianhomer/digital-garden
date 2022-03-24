#!/usr/bin/env node

// Spin up local garden

console.log("Local Garden");

const gardensDirectory = process.cwd();

const path = require("path");
const siteRoot = path.normalize(path.dirname(__filename) + "/..");

const env = {
  ...process.env,
  GARDENS_DIRECTORY: gardensDirectory,
};

require("child_process").spawn("pnpm", ["build:prepare"], {
  cwd: siteRoot,
  env,
  detached: false,
  stdio: "inherit",
});

const subprocess = require("child_process").spawn(
  "pnpm",
  ["dev:hot", "--", gardensDirectory],
  {
    cwd: siteRoot,
    env,
    detached: false,
    stdio: "inherit",
  }
);

subprocess.on("error", (err) => {
  console.error(`Cannot start garden : ${err}`);
});
