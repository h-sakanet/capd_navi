export const CAPD_DB_NAME = "capd-support-db";
export const CAPD_DB_VERSION = 1;

export const CAPD_STORE_NAMES = [
  "protocol_packages",
  "daily_procedure_plans",
  "sessions",
  "session_protocol_snapshots",
  "records",
  "timer_events",
  "alarm_dispatch_jobs",
  "outbox_mutations",
  "sync_state",
  "photo_meta"
] as const;

export type CapdStoreName = (typeof CAPD_STORE_NAMES)[number];

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function isIndexedDbAvailable(): boolean {
  return isBrowser() && typeof window.indexedDB !== "undefined";
}

function createStores(db: IDBDatabase): void {
  if (!db.objectStoreNames.contains("protocol_packages")) {
    db.createObjectStore("protocol_packages", { keyPath: "protocolId" });
  }
  if (!db.objectStoreNames.contains("daily_procedure_plans")) {
    db.createObjectStore("daily_procedure_plans", { keyPath: "dateLocal" });
  }
  if (!db.objectStoreNames.contains("sessions")) {
    const store = db.createObjectStore("sessions", { keyPath: "sessionId" });
    store.createIndex("by_date", "dateLocal", { unique: false });
    store.createIndex("by_status", "status", { unique: false });
  }
  if (!db.objectStoreNames.contains("session_protocol_snapshots")) {
    db.createObjectStore("session_protocol_snapshots", { keyPath: "sessionId" });
  }
  if (!db.objectStoreNames.contains("records")) {
    const store = db.createObjectStore("records", { keyPath: "recordId" });
    store.createIndex("by_session", "sessionId", { unique: false });
    store.createIndex("by_date", "dateLocal", { unique: false });
    store.createIndex("by_session_step", ["sessionId", "stepId"], { unique: false });
  }
  if (!db.objectStoreNames.contains("timer_events")) {
    const store = db.createObjectStore("timer_events", { keyPath: "eventId" });
    store.createIndex("by_session", "sessionId", { unique: false });
    store.createIndex("by_date", "dateLocal", { unique: false });
    store.createIndex("by_dedupe", "dedupeKey", { unique: true });
  }
  if (!db.objectStoreNames.contains("alarm_dispatch_jobs")) {
    const store = db.createObjectStore("alarm_dispatch_jobs", { keyPath: "jobId" });
    store.createIndex("by_session", "sessionId", { unique: false });
    store.createIndex("by_dedupe", "dedupeKey", { unique: true });
    store.createIndex("by_session_step", ["sessionId", "stepId"], { unique: false });
  }
  if (!db.objectStoreNames.contains("outbox_mutations")) {
    db.createObjectStore("outbox_mutations", { keyPath: "mutationId" });
  }
  if (!db.objectStoreNames.contains("sync_state")) {
    db.createObjectStore("sync_state", { keyPath: "id" });
  }
  if (!db.objectStoreNames.contains("photo_meta")) {
    db.createObjectStore("photo_meta", { keyPath: "photoId" });
  }
}

let openDbPromise: Promise<IDBDatabase> | null = null;
let openDbConnection: IDBDatabase | null = null;

export function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed."));
  });
}

export function waitTransactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("IndexedDB transaction failed."));
    transaction.onabort = () => reject(transaction.error ?? new Error("IndexedDB transaction aborted."));
  });
}

export async function openCapdDb(): Promise<IDBDatabase> {
  if (!isIndexedDbAvailable()) {
    throw new Error("IndexedDB が利用できません。");
  }

  if (openDbPromise) {
    return openDbPromise;
  }

  openDbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(CAPD_DB_NAME, CAPD_DB_VERSION);
    request.onupgradeneeded = () => {
      createStores(request.result);
    };
    request.onsuccess = () => {
      openDbConnection = request.result;
      openDbConnection.onversionchange = () => {
        openDbConnection?.close();
        openDbConnection = null;
        openDbPromise = null;
      };
      resolve(request.result);
    };
    request.onerror = () => reject(request.error ?? new Error("IndexedDB open failed."));
  });

  return openDbPromise;
}

export async function withTransaction<T>(
  storeNames: CapdStoreName | CapdStoreName[],
  mode: IDBTransactionMode,
  runner: (transaction: IDBTransaction) => Promise<T> | T
): Promise<T> {
  const db = await openCapdDb();
  const names = Array.isArray(storeNames) ? storeNames : [storeNames];
  const transaction = db.transaction(names, mode);

  const result = await runner(transaction);
  await waitTransactionDone(transaction);
  return result;
}

export function resetCapdDbConnectionCache(): void {
  if (openDbConnection) {
    openDbConnection.close();
    openDbConnection = null;
  }
  openDbPromise = null;
}

export function closeCapdDbConnection(): void {
  resetCapdDbConnectionCache();
}
