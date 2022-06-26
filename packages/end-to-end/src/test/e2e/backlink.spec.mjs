import { expect, test } from "@playwright/test";

test("should navigate to explicit backlink", async ({ page }) => {
  await page.goto("/word-2");
  await page.click("text=word-1");
  await expect(page).toHaveURL("/word-1/");
  await expect(page.locator("h1")).toContainText("Word 1");
});

test("should navigate to implicit link", async ({ page }) => {
  await page.goto("/word");
  await page.click("text=word-1");
  await expect(page).toHaveURL("/word-1/");
  await expect(page.locator("h1")).toContainText("Word 1");
});
