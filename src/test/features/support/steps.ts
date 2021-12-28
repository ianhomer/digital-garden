import { Given, Then, When } from "@cucumber/cucumber";

Given("I am on the word-1 page", async () => {
  console.log("Given I am on");
});

When("I click word-2", async () => {
  console.log("When I click");
});

Then("I see the word-2 page", async () => {
  console.log("Then I see");
});
