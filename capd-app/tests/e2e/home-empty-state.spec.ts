import { expect, test } from "@playwright/test";

test("E2E-HOME-001: Home初期表示は#1〜#4が未登録（+）", async ({ page }) => {
  await page.goto("/capd/home");

  await expect(page.getByRole("button", { name: "手技スロット1を設定" })).toBeVisible();
  await expect(page.getByRole("button", { name: "手技スロット2を設定" })).toBeVisible();
  await expect(page.getByRole("button", { name: "手技スロット3を設定" })).toBeVisible();
  await expect(page.getByRole("button", { name: "手技スロット4を設定" })).toBeVisible();

  await expect(page.getByText("表示できる記録がありません。", { exact: true })).toHaveCount(0);
  await expect(page.getByText("レギニュール1.5", { exact: false })).toHaveCount(0);
});
