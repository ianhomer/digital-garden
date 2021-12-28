import { Given, Then, When } from "@cucumber/cucumber";

Given("I am on the {word} page", async function (name) {
  //await this.page.goto(`/${name}`);
  console.log(`Given I am on the ${name} page`);
});

When("I click {word}", async function (name) {
  console.log(`When I click ${name}`);
});

Then("I see the word-2 page", async () => {
  console.log("Then I see");
});
