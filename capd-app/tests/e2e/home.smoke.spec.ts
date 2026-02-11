import { expect, test } from "@playwright/test";

test("E2E-API-003: Homeに手動エクスポート導線が表示されない", async ({ page }) => {
  await page.goto("/capd/home");

  await expect(page.getByRole("link", { name: "CSV取り込み(Mac)" })).toBeVisible();
  await expect(page.getByRole("link", { name: "記録一覧を開く" })).toBeVisible();
  await expect(page.getByText("エクスポート", { exact: false })).toHaveCount(0);
});
