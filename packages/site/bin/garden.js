#!/usr/bin/env node

// Spin up local garden

console.log("Local Garden");

const gardensDirectory = process.cwd();
console.log(gardensDirectory);
import { nextDev } from "next/dev.js";
console.log(nextDev);
nextDev();

// _DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
// INSTALL_DIR="$_DIR/.."

// echo $INSTALL_DIR
// pnpm -C $INSTALL_DIR dev
