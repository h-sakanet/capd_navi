import type { DeleteTarget, StoragePreviewItem, StorageSnapshot } from "@/lib/storage-admin.types";
import { CAPD_DB_NAME, closeCapdDbConnection } from "@/lib/storage/capd-db";
import { isProtocolAssetPhotoId } from "@/lib/storage/protocol.repo";

const HIDDEN_LOCAL_STORAGE_KEYS = new Set<string>(["capd-support:templates:v1"]);
const HIDDEN_INDEXEDDB_STORES = new Map<string, Set<string>>([["capd-support-db", new Set<string>(["protocol_packages"])]]);
const LEGACY_TEMPLATE_STORAGE_KEY = "capd-support:templates:v1";
const SLOT_STORAGE_KEY = "capd-support:home:slots:v1";
const PROTOCOL_PACKAGES_STORE_NAME = "protocol_packages";
const DAILY_PROCEDURE_PLANS_STORE_NAME = "daily_procedure_plans";
const PHOTO_META_STORE_NAME = "photo_meta";
const RETAINED_LOCAL_STORAGE_KEYS = [LEGACY_TEMPLATE_STORAGE_KEY, SLOT_STORAGE_KEY] as const;
const RETAINED_CAPD_STORE_NAMES = [
  PROTOCOL_PACKAGES_STORE_NAME,
  DAILY_PROCEDURE_PLANS_STORE_NAME,
  PHOTO_META_STORE_NAME
] as const;

type ProcedureSlotStatus = "未実施" | "実施中" | "実施済み";

type ProcedureSlotLike = {
  protocolId: string;
  protocolLabel: string;
  recommendedTime: string;
  status: ProcedureSlotStatus;
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function byteSizeOf(value: string): number {
  try {
    return new TextEncoder().encode(value).length;
  } catch {
    return value.length;
  }
}

function formatPreview(raw: string): string {
  try {
    const parsed = JSON.parse(raw);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return raw;
  }
}

function shouldHideLocalStorageKey(key: string): boolean {
  return HIDDEN_LOCAL_STORAGE_KEYS.has(key);
}

function shouldHideIndexedDbStore(dbName: string, storeName: string): boolean {
  const hiddenStores = HIDDEN_INDEXEDDB_STORES.get(dbName);
  if (!hiddenStores) {
    return false;
  }
  return hiddenStores.has(storeName);
}

function isProcedureSlotLike(value: unknown): value is ProcedureSlotLike {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as Partial<ProcedureSlotLike>;
  return (
    typeof item.protocolId === "string" &&
    typeof item.protocolLabel === "string" &&
    typeof item.recommendedTime === "string" &&
    (item.status === "未実施" || item.status === "実施中" || item.status === "実施済み")
  );
}

function resetSlotStatuses(value: unknown): unknown {
  if (!Array.isArray(value)) {
    return value;
  }

  return value.map((slot) => {
    if (slot === null) {
      return null;
    }
    if (!isProcedureSlotLike(slot)) {
      return null;
    }
    return {
      ...slot,
      status: "未実施" as const
    };
  });
}

function resetLocalSlotStatuses(raw: string | null): string | null {
  if (raw === null) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    const normalized = resetSlotStatuses(parsed);
    return JSON.stringify(normalized);
  } catch {
    return raw;
  }
}

const IDB_REQUEST_TIMEOUT_MS = 5000;

function toRequestPromise<T>(
  request: IDBRequest<T>,
  options?: {
    timeoutMs?: number;
    blockedMessage?: string;
  }
): Promise<T> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const timeoutMs = options?.timeoutMs ?? IDB_REQUEST_TIMEOUT_MS;
    const timer = setTimeout(() => {
      if (settled) {
        return;
      }
      settled = true;
      reject(new Error("IndexedDB request timeout."));
    }, timeoutMs);

    const cleanup = () => {
      clearTimeout(timer);
    };

    const resolveOnce = (value: T) => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      resolve(value);
    };

    const rejectOnce = (error: Error) => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      reject(error);
    };

    request.onsuccess = () => resolveOnce(request.result);
    request.onerror = () => rejectOnce(request.error ?? new Error("IndexedDB request failed."));

    if ("onblocked" in request) {
      (request as IDBOpenDBRequest).onblocked = () => {
        rejectOnce(new Error(options?.blockedMessage ?? "IndexedDB request blocked."));
      };
    }
  });
}

async function openDatabase(name: string): Promise<IDBDatabase> {
  const request = window.indexedDB.open(name);
  return toRequestPromise(request);
}

async function clearStore(dbName: string, storeName: string): Promise<void> {
  const db = await openDatabase(dbName);
  try {
    const tx = db.transaction(storeName, "readwrite");
    const request = tx.objectStore(storeName).clear();
    await toRequestPromise(request);
  } finally {
    db.close();
  }
}

