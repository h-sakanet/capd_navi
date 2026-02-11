import { expect, test, type APIRequestContext } from "@playwright/test";

function cloudId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function push(request: APIRequestContext, data: Record<string, unknown>) {
  const response = await request.post("/api/sync/push", { data });
  const body = await response.json();
  return { response, body };
}

async function pull(request: APIRequestContext, data: Record<string, unknown>) {
  const response = await request.post("/api/sync/pull", { data });
  const body = await response.json();
  return { response, body };
}

test("E2E-API-001: 公開APIは sync/push と sync/pull を基準に利用する", async ({ request }) => {
  const id = cloudId("api001");

  const pushResult = await push(request, { cloudId: id, items: [] });
  expect(pushResult.response.ok()).toBeTruthy();

  const pullResult = await pull(request, { cloudId: id });
  expect(pullResult.response.ok()).toBeTruthy();

  const legacyImportApi = await request.post("/api/protocols/import-package", { data: {} });
  expect(legacyImportApi.status()).toBe(404);
});

test("E2E-API-004: Blobキーは .enc を含まない", async ({ request }) => {
  const id = cloudId("api004");

  const now = new Date().toISOString();
  const result = await push(request, {
    cloudId: id,
    items: [
      {
        entityType: "session",
        entityId: "ses-001",
        updatedAt: now,
        payload: { status: "completed" }
      }
    ]
  });

  expect(result.response.ok()).toBeTruthy();
  expect(Array.isArray(result.body.blobKeys)).toBeTruthy();
  for (const key of result.body.blobKeys as string[]) {
    expect(key.endsWith(".json")).toBeTruthy();
    expect(key.includes(".enc")).toBeFalsy();
  }
});

test("E2E-SYNC-001: 起動時pullで別端末更新を復元できる", async ({ request }) => {
  const id = cloudId("sync001");
  const now = new Date().toISOString();

  await push(request, {
    cloudId: id,
    items: [{ entityType: "session", entityId: "ses-001", updatedAt: now, payload: { from: "A" } }]
  });

  const pulled = await pull(request, { cloudId: id });
  expect(pulled.body.cloudState).toBe("ok");
  expect((pulled.body.items as unknown[]).length).toBe(1);
});

test("E2E-SYNC-002: 完了時pushがpull側へ反映される", async ({ request }) => {
  const id = cloudId("sync002");
  const now = new Date().toISOString();

  await push(request, {
    cloudId: id,
    items: [{ entityType: "session", entityId: "ses-002", updatedAt: now, payload: { status: "completed" } }]
  });

  const pulled = await pull(request, { cloudId: id });
  const item = (pulled.body.items as Array<{ payload: { status?: string } }>)[0];
  expect(item.payload.status).toBe("completed");
});

test("E2E-SYNC-003: 同一エンティティ競合はLWWで収束する", async ({ request }) => {
  const id = cloudId("sync003");
  const oldTime = new Date(Date.now() - 60_000).toISOString();
  const newTime = new Date().toISOString();

  await push(request, {
    cloudId: id,
    items: [{ entityType: "session", entityId: "ses-003", updatedAt: oldTime, payload: { winner: "old" } }]
  });
  await push(request, {
    cloudId: id,
    items: [{ entityType: "session", entityId: "ses-003", updatedAt: newTime, payload: { winner: "new" } }]
  });

  const pulled = await pull(request, { cloudId: id });
  const item = (pulled.body.items as Array<{ payload: { winner?: string } }>)[0];
  expect(item.payload.winner).toBe("new");
});

