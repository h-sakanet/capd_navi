import { expect, test } from "@playwright/test";

import { seedRuntimeSession } from "./helpers/runtime-seed";

test("E2E-FLOW-003: 実施中スロットを選択すると進行中セッションを再開する", async ({ page }) => {
  await seedRuntimeSession(page, {
    sessionId: "ses_1_resume",
    slotIndex: 0,
    currentStepId: "step_021"
  });

  await page.goto("/capd/home");
  await page.getByText("#1.").click();

  await expect(page.getByText("手技の再開")).toBeVisible();
  await page.getByRole("button", { name: "再開" }).click();

  await expect(page).toHaveURL(/\/capd\/session\?slot=1&sessionId=ses_1_resume/);
});
