import { expect, test, type Page } from "@playwright/test";

const csvHeader =
  "row_type,meta_key,meta_value,通し番号,step_id,next_step_id,フェーズ,状態,タイトル,画像,表示テキスト,警告テキスト,必須チェック,timer_id,timer_event,timer_exchange_no,timer_segment,alarm_id,alarm_trigger,alarm_duration_min,alarm_related_timer_id,record_event,record_exchange_no,record_unit";

type CsvOptions = {
  duplicateStepId?: boolean;
  brokenNextStep?: boolean;
  firstImage?: string;
  secondImage?: string;
};

function buildCsv(options: CsvOptions = {}): string {
  const firstImage = options.firstImage ?? "img-1.png";
  const secondImage = options.secondImage ?? "img-2.png";
  const step2Id = options.duplicateStepId ? "step_001" : "step_002";
  const step1Next = options.brokenNextStep ? "step_999" : step2Id;

  return [
    csvHeader,
    "meta,format_version,3,,,,,,,,,,,,,,,,,,,,,",
    "meta,protocol_id,import-test,,,,,,,,,,,,,,,,,,,,,",
    "meta,protocol_name,Import Test,,,,,,,,,,,,,,,,,,,,,",
    "meta,protocol_version,v1.0.0,,,,,,,,,,,,,,,,,,,,,",
    "meta,effective_from_local,2026-02-11T00:00:00+09:00,,,,,,,,,,,,,,,,,,,,,",
    `step,,,1,step_001,${step1Next},準備,お腹-独立,開始,${firstImage},表示A,,,,,,,,,,,,`,
    `step,,,2,${step2Id},,終了,お腹-独立,終了,${secondImage},表示B,,,,,,,,,,,,`
  ].join("\n");
}

async function runImport(page: Page, csvText: string, imagesText: string) {
  await page.goto("/capd/import");
  await page.getByLabel("protocol.csv 内容").fill(csvText);
  await page.getByLabel("画像ファイル一覧（カンマ/改行区切り）").fill(imagesText);
  await page.getByRole("button", { name: "検証して保存" }).click();
}

test("E2E-CSV-001: 正常CSVを取り込み保存できる", async ({ page }) => {
  await runImport(page, buildCsv(), "img-1.png,img-2.png");

  await expect(page.getByRole("status")).toContainText("取り込み成功");
  const templateCount = await page.evaluate(() => {
    const key = "capd-support:templates:v1";
    return JSON.parse(window.localStorage.getItem(key) ?? "[]").length;
  });
  expect(templateCount).toBeGreaterThan(0);
});

test("E2E-CSV-002: step_id重複はエラーで中止される", async ({ page }) => {
  await runImport(page, buildCsv({ duplicateStepId: true }), "img-1.png,img-2.png");

  await expect(page.locator("p[role='alert']").first()).toContainText("step_id が重複しています");
});

test("E2E-CSV-003: next_step_id不整合はエラーで中止される", async ({ page }) => {
  await runImport(page, buildCsv({ brokenNextStep: true }), "img-1.png,img-2.png");

  await expect(page.locator("p[role='alert']").first()).toContainText(
    "next_step_id が未定義の step_id を参照しています"
  );
});

test("E2E-CSV-004: 画像不足はエラーで中止される", async ({ page }) => {
  await runImport(page, buildCsv({ firstImage: "missing-a.png", secondImage: "missing-b.png" }), "img-1.png");

  await expect(page.locator("p[role='alert']").first()).toContainText("画像が不足しています");
});

test("E2E-API-002: CSV取込で旧 import-package API を呼ばない", async ({ page }) => {
  let importPackageCalled = false;
  await page.route("**/api/protocols/import-package", async (route) => {
    importPackageCalled = true;
    await route.fulfill({ status: 500, body: "unexpected" });
  });

  await runImport(page, buildCsv(), "img-1.png,img-2.png");
  await expect(page.getByRole("status")).toContainText("取り込み成功");
  expect(importPackageCalled).toBeFalsy();
});
