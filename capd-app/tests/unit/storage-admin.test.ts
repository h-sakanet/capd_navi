import { afterEach, describe, expect, it } from "vitest";

import { clearAllStorage, deleteStorageTargets, listStoragePreview } from "../../lib/storage-admin";
import type { StoragePreviewItem } from "../../lib/storage-admin.types";

type FakeStoreMap = Map<string, unknown[]>;

type FakeDatabaseMap = Map<string, FakeStoreMap>;

type FakeWindow = {
  localStorage: Storage;
  indexedDB: IDBFactory & { __debugDatabases: FakeDatabaseMap };
};

function createLocalStorage(seed: Record<string, string>): Storage {
  const store = new Map<string, string>(Object.entries(seed));

  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    }
  } as Storage;
}

function createFakeRequest<T>(executor: () => T): IDBRequest<T> {
  const request = {
    result: undefined as T,
    error: null as DOMException | null,
    source: null,
    transaction: null,
    readyState: "pending" as IDBRequestReadyState,
    onsuccess: null as ((this: IDBRequest<T>, ev: Event) => unknown) | null,
    onerror: null as ((this: IDBRequest<T>, ev: Event) => unknown) | null,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => true
  } as IDBRequest<T>;

  queueMicrotask(() => {
    try {
      const value = executor();
      Object.assign(request, {
        result: value,
        readyState: "done"
      });
      request.onsuccess?.call(request, new Event("success"));
    } catch (error) {
      Object.assign(request, {
        error: error instanceof DOMException ? error : new DOMException(String(error)),
        readyState: "done"
      });
      request.onerror?.call(request, new Event("error"));
    }
  });

  return request;
}

function createIndexedDb(seed: Record<string, Record<string, unknown[]>>): IDBFactory & { __debugDatabases: FakeDatabaseMap } {
  const databases: FakeDatabaseMap = new Map(
    Object.entries(seed).map(([dbName, stores]) => [dbName, new Map(Object.entries(stores))])
  );

  const openDb = (name: string): IDBDatabase => {
    const stores = databases.get(name);
    if (!stores) {
      throw new Error(`DB not found: ${name}`);
    }

    return {
      name,
      version: 1,
      objectStoreNames: Array.from(stores.keys()) as unknown as DOMStringList,
      close: () => undefined,
      createObjectStore: () => {
        throw new Error("not implemented");
      },
      deleteObjectStore: () => {
        throw new Error("not implemented");
      },
      transaction: (storeName: string | string[]) => {
        const target = Array.isArray(storeName) ? storeName[0] : storeName;
        const values = stores.get(target);
        if (!values) {
          throw new Error(`Store not found: ${target}`);
        }

        return {
          objectStore: () => ({
            count: () => createFakeRequest(() => values.length),
            getAll: () => createFakeRequest(() => [...values]),
            put: (value: unknown) =>
              createFakeRequest(() => {
                const key =
                  value && typeof value === "object" && "dateLocal" in (value as Record<string, unknown>)
                    ? String((value as Record<string, unknown>).dateLocal)
                    : null;

                if (key !== null) {
                  const next = [...values];
                  const currentIndex = next.findIndex(
                    (item) =>
                      item &&
                      typeof item === "object" &&
                      "dateLocal" in (item as Record<string, unknown>) &&
                      String((item as Record<string, unknown>).dateLocal) === key
                  );
                  if (currentIndex >= 0) {
                    next[currentIndex] = value;
                  } else {
                    next.push(value);
                  }
                  stores.set(target, next);
                } else {
                  stores.set(target, [...values, value]);
                }
                return key ?? "key";
              }),
            delete: (key: unknown) =>
              createFakeRequest(() => {
                const resolveKey = (item: unknown): string | null => {
                  if (!item || typeof item !== "object") {
                    return null;
                  }
                  const record = item as Record<string, unknown>;
                  if (typeof record.dateLocal === "string") {
                    return record.dateLocal;
                  }
                  if (typeof record.photoId === "string") {
                    return record.photoId;
                  }
                  if (typeof record.id === "string") {
                    return record.id;
                  }
                  return null;
                };

                const current = stores.get(target) ?? [];
                stores.set(
                  target,
                  current.filter((item) => resolveKey(item) !== String(key))
                );
                return undefined;
              }),
            clear: () =>
              createFakeRequest(() => {
                stores.set(target, []);
                return undefined;
              })
          })
        } as unknown as IDBTransaction;
      }
    } as unknown as IDBDatabase;
  };

  return {
    cmp: () => 0,
    open: (name: string) => createFakeRequest(() => openDb(name)) as IDBOpenDBRequest,
    deleteDatabase: (name: string) =>
      createFakeRequest(() => {
        databases.delete(name);
        return undefined;
      }) as IDBOpenDBRequest,
    databases: async () => Array.from(databases.keys()).map((name) => ({ name })),
    __debugDatabases: databases
  } as IDBFactory & { __debugDatabases: FakeDatabaseMap };
}

function installWindow(seed: {
  localStorage: Record<string, string>;
  indexedDb: Record<string, Record<string, unknown[]>>;
}): FakeWindow {
  const fakeWindow = {
    localStorage: createLocalStorage(seed.localStorage),
    indexedDB: createIndexedDb(seed.indexedDb)
  };

  (globalThis as { window?: unknown }).window = fakeWindow;
  return fakeWindow;
}

function findItem(items: StoragePreviewItem[], id: string): StoragePreviewItem {
  const item = items.find((candidate) => candidate.id === id);
  if (!item) {
    throw new Error(`item not found: ${id}`);
  }
  return item;
}

