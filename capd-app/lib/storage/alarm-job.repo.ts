import { requestToPromise, withTransaction } from "@/lib/storage/capd-db";
import type { AlarmDispatchJobEntity } from "@/lib/storage/models";

function normalizeAlarmJob(value: unknown): AlarmDispatchJobEntity | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const entity = value as Partial<AlarmDispatchJobEntity>;
  if (
    typeof entity.jobId !== "string" ||
    typeof entity.dedupeKey !== "string" ||
    typeof entity.sessionId !== "string" ||
    typeof entity.dateLocal !== "string" ||
    typeof entity.stepId !== "string" ||
    typeof entity.alarmId !== "string" ||
    (entity.alarmTrigger !== "" && entity.alarmTrigger !== "timer_end" && entity.alarmTrigger !== "step_enter") ||
    (typeof entity.alarmDurationMin !== "number" && entity.alarmDurationMin !== null) ||
    typeof entity.alarmRelatedTimerId !== "string" ||
    typeof entity.dueAtIso !== "string" ||
    (entity.status !== "pending" && entity.status !== "notified" && entity.status !== "acknowledged" && entity.status !== "missed") ||
    typeof entity.attemptNo !== "number" ||
    typeof entity.createdAtIso !== "string" ||
    typeof entity.updatedAtIso !== "string"
  ) {
    return null;
  }

  return {
    jobId: entity.jobId,
    dedupeKey: entity.dedupeKey,
    sessionId: entity.sessionId,
    dateLocal: entity.dateLocal,
    stepId: entity.stepId,
    alarmId: entity.alarmId,
    alarmTrigger: entity.alarmTrigger,
    alarmDurationMin: entity.alarmDurationMin,
    alarmRelatedTimerId: entity.alarmRelatedTimerId,
    dueAtIso: entity.dueAtIso,
    status: entity.status,
    attemptNo: entity.attemptNo,
    createdAtIso: entity.createdAtIso,
    updatedAtIso: entity.updatedAtIso,
    ackedAtIso: entity.ackedAtIso ?? null
  };
}

export async function findAlarmJobByDedupe(dedupeKey: string): Promise<AlarmDispatchJobEntity | null> {
  return withTransaction("alarm_dispatch_jobs", "readonly", async (transaction) => {
    const store = transaction.objectStore("alarm_dispatch_jobs");
    const index = store.index("by_dedupe");
    const row = await requestToPromise(index.get(dedupeKey));
    return normalizeAlarmJob(row);
  });
}

export async function upsertAlarmJob(entity: AlarmDispatchJobEntity): Promise<void> {
  await withTransaction("alarm_dispatch_jobs", "readwrite", async (transaction) => {
    const store = transaction.objectStore("alarm_dispatch_jobs");
    await requestToPromise(store.put(entity));
  });
}

export async function listAlarmJobsBySession(sessionId: string): Promise<AlarmDispatchJobEntity[]> {
  return withTransaction("alarm_dispatch_jobs", "readonly", async (transaction) => {
    const store = transaction.objectStore("alarm_dispatch_jobs");
    const index = store.index("by_session");
    const rows = await requestToPromise(index.getAll(sessionId));
    return rows
      .map((row) => normalizeAlarmJob(row))
      .filter((row): row is AlarmDispatchJobEntity => row !== null)
      .sort((a, b) => a.createdAtIso.localeCompare(b.createdAtIso));
  });
}

export async function listAlarmJobsBySessionStep(sessionId: string, stepId: string): Promise<AlarmDispatchJobEntity[]> {
  return withTransaction("alarm_dispatch_jobs", "readonly", async (transaction) => {
    const store = transaction.objectStore("alarm_dispatch_jobs");
    const index = store.index("by_session_step");
    const rows = await requestToPromise(index.getAll(IDBKeyRange.only([sessionId, stepId])));
    return rows
      .map((row) => normalizeAlarmJob(row))
      .filter((row): row is AlarmDispatchJobEntity => row !== null)
      .sort((a, b) => b.updatedAtIso.localeCompare(a.updatedAtIso));
  });
}

export async function getAlarmJob(jobId: string): Promise<AlarmDispatchJobEntity | null> {
  return withTransaction("alarm_dispatch_jobs", "readonly", async (transaction) => {
    const store = transaction.objectStore("alarm_dispatch_jobs");
    const row = await requestToPromise(store.get(jobId));
    return normalizeAlarmJob(row);
  });
}