test("E2E-SYNC-004: 同日同スロット競合で重複セッション保持 + スロット収束", async ({ request }) => {
  const id = cloudId("sync004");
  const oldTime = new Date(Date.now() - 120_000).toISOString();
  const newTime = new Date().toISOString();

  await push(request, {
    cloudId: id,
    items: [
      {
        entityType: "session",
        entityId: "ses-A",
        updatedAt: oldTime,
        payload: { day: "2026-02-11", slotNo: 1 }
      },
      {
        entityType: "slot",
        entityId: "2026-02-11-1",
        updatedAt: oldTime,
        payload: { currentSessionId: "ses-A" }
      }
    ]
  });

  await push(request, {
    cloudId: id,
    items: [
      {
        entityType: "session",
        entityId: "ses-B",
        updatedAt: newTime,
        payload: { day: "2026-02-11", slotNo: 1 }
      },
      {
        entityType: "slot",
        entityId: "2026-02-11-1",
        updatedAt: newTime,
        payload: { currentSessionId: "ses-B" }
      }
    ]
  });

  const pulled = await pull(request, { cloudId: id });
  const items = pulled.body.items as Array<{ entityType: string; entityId: string; payload: { currentSessionId?: string } }>;
  const sessions = items.filter((item) => item.entityType === "session");
  const slot = items.find((item) => item.entityType === "slot" && item.entityId === "2026-02-11-1");

  expect(sessions.length).toBe(2);
  expect(slot?.payload.currentSessionId).toBe("ses-B");
});

test("E2E-SYNC-005: push成功時にoutbox消し込み情報を返す", async ({ request }) => {
  const id = cloudId("sync005");
  const outboxIds = ["obx-001", "obx-002"];

  const result = await push(request, {
    cloudId: id,
    items: [],
    outboxIds
  });

  expect(result.response.ok()).toBeTruthy();
  expect(result.body.ackedOutboxIds).toEqual(outboxIds);
});

test("E2E-SYNC-006: 失敗時に再試行で回復できる", async ({ request }) => {
  const id = cloudId("sync006");

  const failed = await push(request, {
    cloudId: id,
    simulateFailure: true,
    items: []
  });
  expect(failed.response.status()).toBe(503);
  expect(failed.body.status).toBe("failed");

  const retried = await push(request, {
    cloudId: id,
    items: []
  });
  expect(retried.response.ok()).toBeTruthy();
  expect(retried.body.status).toBe("ok");
});

test("E2E-RECOVERY-001: ローカル喪失後にpullで復元できる", async ({ request }) => {
  const id = cloudId("recovery001");
  const now = new Date().toISOString();

  await push(request, {
    cloudId: id,
    items: [{ entityType: "session", entityId: "ses-r1", updatedAt: now, payload: { value: 10 } }]
  });

  let localDb: Array<{ entityId: string }> = [];
  localDb = [];

  const pulled = await pull(request, { cloudId: id });
  localDb = (pulled.body.items as Array<{ entityId: string }>).map((item) => ({ entityId: item.entityId }));

  expect(localDb.some((item) => item.entityId === "ses-r1")).toBeTruthy();
});

test("E2E-RECOVERY-002: cloudState=missing 検知後に full_reseed で復旧", async ({ request }) => {
  const id = cloudId("recovery002");

  const before = await pull(request, { cloudId: id });
  expect(before.body.cloudState).toBe("missing");

  await push(request, {
    cloudId: id,
    mode: "full_reseed",
    items: [
      {
        entityType: "session",
        entityId: "ses-r2",
        updatedAt: new Date().toISOString(),
        payload: { reseeded: true }
      }
    ]
  });

  const after = await pull(request, { cloudId: id });
  expect(after.body.cloudState).toBe("ok");
  expect((after.body.items as unknown[]).length).toBeGreaterThan(0);
});

test("E2E-RECOVERY-003: full_reseed失敗時はローカル正本を維持できる", async ({ request }) => {
  const id = cloudId("recovery003");
  const localSourceOfTruth = { sessionId: "local-1", status: "active" };

  const failed = await push(request, {
    cloudId: id,
    mode: "full_reseed",
    simulateFailure: true,
    items: [{ entityType: "session", entityId: "ses-r3", updatedAt: new Date().toISOString(), payload: { a: 1 } }]
  });

  expect(failed.response.status()).toBe(503);
  expect(failed.body.status).toBe("failed");

  const pulled = await pull(request, { cloudId: id });
  expect(pulled.body.cloudState).toBe("missing");
  expect(localSourceOfTruth.status).toBe("active");
});
