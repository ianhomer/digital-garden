import { After, AfterAll, Before, BeforeAll } from "@cucumber/cucumber";
import { Browser, chromium, LaunchOptions } from "playwright";

let browser: Browser;
const browserOptions: LaunchOptions = {
  headless: false,
};

BeforeAll(async function () {
  browser = await chromium.launch(browserOptions);
});

Before(async function () {
  this.context = await browser.newContext({
    baseURL: `http://localhost:3000`,
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