async function deleteDatabase(dbName: string): Promise<void> {
  closeCapdDbConnection();
  const request = window.indexedDB.deleteDatabase(dbName);
  await toRequestPromise(request, { blockedMessage: `IndexedDB delete blocked: ${dbName}` });
}

function toDeleteTarget(item: StoragePreviewItem): DeleteTarget | null {
  if (item.scope === "local") {
    return {
      scope: "local",
      key: item.key
    };
  }

  if (item.scope === "indexeddb_database" && item.dbName) {
    return {
      scope: "indexeddb_database",
      key: item.key,
      dbName: item.dbName
    };
  }

  if (item.scope === "indexeddb_store" && item.dbName && item.storeName) {
    return {
      scope: "indexeddb_store",
      key: item.key,
      dbName: item.dbName,
      storeName: item.storeName
    };
  }

  return null;
}

function sortItems(items: StoragePreviewItem[]): StoragePreviewItem[] {
  return [...items].sort((a, b) => {
    const scopeOrder: Record<StoragePreviewItem["scope"], number> = {
      local: 0,
      indexeddb_database: 1,
      indexeddb_store: 2
    };

    if (scopeOrder[a.scope] !== scopeOrder[b.scope]) {
      return scopeOrder[a.scope] - scopeOrder[b.scope];
    }

    return a.id.localeCompare(b.id, "ja");
  });
}

function listLocalStorageItems(): StoragePreviewItem[] {
  const items: StoragePreviewItem[] = [];
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key) {
      continue;
    }
    if (shouldHideLocalStorageKey(key)) {
      continue;
    }

    const raw = window.localStorage.getItem(key) ?? "";
    items.push({
      id: `local:${key}`,
      scope: "local",
      key,
      sizeBytes: byteSizeOf(raw),
      rawValue: raw,
      previewText: formatPreview(raw)
    });
  }

  return items;
}

async function listIndexedDbItems(): Promise<{ items: StoragePreviewItem[]; warning?: string }> {
  if (!window.indexedDB) {
    return {
      items: [],
      warning: "IndexedDB が利用できません。localStorage のみ表示します。"
    };
  }

  if (typeof window.indexedDB.databases !== "function") {
    return {
      items: [],
      warning: "IndexedDB 一覧 API が未対応です。localStorage のみ表示します。"
    };
  }

  try {
    const databaseInfos = await window.indexedDB.databases();
    const names = databaseInfos
      .map((info) => info.name)
      .filter((name): name is string => typeof name === "string" && name.length > 0)
      .sort((a, b) => a.localeCompare(b, "ja"));

    const items: StoragePreviewItem[] = [];

    for (const dbName of names) {
      const db = await openDatabase(dbName);
      const stores = Array.from(db.objectStoreNames)
        .filter((storeName) => !shouldHideIndexedDbStore(dbName, storeName))
        .sort((a, b) => a.localeCompare(b, "ja"));
      db.close();
      if (!stores.length) {
        continue;
      }

      items.push({
        id: `idbdb:${dbName}`,
        scope: "indexeddb_database",
        key: dbName,
        dbName,
        previewText: `stores: ${stores.length}`
      });

      for (const storeName of stores) {
        const opened = await openDatabase(dbName);
        try {
          const tx = opened.transaction(storeName, "readonly");
          const request = tx.objectStore(storeName).count();
          const count = await toRequestPromise(request);
          items.push({
            id: `idb:${dbName}:${storeName}`,
            scope: "indexeddb_store",
            key: `${dbName}/${storeName}`,
            dbName,
            storeName,
            recordCount: count,
            previewText: `records: ${count}`
          });
        } finally {
          opened.close();
        }
      }
    }

    return { items };
  } catch {
    return {
      items: [],
      warning: "IndexedDB の読み込みに失敗しました。localStorage のみ表示します。"
    };
  }
}

export async function loadStorageSnapshot(): Promise<StorageSnapshot> {
  if (!isBrowser()) {
    return {
      items: [],
      warnings: [],
      generatedAtIso: new Date().toISOString()
    };
  }

  const warnings: string[] = [];
  const localItems = listLocalStorageItems();
  const indexed = await listIndexedDbItems();

  if (indexed.warning) {
    warnings.push(indexed.warning);
  }

  return {
    items: sortItems([...localItems, ...indexed.items]),
    warnings,
    generatedAtIso: new Date().toISOString()
  };
}

export async function listStoragePreview(): Promise<StoragePreviewItem[]> {
  const snapshot = await loadStorageSnapshot();
  return snapshot.items;
}

export async function deleteStorageTargets(targets: DeleteTarget[]): Promise<void> {
  if (!isBrowser() || !targets.length) {
    return;
  }

  if (targets.some((target) => target.scope !== "local")) {
    closeCapdDbConnection();
  }

  const dbTargets = new Set(
    targets
      .filter((target) => target.scope === "indexeddb_database" && target.dbName)
      .map((target) => target.dbName as string)
  );

  for (const target of targets) {
    if (target.scope !== "local") {
      continue;
    }
    window.localStorage.removeItem(target.key);
  }

  for (const target of targets) {
    if (target.scope !== "indexeddb_store" || !target.dbName || !target.storeName) {
      continue;
    }
    if (dbTargets.has(target.dbName)) {
      continue;
    }
    await clearStore(target.dbName, target.storeName);
  }

  for (const dbName of dbTargets) {
    await deleteDatabase(dbName);
  }
}