afterEach(() => {
  delete (globalThis as { window?: unknown }).window;
});

describe("storage-admin", () => {
  it("UT-STORAGE-001: localStorage一覧を取得できる（テンプレートキーは非表示）", async () => {
    installWindow({
      localStorage: {
        "capd-support:home:slots:v1": '[{"status":"未実施"}]',
        "capd-support:templates:v1": "[]"
      },
      indexedDb: {}
    });

    const items = await listStoragePreview();

    expect(items.some((item) => item.id === "local:capd-support:home:slots:v1")).toBe(true);
    expect(items.some((item) => item.id === "local:capd-support:templates:v1")).toBe(false);
  });

  it("UT-STORAGE-002: JSON値は整形プレビュー、非JSONはrawプレビュー", async () => {
    installWindow({
      localStorage: {
        json: '{"a":1}',
        raw: "plain-text"
      },
      indexedDb: {}
    });

    const items = await listStoragePreview();

    expect(findItem(items, "local:json").previewText).toContain('"a": 1');
    expect(findItem(items, "local:raw").previewText).toBe("plain-text");
  });

  it("UT-STORAGE-003: IndexedDBのDB/storeメタ情報を取得できる", async () => {
    installWindow({
      localStorage: {},
      indexedDb: {
        "capd-support-db": {
          protocol_packages: [{ protocolId: "p1" }],
          sessions: [{ id: "s1" }],
          records: [{ id: "r1" }, { id: "r2" }]
        }
      }
    });

    const items = await listStoragePreview();

    const dbItem = findItem(items, "idbdb:capd-support-db");
    expect(dbItem.scope).toBe("indexeddb_database");

    const sessions = findItem(items, "idb:capd-support-db:sessions");
    expect(sessions.scope).toBe("indexeddb_store");
    expect(sessions.recordCount).toBe(1);

    const records = findItem(items, "idb:capd-support-db:records");
    expect(records.recordCount).toBe(2);

    expect(items.some((item) => item.id === "idb:capd-support-db:protocol_packages")).toBe(false);
  });

  it("UT-STORAGE-004: 単体削除で指定ターゲットのみ削除される", async () => {
    installWindow({
      localStorage: {
        keep: "1",
        remove: "2"
      },
      indexedDb: {}
    });

    await deleteStorageTargets([{ scope: "local", key: "remove" }]);
    const items = await listStoragePreview();

    expect(items.some((item) => item.id === "local:keep")).toBe(true);
    expect(items.some((item) => item.id === "local:remove")).toBe(false);
  });

  it("UT-STORAGE-005: 全削除でlocalStorage+IndexedDBが空になる", async () => {
    installWindow({
      localStorage: {
        one: "1"
      },
      indexedDb: {
        "capd-support-db": {
          sessions: [{ id: "s1" }]
        }
      }
    });

    await clearAllStorage();
    const items = await listStoragePreview();

    expect(items).toEqual([]);
  });

  it("UT-STORAGE-006: 全削除でもCSVテンプレートとスロット登録を保持する", async () => {
    const fakeWindow = installWindow({
      localStorage: {
        one: "1",
        "capd-support:home:slots:v1": JSON.stringify([
          {
            protocolId: "p1",
            protocolLabel: "template-1",
            recommendedTime: "20:00",
            status: "実施済み"
          },
          null,
          null,
          null
        ])
      },
      indexedDb: {
        "capd-support-db": {
          protocol_packages: [{ protocolId: "p1" }],
          photo_meta: [
            { photoId: "protasset::p1::img-1.png", protocolId: "p1", assetKey: "img-1.png" },
            { photoId: "photo_exit_1", protocolId: "p1", assetKey: "exit.jpg" }
          ],
          daily_procedure_plans: [
            {
              dateLocal: "2026-02-12",
              slots: [
                {
                  protocolId: "p1",
                  protocolLabel: "template-1",
                  recommendedTime: "20:00",
                  status: "実施済み"
                },
                null,
                null,
                null
              ]
            }
          ],
          sessions: [{ id: "s1" }]
        },
        "tmp-db": {
          logs: [{ id: "x1" }]
        }
      }
    });

    await clearAllStorage();

    const capdDb = fakeWindow.indexedDB.__debugDatabases.get("capd-support-db");
    expect(capdDb).toBeDefined();
    expect(capdDb?.get("protocol_packages")?.length).toBe(1);
    expect(capdDb?.get("photo_meta")).toEqual([{ photoId: "protasset::p1::img-1.png", protocolId: "p1", assetKey: "img-1.png" }]);
    expect(capdDb?.get("daily_procedure_plans")?.length).toBe(1);
    expect(capdDb?.get("sessions")?.length).toBe(0);
    const dailyPlan = capdDb?.get("daily_procedure_plans")?.[0] as
      | {
          slots?: Array<{ status?: string } | null>;
        }
      | undefined;
    expect(dailyPlan?.slots?.[0]?.status).toBe("未実施");
    expect(fakeWindow.indexedDB.__debugDatabases.has("tmp-db")).toBe(false);
    expect(fakeWindow.localStorage.getItem("one")).toBeNull();
    expect(fakeWindow.localStorage.getItem("capd-support:home:slots:v1")).not.toBeNull();
    const localSlots = JSON.parse(fakeWindow.localStorage.getItem("capd-support:home:slots:v1") ?? "[]") as Array<{
      status?: string;
    } | null>;
    expect(localSlots[0]?.status).toBe("未実施");
  });
});
