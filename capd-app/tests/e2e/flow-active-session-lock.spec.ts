import { expect, test } from "@playwright/test";

import { seedRuntimeSession } from "./helpers/runtime-seed";

test("E2E-FLOW-002: 実施中セッションがある場合は別スロット開始できない", async ({ page }) => {
  await seedRuntimeSession(page, {
    sessionId: "ses_2_fixed",
    slotIndex: 0,
    currentStepId: "step_021",
    slots: [
      {
        protocolId: "seed-protocol",
        protocolLabel: "seed-protocol",
        recommendedTime: "20:00",
        status: "実施中"
      },
      {
        protocolId: "seed-protocol",
        protocolLabel: "seed-protocol",
        recommendedTime: "22:00",
        status: "未実施"
      },
      null,
      null
    ]
  });

  await page.goto("/capd/home");
  await page.getByText("#2.").click();

  await expect(page.getByText("実施中セッションがあるため開始できません。")).toBeVisible();
  await expect(page.getByRole("button", { name: "開始" })).toHaveCount(0);
  await expect(page).not.toHaveURL(/\/capd\/session/);
});
