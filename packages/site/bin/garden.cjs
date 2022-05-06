#!/usr/bin/env node
const { watch } = require("node:fs");
// Spin up local garden

console.log("Local Garden");

const gardensDirectory = process.cwd();

const path = require("path");
const siteRoot = path.normalize(path.dirname(__filename) + "/..");

const env = {
  ...process.env,
  GARDENS_DIRECTORY: gardensDirectory,
};

const prepare = () => {
  const start = new Date().getTime();
  require("child_process").spawn("time", ["pnpm", "build:prepare"], {
    cwd: siteRoot,
    env,
    detached: false,
    stdio: "inherit",
  });
  console.log(`Prepared in ${new Date().getTime() - start}s`);
};
prepare();

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

const debounce = (foo, timeout = 5000) => {
  let timer;
  return () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      foo();
    }, timeout);
  };
};

const debouncedPrepare = debounce(prepare);

watch(gardensDirectory, { recursive: true }, (eventType, filename) => {
  console.log(`event type is : ${eventType} : ${filename}`);
  debouncedPrepare();
});
