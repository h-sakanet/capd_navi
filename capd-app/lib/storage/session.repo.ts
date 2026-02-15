import { requestToPromise, withTransaction } from "@/lib/storage/capd-db";
import type { SessionEntity } from "@/lib/storage/models";

function normalizeSession(value: unknown): SessionEntity | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const entity = value as Partial<SessionEntity>;
  if (
    typeof entity.sessionId !== "string" ||
    typeof entity.slotIndex !== "number" ||
    typeof entity.dateLocal !== "string" ||
    typeof entity.protocolId !== "string" ||
    typeof entity.snapshotHash !== "string" ||
    typeof entity.currentStepId !== "string" ||
    (entity.status !== "active" && entity.status !== "completed" && entity.status !== "aborted") ||
    typeof entity.startedAtIso !== "string" ||
    typeof entity.updatedAtIso !== "string"
  ) {
    return null;
  }

  return {
    sessionId: entity.sessionId,
    slotIndex: entity.slotIndex,
    dateLocal: entity.dateLocal,
    protocolId: entity.protocolId,
    snapshotHash: entity.snapshotHash,
    currentStepId: entity.currentStepId,
    status: entity.status,
    startedAtIso: entity.startedAtIso,
    completedAtIso: entity.completedAtIso ?? null,
    abortedAtIso: entity.abortedAtIso ?? null,
    updatedAtIso: entity.updatedAtIso
  };
}

export async function upsertSession(entity: SessionEntity): Promise<void> {
  await withTransaction("sessions", "readwrite", async (transaction) => {
    const store = transaction.objectStore("sessions");
    await requestToPromise(store.put(entity));
  });
}

export async function getSession(sessionId: string): Promise<SessionEntity | null> {
  return withTransaction("sessions", "readonly", async (transaction) => {
    const store = transaction.objectStore("sessions");
    const row = await requestToPromise(store.get(sessionId));
    return normalizeSession(row);
  });
}

export async function listSessionsByDate(dateLocal: string): Promise<SessionEntity[]> {
  return withTransaction("sessions", "readonly", async (transaction) => {
    const store = transaction.objectStore("sessions");
    const index = store.index("by_date");
    const rows = await requestToPromise(index.getAll(dateLocal));
    return rows
      .map((row) => normalizeSession(row))
      .filter((row): row is SessionEntity => row !== null)
      .sort((a, b) => b.startedAtIso.localeCompare(a.startedAtIso));
  });
}
