import { expect,test } from "@playwright/test";

test("should navigate to explicit link", async ({ page }) => {
  await page.goto("/word-1");
  await page.click("text=word-2");
  await expect(page).toHaveURL("/word-2");
  await expect(page.locator("h1")).toContainText("Word 2");
});
