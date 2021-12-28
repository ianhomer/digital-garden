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

Before(async function () {
  this.context = await browser.newContext({
    baseURL: "http://localhost:3000",
  });
  this.page = await this.context.newPage();
});

AfterAll(async function () {
  await browser.close();
});
