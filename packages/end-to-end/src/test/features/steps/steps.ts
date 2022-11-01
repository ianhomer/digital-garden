import { Given, Then, When } from "@cucumber/cucumber";
import { expect } from "@playwright/test";

Given("I am on the {word} page", async function (name) {
  await this.page.goto(`/${name == "index" ? "" : name}`);
});

When("I click {word}", async function (name) {
  await this.page.click(`text=${name}`);
  await expect(this.page).toHaveURL(`/${name}/`);
});

Then("I see the heading {string}", async function (heading) {
  await expect(this.page.locator("h1")).toContainText(heading);
});
