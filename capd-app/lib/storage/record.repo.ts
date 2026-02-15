import { requestToPromise, withTransaction } from "@/lib/storage/capd-db";
import type { RecordEntity } from "@/lib/storage/models";

function normalizeRecord(value: unknown): RecordEntity | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const entity = value as Partial<RecordEntity>;
  if (
    typeof entity.recordId !== "string" ||
    typeof entity.sessionId !== "string" ||
    typeof entity.dateLocal !== "string" ||
    typeof entity.stepId !== "string" ||
    typeof entity.recordEvent !== "string" ||
    typeof entity.recordExchangeNo !== "string" ||
    typeof entity.recordUnit !== "string" ||
    !entity.payload ||
    typeof entity.payload !== "object"
    // Allow optional dates for now to see if that's the blocker
    // typeof entity.createdAtIso !== "string" ||
    // typeof entity.updatedAtIso !== "string"
  ) {
    return null;
  }

  return {
    recordId: entity.recordId,
    sessionId: entity.sessionId,
    dateLocal: entity.dateLocal,
    stepId: entity.stepId,
    recordEvent: entity.recordEvent,
    recordExchangeNo: entity.recordExchangeNo,
    recordUnit: entity.recordUnit,
    payload: entity.payload,
    createdAtIso: entity.createdAtIso || "",
    updatedAtIso: entity.updatedAtIso || ""
  };
}

export async function upsertRecord(entity: RecordEntity): Promise<void> {
  await withTransaction("records", "readwrite", async (transaction) => {
    const store = transaction.objectStore("records");
    await requestToPromise(store.put(entity));
  });
}

export async function listRecordsBySession(sessionId: string): Promise<RecordEntity[]> {
  return withTransaction("records", "readonly", async (transaction) => {
    const store = transaction.objectStore("records");
    const index = store.index("by_session");
    const rows = await requestToPromise(index.getAll(sessionId));
    return rows
      .map((row) => normalizeRecord(row))
      .filter((row): row is RecordEntity => row !== null)
      .sort((a, b) => a.createdAtIso.localeCompare(b.createdAtIso));
  });
}

export async function listRecordsByDate(dateLocal: string): Promise<RecordEntity[]> {
  return withTransaction("records", "readonly", async (transaction) => {
    const store = transaction.objectStore("records");
    const index = store.index("by_date");
    const rows = await requestToPromise(index.getAll(dateLocal));
    return rows
      .map((row) => normalizeRecord(row))
      .filter((row): row is RecordEntity => row !== null)
      .sort((a, b) => a.createdAtIso.localeCompare(b.createdAtIso));
  });
}

export async function hasRecordForStep(sessionId: string, stepId: string): Promise<boolean> {
  const records = await withTransaction("records", "readonly", async (transaction) => {
    const store = transaction.objectStore("records");
    const index = store.index("by_session_step");
    return requestToPromise(index.getAll(IDBKeyRange.only([sessionId, stepId])));
  });

  return records.length > 0;
}

export async function deleteRecordsBySession(sessionId: string): Promise<void> {
  await withTransaction("records", "readwrite", async (transaction) => {
    const store = transaction.objectStore("records");
    const index = store.index("by_session");
    const keys = await requestToPromise(index.getAllKeys(sessionId));
    for (const key of keys) {
      store.delete(key);
    }
  });
}

export async function deleteRecordsByDateAndExchangeNo(dateLocal: string, exchangeNo: string): Promise<void> {
  await withTransaction("records", "readwrite", async (transaction) => {
    const store = transaction.objectStore("records");
    const index = store.index("by_date");
    const rows = await requestToPromise(index.getAll(dateLocal));
    for (const row of rows) {
      // normalizeRecordを通さなくても row.recordExchangeNo はアクセス可能だが、念のため型安全に
      const r = row as RecordEntity;
      if (r.recordExchangeNo === exchangeNo) {
        store.delete(r.recordId);
      }
    }
  });
}
