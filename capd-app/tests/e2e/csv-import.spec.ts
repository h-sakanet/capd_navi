import { expect, test, type Page } from "@playwright/test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const csvHeader =
  "通し番号,step_id,next_step_id,フェーズ,状態,タイトル,画像,表示テキスト,警告テキスト,必須チェック,必須チェック数,timer_id,timer_event,timer_exchange_no,timer_segment,alarm_id,alarm_trigger,alarm_duration_min,alarm_related_timer_id,record_event,record_exchange_no,record_unit";

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
    `1,step_001,${step1Next},準備,お腹-独立,開始,${firstImage},表示A,,チェックA,1,,,,,,,,,,,`,
    `2,${step2Id},,終了,お腹-独立,終了,${secondImage},表示B,,,,,,,,,,,,`
  ].join("\n");
}

async function selectCsv(page: Page, csvText: string, fileName = "protocol.csv") {
  await page.goto("/capd/import");
  await expect(page.getByRole("button", { name: "CSVファイルを選択" })).toBeVisible();
  await expect(page.getByTestId("selected-csv-title")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "保存" })).toHaveCount(0);

  const csvInput = page.locator("input[type='file'][accept='.csv,text/csv']");
  await csvInput.setInputFiles({
    name: fileName,
    mimeType: "text/csv",
    buffer: Buffer.from(csvText, "utf-8")
  });

  await expect(page.getByTestId("selected-csv-title")).toHaveText(fileName);
  await expect(page.getByTestId("import-csv-preview-table")).toBeVisible();
  await expect(page.getByRole("button", { name: "画像の格納先を選ぶ" })).toBeVisible();
}

async function saveImport(page: Page) {
  await page.getByRole("button", { name: "保存" }).click();
}

async function selectImageDirectory(
  page: Page,
  files: Array<{
    name: string;
    mimeType: string;
    content: string;
  }>
) {
  const directoryPath = fs.mkdtempSync(path.join(os.tmpdir(), "capd-import-images-"));
  for (const file of files) {
    fs.writeFileSync(path.join(directoryPath, file.name), file.content, "utf-8");
  }
  const input = page.locator("input[type='file'][aria-label='画像フォルダ入力']");
  await input.setInputFiles(directoryPath);
}

test("E2E-CSV-001: 正常CSVを取り込み保存できる", async ({ page }) => {
  await selectCsv(page, buildCsv(), "reguneal-template.csv");
  await selectImageDirectory(page, [
    {
      name: "img-1.png",
      mimeType: "image/png",
      content: "image-a"
    },
    {
      name: "img-2.png",
      mimeType: "image/png",
      content: "image-b"
    }
  ]);
  await expect(page.getByTestId("missing-image-warning")).toHaveCount(0);
  await saveImport(page);

  await expect(page.getByRole("status")).toContainText("取り込み成功");
  const stored = await page.evaluate(async () => {
    const openRequest = window.indexedDB.open("capd-support-db", 1);
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      openRequest.onsuccess = () => resolve(openRequest.result);
      openRequest.onerror = () => reject(openRequest.error);
    });

    const tx = db.transaction(["protocol_packages", "photo_meta"], "readonly");
    const templateRows = await new Promise<any[]>((resolve, reject) => {
      const request = tx.objectStore("protocol_packages").getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const assetRows = await new Promise<any[]>((resolve, reject) => {
      const request = tx.objectStore("photo_meta").getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return {
      templates: templateRows,
      assets: assetRows.map((row) => ({
        photoId: row.photoId,
        protocolId: row.protocolId,
        assetKey: row.assetKey,
        mimeType: row.mimeType
      }))
    };
  });
  expect(stored.templates.length).toBeGreaterThan(0);
  expect(stored.templates[0]?.protocolName).toBe("reguneal-template");
  expect(stored.assets).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        photoId: "protasset::reguneal-template::img-1.png",
        protocolId: "reguneal-template",
        assetKey: "img-1.png",
        mimeType: "image/png"
      }),
      expect.objectContaining({
        photoId: "protasset::reguneal-template::img-2.png",
        protocolId: "reguneal-template",
        assetKey: "img-2.png",
        mimeType: "image/png"
      })
    ])
  );

  await page.goto("/capd/home");
  await page.getByRole("button", { name: "手技スロット1を設定" }).click();
  await expect(page.locator("#protocol-select")).toContainText("reguneal-template");
});

test("E2E-CSV-002: step_id重複はエラーで中止される", async ({ page }) => {
  await selectCsv(page, buildCsv({ duplicateStepId: true }), "duplicated.csv");

  await expect(page.locator("p[role='alert']").first()).toContainText("step_id が重複しています");
});

test("E2E-CSV-003: next_step_id不整合はエラーで中止される", async ({ page }) => {
  await selectCsv(page, buildCsv({ brokenNextStep: true }), "broken-next.csv");

  await expect(page.locator("p[role='alert']").first()).toContainText(
    "next_step_id が未定義の step_id を参照しています"
  );
});

test("E2E-CSV-004: 画像不足はエラーで中止される", async ({ page }) => {
  await selectCsv(page, buildCsv({ firstImage: "missing-a.png", secondImage: "missing-b.png" }), "missing-image.csv");
  await selectImageDirectory(page, [
    {
      name: "img-1.png",
      mimeType: "image/png",
      content: "image-a"
    }
  ]);

  await expect(page.getByTestId("missing-image-warning")).toContainText("missing-a.png");
  await expect(page.getByTestId("missing-image-warning")).toContainText("missing-b.png");
  await expect(page.getByRole("button", { name: "保存" })).toBeDisabled();
});

test("E2E-CSV-006: 不足画像を補った再選択で保存可能になる", async ({ page }) => {
  await selectCsv(page, buildCsv(), "retry-image.csv");
  await selectImageDirectory(page, [
    {
      name: "img-1.png",
      mimeType: "image/png",
      content: "image-a"
    }
  ]);

  await expect(page.getByTestId("missing-image-warning")).toContainText("img-2.png");
  await expect(page.getByRole("button", { name: "保存" })).toBeDisabled();

  await selectImageDirectory(page, [
    {
      name: "img-1.png",
      mimeType: "image/png",
      content: "image-a"
    },
    {
      name: "img-2.png",
      mimeType: "image/png",
      content: "image-b"
    }
  ]);

  await expect(page.getByTestId("missing-image-warning")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "保存" })).toBeEnabled();
  await saveImport(page);
  await expect(page.getByRole("status")).toContainText("取り込み成功");
});

test("E2E-API-002: CSV取込で旧 import-package API を呼ばない", async ({ page }) => {
  let importPackageCalled = false;
  await page.route("**/api/protocols/import-package", async (route) => {
    importPackageCalled = true;
    await route.fulfill({ status: 500, body: "unexpected" });
  });

  await selectCsv(page, buildCsv());
  await selectImageDirectory(page, [
    {
      name: "img-1.png",
      mimeType: "image/png",
      content: "image-a"
    },
    {
      name: "img-2.png",
      mimeType: "image/png",
      content: "image-b"
    }
  ]);
  await saveImport(page);
  await expect(page.getByRole("status")).toContainText("取り込み成功");
  expect(importPackageCalled).toBeFalsy();
});
