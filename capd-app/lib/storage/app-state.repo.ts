import { requestToPromise, withTransaction } from "@/lib/storage/capd-db";
import type { ActiveSessionCache } from "@/lib/storage/models";

const ACTIVE_SESSION_STATE_KEY = "active_session";

export async function readActiveSessionFromDb(): Promise<ActiveSessionCache | null> {
    return withTransaction("sync_state", "readonly", async (transaction) => {
        const store = transaction.objectStore("sync_state");
        const row = await requestToPromise(store.get(ACTIVE_SESSION_STATE_KEY));
        if (row && typeof row === "object" && "data" in row) {
            return row.data as ActiveSessionCache;
        }
        return null;
    });
}

export async function writeActiveSessionToDb(session: ActiveSessionCache): Promise<void> {
    await withTransaction("sync_state", "readwrite", async (transaction) => {
        const store = transaction.objectStore("sync_state");
        await requestToPromise(
            store.put({
                id: ACTIVE_SESSION_STATE_KEY,
                data: session,
                updatedAtIso: new Date().toISOString()
            })
        );
    });
}

export async function clearActiveSessionFromDb(): Promise<void> {
    await withTransaction("sync_state", "readwrite", async (transaction) => {
        const store = transaction.objectStore("sync_state");
        await requestToPromise(store.delete(ACTIVE_SESSION_STATE_KEY));
    });
}
