import { type Page, expect, test } from "@playwright/test";

import { seedRuntimeSession } from "./helpers/runtime-seed";

function stepSection(page: Page, sequenceNo: number) {
  return page
    .locator("section", {
      has: page.getByRole("heading", { level: 2, name: new RegExp(`^#${sequenceNo}\\s`) })
    })
    .first();
}

test("E2E-FLOW-005: 必須チェック未完了では次へ進めない", async ({ page }) => {
  await seedRuntimeSession(page, {
    sessionId: "ses_flow_gate",
    slotIndex: 0,
    currentStepId: "step_021"
  });

  await page.goto("/capd/session?slot=1&sessionId=ses_flow_gate&stepId=step_021");

  const currentStep = stepSection(page, 21);
  await expect(currentStep.getByRole("heading", { level: 2, name: /^#21\s/ })).toBeVisible();
  await expect(currentStep.getByRole("button", { name: "次へ" })).toBeDisabled();
  await expect(currentStep.getByText("必須チェックを完了してください。")).toBeVisible();
});

test("E2E-FLOW-006: record_event必須ステップは未入力時に次へ進めず、入力で進める", async ({ page }) => {
  await seedRuntimeSession(page, {
    sessionId: "ses_flow_gate",
    slotIndex: 0,
    currentStepId: "step_025"
  });

  await page.goto("/capd/session?slot=1&sessionId=ses_flow_gate&stepId=step_025");

  const currentStep = stepSection(page, 25);
  await expect(currentStep.getByRole("heading", { level: 2, name: /^#25\s/ })).toBeVisible();

  const nextButton = currentStep.getByRole("button", { name: "次へ" });
  await page.getByLabel("排液の確認").selectOption("");
  await expect(nextButton).toBeDisabled();
  await expect(currentStep.getByText("記録入力を完了してください。")).toBeVisible();

  await page.getByLabel("排液の確認").selectOption("透明");

  await expect(nextButton).toBeEnabled();
});

test("E2E-FLOW-007: 次へ操作でnext_step_idへ直列遷移する", async ({ page }) => {
  await seedRuntimeSession(page, {
    sessionId: "ses_flow_gate",
    slotIndex: 0,
    currentStepId: "step_021",
    stepImageByStepId: {
      step_021: "img-1.svg"
    },
    protocolAssets: [
      {
        assetKey: "img-1.svg",
        mimeType: "image/svg+xml"
      }
    ]
  });

  await page.goto("/capd/session?slot=1&sessionId=ses_flow_gate&stepId=step_021");

  const currentStep = stepSection(page, 21);
  await expect(currentStep.getByRole("heading", { level: 2, name: /^#21\s/ })).toBeVisible();
  const image = currentStep.getByRole("img", { name: "お腹のチューブのクランプを開ける" });
  await expect(image).toBeVisible();
  await expect(image).toHaveAttribute("src", /^blob:/);
  await currentStep.getByText("クランプを開けた", { exact: true }).click();
  await currentStep.getByRole("button", { name: "次へ" }).click();

  await expect(page.getByRole("heading", { level: 2, name: /#22 廃液中/ })).toBeVisible();
});

test("E2E-FLOW-008: 記録入力ステップ表示時は最初の入力欄に自動フォーカスされる", async ({ page }) => {
  await seedRuntimeSession(page, {
    sessionId: "ses_flow_gate",
    slotIndex: 0,
    currentStepId: "step_025"
  });

  await page.goto("/capd/session?slot=1&sessionId=ses_flow_gate&stepId=step_025");

  const currentStep = stepSection(page, 25);
  await expect(currentStep.getByRole("heading", { level: 2, name: /^#25\s/ })).toBeVisible();
  await expect(page.getByLabel("排液の確認")).toBeFocused();
  await expect(page.getByLabel("排液の確認")).toHaveValue("透明");
});
