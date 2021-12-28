import { After, AfterAll, Before, BeforeAll } from "@cucumber/cucumber";
import { Browser, chromium } from "playwright";

import config from "../../../../playwright.config";

let browser: Browser;
const browserOptions = {
  headless: config.use.headless,
};

BeforeAll(async function () {
  browser = await chromium.launch(browserOptions);
});

Before(async function () {
  this.context = await browser.newContext({
    baseURL: `http://localhost:${config.webServer.port}`,
  });
  this.page = await this.context.newPage();
});

After(async function () {
  await this.page?.close();
  await this.context?.close();
});

AfterAll(async function () {
  await browser.close();
});
