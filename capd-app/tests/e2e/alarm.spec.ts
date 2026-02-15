import { expect, test, type Page } from "@playwright/test";

import { seedRuntimeSession } from "./helpers/runtime-seed";

async function openAlarmStep(page: Page) {
  await seedRuntimeSession(page, {
    sessionId: "ses_alarm",
    slotIndex: 0,
    currentStepId: "step_022"
  });

  await page.goto("/capd/session?slot=1&sessionId=ses_alarm&stepId=step_022");
  await expect(page.getByTestId("alarm-step_022")).toBeVisible();
}

test("E2E-ALARM-001: タイマー到達時にアラーム表示を開始する", async ({ page }) => {
  await openAlarmStep(page);
  await expect(page.getByTestId("alarm-step_022")).toContainText("待機アラーム");
  await expect(page.getByTestId("alarm-count-step_022")).toContainText("通知回数: 1");
});

test("E2E-ALARM-002: 未ACK時に段階再通知する", async ({ page }) => {
  await openAlarmStep(page);
  await expect
    .poll(
      async () => {
        const text = await page.getByTestId("alarm-count-step_022").textContent();
        const matched = text?.match(/通知回数:\s*(\d+)/);
        return matched ? Number(matched[1]) : 0;
      },
      { timeout: 8000 }
    )
    .toBeGreaterThanOrEqual(3);
});

test("E2E-ALARM-003: 確認操作でアラームを停止し acked_at を記録する", async ({ page }) => {
  await openAlarmStep(page);
  await page.getByTestId("alarm-step_022").getByRole("button", { name: "確認する" }).click();

  await expect(page.getByTestId("alarm-step_022")).toContainText("アラーム確認済み");
  await expect(page.getByTestId("alarm-step_022")).toContainText("acked_at");
});

test("E2E-ALARM-004: 一定時間未確認で missed へ遷移する", async ({ page }) => {
  await openAlarmStep(page);
  await expect(page.getByTestId("alarm-step_022")).toContainText("アラーム未確認（missed）", { timeout: 15000 });
});