async function clearCapdDbKeepingRetainedStores(dbName: string): Promise<void> {
  const db = await openDatabase(dbName);
  const storeNames = Array.from(db.objectStoreNames);
  const retainedStoreSet = new Set<string>(RETAINED_CAPD_STORE_NAMES);
  const retainedStores = storeNames.filter((storeName) => retainedStoreSet.has(storeName));

  if (!retainedStores.length) {
    db.close();
    await deleteDatabase(dbName);
    return;
  }

  const retainedCounts = new Map<string, number>();
  try {
    for (const storeName of retainedStores) {
      const tx = db.transaction(storeName, "readonly");
      const count =
        storeName === PHOTO_META_STORE_NAME
          ? ((await toRequestPromise(tx.objectStore(storeName).getAll())) as Array<Record<string, unknown>>).filter((item) => {
              const photoId = item?.photoId;
              return typeof photoId === "string" && isProtocolAssetPhotoId(photoId);
            }).length
          : await toRequestPromise(tx.objectStore(storeName).count());
      retainedCounts.set(storeName, count);
    }
  } finally {
    db.close();
  }

  const hasRetainedData = Array.from(retainedCounts.values()).some((count) => count > 0);
  if (!hasRetainedData) {
    await deleteDatabase(dbName);
    return;
  }

  const clearTargets = storeNames.filter((storeName) => !retainedStoreSet.has(storeName));
  for (const storeName of clearTargets) {
    await clearStore(dbName, storeName);
  }

  if (retainedStoreSet.has(DAILY_PROCEDURE_PLANS_STORE_NAME) && storeNames.includes(DAILY_PROCEDURE_PLANS_STORE_NAME)) {
    const dbForReset = await openDatabase(dbName);
    try {
      const tx = dbForReset.transaction(DAILY_PROCEDURE_PLANS_STORE_NAME, "readwrite");
      const store = tx.objectStore(DAILY_PROCEDURE_PLANS_STORE_NAME);
      const rows = await toRequestPromise(store.getAll());
      for (const row of rows as Array<Record<string, unknown>>) {
        if (!row || typeof row !== "object" || !("slots" in row)) {
          continue;
        }
        await toRequestPromise(
          store.put({
            ...row,
            slots: resetSlotStatuses((row as { slots?: unknown }).slots)
          })
        );
      }
    } finally {
      dbForReset.close();
    }
  }

  if (retainedStoreSet.has(PHOTO_META_STORE_NAME) && storeNames.includes(PHOTO_META_STORE_NAME)) {
    const dbForAssetReset = await openDatabase(dbName);
    try {
      const tx = dbForAssetReset.transaction(PHOTO_META_STORE_NAME, "readwrite");
      const store = tx.objectStore(PHOTO_META_STORE_NAME);
      const rows = await toRequestPromise(store.getAll());
      for (const row of rows as Array<Record<string, unknown>>) {
        const photoId = row?.photoId;
        if (typeof photoId !== "string" || isProtocolAssetPhotoId(photoId)) {
          continue;
        }
        await toRequestPromise(store.delete(photoId));
      }
    } finally {
      dbForAssetReset.close();
    }
  }
}

export async function clearAllStorage(): Promise<void> {
  if (!isBrowser()) {
    return;
  }

  closeCapdDbConnection();
  const retainedLocalEntries = RETAINED_LOCAL_STORAGE_KEYS.map((key) => {
    if (key === SLOT_STORAGE_KEY) {
      return [key, resetLocalSlotStatuses(window.localStorage.getItem(key))] as const;
    }
    return [key, window.localStorage.getItem(key)] as const;
  });
  window.localStorage.clear();
  for (const [key, value] of retainedLocalEntries) {
    if (value !== null) {
      window.localStorage.setItem(key, value);
    }
  }

  if (!window.indexedDB || typeof window.indexedDB.databases !== "function") {
    return;
  }

  const infos = await window.indexedDB.databases();
  const names = infos
    .map((info) => info.name)
    .filter((name): name is string => typeof name === "string" && name.length > 0);

  for (const name of names) {
    if (name === CAPD_DB_NAME) {
      await clearCapdDbKeepingRetainedStores(name);
      continue;
    }
    await deleteDatabase(name);
  }
}

export function toStorageDeleteTarget(item: StoragePreviewItem): DeleteTarget | null {
  return toDeleteTarget(item);
}

export function buildStorageExportJson(snapshot: StorageSnapshot): string {
  return JSON.stringify(snapshot, null, 2);
}
