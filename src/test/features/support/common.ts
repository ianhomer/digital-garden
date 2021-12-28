import { AfterAll, Before, BeforeAll } from "@cucumber/cucumber";
import { chromium } from "playwright";

import config from "../../../../playwright.config";

let browser;
const browserOptions = {
  headless: config.use.headless,
};

BeforeAll(async function () {
  browser = await chromium.launch(browserOptions);
});

Before({ tags: "@ignore" }, async function () {
  return "skipped";
});

Before({ tags: "@debug" }, async function () {
  this.debug = true;
});

AfterAll(async function () {
  await browser.close();
});
