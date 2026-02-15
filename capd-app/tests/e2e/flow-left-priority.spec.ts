import { expect, test } from "@playwright/test";

test("E2E-FLOW-001: 左側未完了のとき右側スロット開始は不可", async ({ page }) => {
  await page.addInitScript(() => {
    const key = "capd-support:home:slots:v1";
    const slots = [
      {
        protocolId: "reguneal-15",
        protocolLabel: "レギニュール1.5",
        recommendedTime: "20:00",
        status: "未実施"
      },
      {
        protocolId: "reguneal-15",
        protocolLabel: "レギニュール1.5",
        recommendedTime: "22:00",
        status: "未実施"
      },
      null,
      null
    ];
    window.localStorage.setItem(key, JSON.stringify(slots));
    window.localStorage.removeItem("capd-support:home:active-session:v1");
  });

  await page.goto("/capd/home");
  await page.getByText("#2.").click();

  await expect(page.getByText("左側スロットを実施済みにすると開始できます。")).toHaveCount(0);
  await expect(page).not.toHaveURL(/\/capd\/session/);
});
