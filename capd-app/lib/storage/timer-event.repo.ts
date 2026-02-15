import { requestToPromise, withTransaction } from "@/lib/storage/capd-db";
import type { TimerEventEntity } from "@/lib/storage/models";

function normalizeTimerEvent(value: unknown): TimerEventEntity | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const entity = value as Partial<TimerEventEntity>;
  if (
    typeof entity.eventId !== "string" ||
    typeof entity.dedupeKey !== "string" ||
    typeof entity.sessionId !== "string" ||
    typeof entity.dateLocal !== "string" ||
    typeof entity.stepId !== "string" ||
    typeof entity.timerId !== "string" ||
    (entity.timerEvent !== "start" && entity.timerEvent !== "end") ||
    typeof entity.timerExchangeNo !== "string" ||
    (entity.timerSegment !== "" && entity.timerSegment !== "dwell" && entity.timerSegment !== "drain") ||
    typeof entity.occurredAtIso !== "string"
  ) {
    return null;
  }

  return {
    eventId: entity.eventId,
    dedupeKey: entity.dedupeKey,
    sessionId: entity.sessionId,
    dateLocal: entity.dateLocal,
    stepId: entity.stepId,
    timerId: entity.timerId,
    timerEvent: entity.timerEvent,
    timerExchangeNo: entity.timerExchangeNo,
    timerSegment: entity.timerSegment,
    occurredAtIso: entity.occurredAtIso
  };
}

export async function findTimerEventByDedupe(dedupeKey: string): Promise<TimerEventEntity | null> {
  return withTransaction("timer_events", "readonly", async (transaction) => {
    const store = transaction.objectStore("timer_events");
    const index = store.index("by_dedupe");
    const row = await requestToPromise(index.get(dedupeKey));
    return normalizeTimerEvent(row);
  });
}

export async function addTimerEventIfAbsent(entity: TimerEventEntity): Promise<{ inserted: boolean; row: TimerEventEntity }> {
  const existing = await findTimerEventByDedupe(entity.dedupeKey);
  if (existing) {
    return { inserted: false, row: existing };
  }

  await withTransaction("timer_events", "readwrite", async (transaction) => {
    const store = transaction.objectStore("timer_events");
    await requestToPromise(store.put(entity));
  });

  return { inserted: true, row: entity };
}

export async function listTimerEventsBySession(sessionId: string): Promise<TimerEventEntity[]> {
  return withTransaction("timer_events", "readonly", async (transaction) => {
    const store = transaction.objectStore("timer_events");
    const index = store.index("by_session");
    const rows = await requestToPromise(index.getAll(sessionId));
    return rows
      .map((row) => normalizeTimerEvent(row))
      .filter((row): row is TimerEventEntity => row !== null)
      .sort((a, b) => a.occurredAtIso.localeCompare(b.occurredAtIso));
  });
}

export async function listTimerEventsByDate(dateLocal: string): Promise<TimerEventEntity[]> {
  return withTransaction("timer_events", "readonly", async (transaction) => {
    const store = transaction.objectStore("timer_events");
    const index = store.index("by_date");
    const rows = await requestToPromise(index.getAll(dateLocal));
    return rows
      .map((row) => normalizeTimerEvent(row))
      .filter((row): row is TimerEventEntity => row !== null)
      .sort((a, b) => a.occurredAtIso.localeCompare(b.occurredAtIso));
  });
}
