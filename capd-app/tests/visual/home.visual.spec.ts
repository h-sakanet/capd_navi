import { expect, test } from "@playwright/test";

test("VR-HOME-001: Home初期表示の回帰", async ({ page }) => {
  await page.goto("/capd/home");
  await expect(page).toHaveScreenshot("home-page.png", {
    fullPage: true,
    animations: "disabled"
  });
});
