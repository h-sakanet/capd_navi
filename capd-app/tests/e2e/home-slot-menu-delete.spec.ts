import { expect, test } from "@playwright/test";

test("E2E-HOME-DELETE-001: スロットメニューから削除できる", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "capd-support:home:slots:v1",
      JSON.stringify([
        {
          protocolId: "p-1",
          protocolLabel: "テスト手技1",
          recommendedTime: "20:00",
          status: "未実施"
        },
        null,
        null,
        null
      ])
    );
    window.localStorage.removeItem("capd-support:home:active-session:v1");
  });

  await page.goto("/capd/home");

  const slot1 = page.locator("section", { hasText: "#1." }).first();
  await slot1.getByRole("button", { name: "その他操作" }).click();

  await expect(page.getByRole("menuitem", { name: "削除" })).toBeVisible();
  await page.getByRole("menuitem", { name: "削除" }).click();

  await expect(page.getByText("スロット登録の削除")).toBeVisible();
  await page.getByRole("button", { name: "削除する" }).click();

  await expect(page.getByRole("button", { name: "手技スロット1を設定" })).toBeVisible();

  const slots = await page.evaluate(() => {
    const raw = window.localStorage.getItem("capd-support:home:slots:v1");
    return raw ? (JSON.parse(raw) as Array<unknown>) : null;
  });
  expect(slots?.[0]).toBeNull();
});

test("E2E-HOME-DELETE-002: 編集不可条件では削除も選択できない", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "capd-support:home:slots:v1",
      JSON.stringify([
        {
          protocolId: "p-1",
          protocolLabel: "テスト手技1",
          recommendedTime: "20:00",
          status: "未実施"
        },
        {
          protocolId: "p-2",
          protocolLabel: "テスト手技2",
          recommendedTime: "22:00",
          status: "実施中"
        },
        null,
        null
      ])
    );
    window.localStorage.setItem(
      "capd-support:home:active-session:v1",
      JSON.stringify({
        sessionId: "ses_2_test",
        slotIndex: 1,
        currentStepId: "step_001",
        protocolId: "p-2",
        snapshotHash: "hash",
        mode: "runtime",
        updatedAtIso: new Date().toISOString()
      })
    );
  });

  await page.goto("/capd/home");

  const slot1 = page.locator("section", { hasText: "#1." }).first();
  await slot1.getByRole("button", { name: "その他操作" }).click();

  await expect(page.getByRole("menuitem", { name: "編集" })).toBeDisabled();
  await expect(page.getByRole("menuitem", { name: "削除" })).toBeDisabled();
});
