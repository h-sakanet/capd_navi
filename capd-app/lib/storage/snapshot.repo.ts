import { requestToPromise, withTransaction } from "@/lib/storage/capd-db";
import type { SessionProtocolSnapshot } from "@/lib/storage/models";

function normalizeSnapshot(value: unknown): SessionProtocolSnapshot | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const entity = value as Partial<SessionProtocolSnapshot>;
  if (
    typeof entity.sessionId !== "string" ||
    !entity.sourceProtocol ||
    typeof entity.sourceProtocol.protocolId !== "string" ||
    typeof entity.sourceProtocol.protocolName !== "string" ||
    typeof entity.sourceProtocol.importedAt !== "string" ||
    !Array.isArray(entity.steps) ||
    !Array.isArray(entity.assetManifest) ||
    typeof entity.snapshotHash !== "string" ||
    typeof entity.createdAtIso !== "string"
  ) {
    return null;
  }

  return {
    sessionId: entity.sessionId,
    sourceProtocol: entity.sourceProtocol,
    steps: entity.steps,
    assetManifest: entity.assetManifest,
    snapshotHash: entity.snapshotHash,
    createdAtIso: entity.createdAtIso
  };
}

export async function upsertSessionSnapshot(snapshot: SessionProtocolSnapshot): Promise<void> {
  await withTransaction("session_protocol_snapshots", "readwrite", async (transaction) => {
    const store = transaction.objectStore("session_protocol_snapshots");
    await requestToPromise(store.put(snapshot));
  });
}

export async function getSessionSnapshot(sessionId: string): Promise<SessionProtocolSnapshot | null> {
  return withTransaction("session_protocol_snapshots", "readonly", async (transaction) => {
    const store = transaction.objectStore("session_protocol_snapshots");
    const row = await requestToPromise(store.get(sessionId));
    return normalizeSnapshot(row);
  });
}
