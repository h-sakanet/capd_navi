import { expect, test } from "@playwright/test";

import { seedRuntimeSession } from "./helpers/runtime-seed";

test("E2E-FLOW-004: セッション非常中断でホーム復帰しスロットを未実施へ戻す", async ({ page }) => {
  await seedRuntimeSession(page, {
    sessionId: "ses_abort_1",
    slotIndex: 0,
    currentStepId: "step_021"
  });

  await page.goto("/capd/session?slot=1&sessionId=ses_abort_1");

  await page.getByRole("button", { name: "セッション操作メニュー" }).click();
  await page.getByRole("button", { name: "セッションを中断（非常用）" }).click();
  await page.getByLabel("確認のため「中断」と入力してください").fill("中断");
  await page.getByRole("button", { name: "中断する" }).click();

  await expect(page).toHaveURL("/capd/home");
  await expect(page.getByText("ステータス：未実施")).toBeVisible();

  const activeSessionRaw = await page.evaluate(() => window.localStorage.getItem("capd-support:home:active-session:v1"));
  expect(activeSessionRaw).toBeNull();
});
