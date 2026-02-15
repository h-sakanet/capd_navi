import { once } from "node:events";
import { spawn, type ChildProcess } from "node:child_process";

import { expect, test, type Page } from "@playwright/test";

async function waitForServer(url: string, timeoutMs = 120_000): Promise<void> {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.status < 500) {
        return;
      }
    } catch {
      // ignore and retry
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`server did not start in time: ${url}`);
}

async function stopServer(process: ChildProcess): Promise<void> {
  if (process.killed || process.exitCode !== null) {
    return;
  }

  process.kill("SIGTERM");
  await Promise.race([once(process, "exit"), new Promise((resolve) => setTimeout(resolve, 5_000))]);

  if (process.exitCode === null && !process.killed) {
    process.kill("SIGKILL");
    await Promise.race([once(process, "exit"), new Promise((resolve) => setTimeout(resolve, 2_000))]);
  }
}

async function resetStorage(page: Page): Promise<void> {
  await page.goto("/capd/home");
  await page.evaluate(async () => {
    window.localStorage.clear();

    if (!window.indexedDB || typeof window.indexedDB.databases !== "function") {
      return;
    }

    const infos = await window.indexedDB.databases();
    for (const info of infos) {
      if (!info.name) {
        continue;
      }

      await new Promise<void>((resolve) => {
        const request = window.indexedDB.deleteDatabase(info.name as string);
        request.onsuccess = () => resolve();
        request.onerror = () => resolve();
        request.onblocked = () => resolve();
      });
    }
  });
}

async function seedLocalStorage(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.localStorage.setItem("capd-support:home:slots:v1", JSON.stringify([null, null, null, null]));
    window.localStorage.setItem("capd-support:templates:v1", JSON.stringify([{ protocolId: "a", protocolName: "A", importedAt: "", stepCount: 1 }]));
  });
}

async function seedIndexedDb(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await new Promise<void>((resolve, reject) => {
      const request = window.indexedDB.open("e2e-storage-admin", 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        const store = db.createObjectStore("sessions", { keyPath: "id" });
        store.add({ id: "s1" });
        store.add({ id: "s2" });
      };
      request.onsuccess = () => {
        request.result.close();
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  });
}

test("E2E-STORAGE-001: 画面表示時に既存キーが一覧表示される", async ({ page }) => {
  await resetStorage(page);
  await seedLocalStorage(page);
  await seedIndexedDb(page);

  await page.goto("/capd/dev/storage-admin");

  await expect(page.getByTestId("storage-row-local-capd-support-home-slots-v1")).toBeVisible();
  await expect(page.getByTestId("storage-row-idb-e2e-storage-admin-sessions")).toBeVisible();
  await expect(page.getByText("capd-support:templates:v1", { exact: false })).toHaveCount(0);
});

test("E2E-STORAGE-002: localStorageキーを1件削除できる", async ({ page }) => {
  await resetStorage(page);
  await seedLocalStorage(page);

  await page.goto("/capd/dev/storage-admin");
  await page.getByRole("button", { name: "削除 capd-support:home:slots:v1" }).click();
  await page.getByRole("button", { name: "削除する" }).click();

  await expect(page.getByText("capd-support:home:slots:v1", { exact: false })).toHaveCount(0);
  const hasTemplate = await page.evaluate(() => window.localStorage.getItem("capd-support:templates:v1") !== null);
  expect(hasTemplate).toBe(true);
});

test("E2E-STORAGE-003: IndexedDB store全削除ができる", async ({ page }) => {
  await resetStorage(page);
  await seedIndexedDb(page);

  await page.goto("/capd/dev/storage-admin");
  await page.getByRole("button", { name: "削除 e2e-storage-admin/sessions" }).click();
  await page.getByRole("button", { name: "削除する" }).click();

  const row = page.locator("li", { hasText: "e2e-storage-admin/sessions" });
  await expect(row).toContainText("count: 0");
});

test("E2E-STORAGE-004: 全削除後に保持対象以外が削除される", async ({ page }) => {
  await resetStorage(page);
  await seedLocalStorage(page);
  await seedIndexedDb(page);

  await page.goto("/capd/dev/storage-admin");
  await page.getByRole("button", { name: "Clear ALL Storage" }).click();
  await page.getByPlaceholder("DELETE").fill("DELETE");
  await page.getByRole("button", { name: "全削除を実行" }).click();

  await expect(page.getByTestId("storage-row-local-capd-support-home-slots-v1")).toBeVisible();
  await expect(page.getByTestId("storage-row-idb-e2e-storage-admin-sessions")).toHaveCount(0);
});

test("E2E-STORAGE-005: ENV無効時は404になる", async ({ page }) => {
  test.slow();

  const port = 5193;
  const server = spawn("npm", ["run", "dev", "--", "-p", String(port), "--hostname", "127.0.0.1"], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      NEXT_PUBLIC_ENABLE_STORAGE_ADMIN: "false",
      NEXT_PUBLIC_ALARM_MINUTE_MS: "300"
    },
    stdio: "ignore"
  });

  try {
    await waitForServer(`http://127.0.0.1:${port}/capd/home`);
    const response = await page.request.get(`http://127.0.0.1:${port}/capd/dev/storage-admin`);
    expect(response.status()).toBe(404);
  } finally {
    await stopServer(server);
  }
});
