#!/usr/bin/env node
const yargs = require("yargs");

const { watch } = require("node:fs");
// Spin up local garden

const argv = yargs(process.argv.slice(2))
  .options({
    watch: { type: "boolean", default: true, alias: "w" },
  })
  .help("h", "help").argv;

console.log("Local Garden");

const gardensDirectory = process.cwd();

const path = require("path");
const siteRoot = path.normalize(path.dirname(__filename) + "/..");

const env = {
  ...process.env,
  GARDENS_DIRECTORY: gardensDirectory,
};

const prepare = (filename) => {
  const start = new Date().getTime();
  const args = ["pnpm", "build:prepare"];
  if (filename) {
    args.push(`--patch=${filename}`);
  }
  const childProcess = require("child_process").spawn("time", args, {
    cwd: siteRoot,
    env,
    detached: false,
    stdio: "inherit",
  });
  console.log(`Prepared in ${new Date().getTime() - start}s`);
  return childProcess;
};
const prepareProcess = prepare();

const subprocess = require("child_process").spawn("pnpm", ["dev"], {
  cwd: siteRoot,
  env,
  detached: false,
  stdio: "inherit",
});

subprocess.on("error", (err) => {
  console.error(`Cannot start garden : ${err}`);
});
subprocess.on("spawn", () => {
  console.log("Starting garden");
});

const debounce = (_prepare, timeout = 5000) => {
  let timer;
  return (filename) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      _prepare(filename);
    }, timeout);
  };
};

const debouncedPrepare = debounce(prepare);

if (argv["watch"]) {
  console.log("(reloading on change)");
  const watcher = watch(
    gardensDirectory,
    { recursive: true },
    (eventType, filename) => {
      if (
        !filename.includes("/.") &&
        !filename.startsWith(".") &&
        filename.endsWith(".md")
      ) {
        console.log(`garden : ${eventType} : ${filename}`);
        debouncedPrepare(filename);
      }
    }
  );
  process.on("SIGINT", () => {
    console.log("Stopping watcher");
    watcher.close();
  });
}

process.on("SIGINT", () => {
  console.log("Closing garden");
  subprocess.kill();
  prepareProcess.kill();
});
