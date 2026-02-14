import { requestToPromise, withTransaction } from "@/lib/storage/capd-db";
import { patchTodaySlotStatus } from "@/lib/storage/daily-plan.repo";
import {
  findAlarmJobByDedupe,
  getAlarmJob,
  listAlarmJobsBySession,
  listAlarmJobsBySessionStep,
  upsertAlarmJob
} from "@/lib/storage/alarm-job.repo";
import { getProtocolAsset, getProtocolPackage } from "@/lib/storage/protocol.repo";
import { hasRecordForStep, listRecordsBySession, upsertRecord } from "@/lib/storage/record.repo";
import { getSession, upsertSession } from "@/lib/storage/session.repo";
import { getSessionSnapshot } from "@/lib/storage/snapshot.repo";
import { addTimerEventIfAbsent, listTimerEventsBySession } from "@/lib/storage/timer-event.repo";
import type {
  AlarmDispatchJobEntity,
  ActiveSessionCache,
  RecordEntity,
  SessionEntity,
  SessionProtocolSnapshot,
  SessionSnapshotStep,
  TimerEventEntity
} from "@/lib/storage/models";
import { addMinutesIso, nowIso, toDateLocalJst } from "@/lib/storage/time";

function hashString(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return `h_${Math.abs(hash)}`;
}

function normalizeAlarmTrigger(input: string): "timer_end" | "step_enter" | "" {
  const value = input.trim().toLowerCase();
  if (value === "step_enter") {
    return "step_enter";
  }
  if (value === "timer_end") {
    return "timer_end";
  }
  return "";
}

function normalizeTimerSegment(input: string): "dwell" | "drain" | "" {
  const value = input.trim().toLowerCase();
  if (value === "dwell" || value === "drain") {
    return value;
  }
  return "";
}

function normalizeTimerEvent(input: string): "start" | "end" | "" {
  const value = input.trim().toLowerCase();
  if (value === "start" || value === "end") {
    return value;
  }
  return "";
}

function toSnapshotStep(step: {
  sequenceNo: number;
  stepId: string;
  nextStepId: string | null;
  phase: string;
  state: string;
  title: string;
  image: string;
  displayText: string;
  warningText: string;
  requiredChecks: string[];
  timerId: string;
  timerEvent: string;
  timerExchangeNo: string;
  timerSegment: string;
  alarmId: string;
  alarmTrigger: string;
  alarmDurationMin: number | null;
  alarmRelatedTimerId: string;
  recordEvent: string;
  recordExchangeNo: string;
  recordUnit: string;
}): SessionSnapshotStep {
  const timerEvent = normalizeTimerEvent(step.timerEvent);
  const timerSegment = normalizeTimerSegment(step.timerSegment);
  const timerSpec = step.timerId && timerEvent
    ? {
        timerId: step.timerId,
        timerEvent,
        timerExchangeNo: step.timerExchangeNo,
        timerSegment
      }
    : null;

  const alarmTrigger = normalizeAlarmTrigger(step.alarmTrigger);
  const alarmSpec = step.alarmId
    ? {
        alarmId: step.alarmId,
        alarmTrigger,
        alarmDurationMin: step.alarmDurationMin,
        alarmRelatedTimerId: step.alarmRelatedTimerId
      }
    : null;

  const recordSpec = step.recordEvent
    ? {
        recordEvent: step.recordEvent,
        recordExchangeNo: step.recordExchangeNo,
        recordUnit: step.recordUnit
      }
    : null;

  return {
    sequenceNo: step.sequenceNo,
    stepId: step.stepId,
    nextStepId: step.nextStepId,
    phase: step.phase,
    state: step.state,
    title: step.title,
    image: step.image,
    displayText: step.displayText,
    warningText: step.warningText,
    requiredChecks: step.requiredChecks,
    timerSpec,
    alarmSpec,
    recordSpec
  };
}

function createSnapshotHash(snapshot: SessionProtocolSnapshot): string {
  return hashString(JSON.stringify(snapshot.steps));
}

function createSessionId(slotIndex: number): string {
  return `ses_${slotIndex + 1}_${Date.now()}`;
}

function createAlarmJob(input: {
  dedupeKey: string;
  sessionId: string;
  dateLocal: string;
  stepId: string;
  alarmId: string;
  alarmTrigger: "timer_end" | "step_enter" | "";
  alarmDurationMin: number | null;
  alarmRelatedTimerId: string;
  dueAtIso: string;
}): AlarmDispatchJobEntity {
  const now = nowIso();
  return {
    jobId: `alarm_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    dedupeKey: input.dedupeKey,
    sessionId: input.sessionId,
    dateLocal: input.dateLocal,
    stepId: input.stepId,
    alarmId: input.alarmId,
    alarmTrigger: input.alarmTrigger,
    alarmDurationMin: input.alarmDurationMin,
    alarmRelatedTimerId: input.alarmRelatedTimerId,
    dueAtIso: input.dueAtIso,
    status: "pending",
    attemptNo: 1,
    createdAtIso: now,
    updatedAtIso: now,
    ackedAtIso: null
  };
}

export async function startSessionFromSlot(input: { slotIndex: number; protocolId: string }): Promise<ActiveSessionCache> {
  const protocolPackage = await getProtocolPackage(input.protocolId);
  if (!protocolPackage) {
    throw new Error("選択されたテンプレートが見つかりません。CSVを再取り込みしてください。");
  }
  if (!protocolPackage.steps.length) {
    throw new Error("テンプレートに手順がありません。CSVを再取り込みしてください。");
  }

  const sessionId = createSessionId(input.slotIndex);
  const createdAtIso = nowIso();
  const steps = protocolPackage.steps.map((step) => toSnapshotStep(step));
  const provisionalSnapshot: SessionProtocolSnapshot = {
    sessionId,
    sourceProtocol: {
      protocolId: protocolPackage.protocolId,
      protocolName: protocolPackage.protocolName,
      importedAt: protocolPackage.importedAt
    },
    steps,
    assetManifest: steps
      .filter((step) => Boolean(step.image))
      .map((step) => ({
        assetKey: step.image,
        sourceRelativePath: step.image
      })),
    snapshotHash: "",
    createdAtIso
  };
  provisionalSnapshot.snapshotHash = createSnapshotHash(provisionalSnapshot);

  const sessionEntity: SessionEntity = {
    sessionId,
    slotIndex: input.slotIndex,
    dateLocal: toDateLocalJst(createdAtIso),
    protocolId: protocolPackage.protocolId,
    snapshotHash: provisionalSnapshot.snapshotHash,
    currentStepId: steps[0]?.stepId ?? "",
    status: "active",
    startedAtIso: createdAtIso,
    completedAtIso: null,
    abortedAtIso: null,
    updatedAtIso: createdAtIso
  };

  await withTransaction(["sessions", "session_protocol_snapshots"], "readwrite", async (transaction) => {
    const sessionStore = transaction.objectStore("sessions");
    const snapshotStore = transaction.objectStore("session_protocol_snapshots");
    await requestToPromise(sessionStore.put(sessionEntity));
    await requestToPromise(snapshotStore.put(provisionalSnapshot));
  });

  await patchTodaySlotStatus(input.slotIndex, "実施中");

  return {
    sessionId,
    slotIndex: input.slotIndex,
    currentStepId: sessionEntity.currentStepId,
    protocolId: protocolPackage.protocolId,
    snapshotHash: provisionalSnapshot.snapshotHash,
    mode: "runtime",
    updatedAtIso: nowIso()
  };
}

export async function loadSessionRuntime(sessionId: string): Promise<{
  session: SessionEntity;
  snapshot: SessionProtocolSnapshot;
  records: RecordEntity[];
  timerEvents: TimerEventEntity[];
  alarms: AlarmDispatchJobEntity[];
}> {
  const [session, snapshot, records, timerEvents, alarms] = await Promise.all([
    getSession(sessionId),
    getSessionSnapshot(sessionId),
    listRecordsBySession(sessionId),
    listTimerEventsBySession(sessionId),
    listAlarmJobsBySession(sessionId)
  ]);

  if (!session || !snapshot) {
    throw new Error("セッションのスナップショットが見つかりません。CSVを再取り込み後に再開してください。");
  }

  if (session.snapshotHash !== snapshot.snapshotHash) {
    throw new Error("スナップショット整合性エラーが発生しました。");
  }

  return {
    session,
    snapshot,
    records,
    timerEvents,
    alarms
  };
}

export async function resolveSessionStepImage(protocolId: string, assetKey: string): Promise<Blob | null> {
  const normalizedProtocolId = protocolId.trim();
  const normalizedAssetKey = assetKey.trim();
  if (!normalizedProtocolId || !normalizedAssetKey) {
    return null;
  }

  const asset = await getProtocolAsset(normalizedProtocolId, normalizedAssetKey);
  return asset?.blob ?? null;
}

export async function isRecordSavedForStep(sessionId: string, stepId: string): Promise<boolean> {
  return hasRecordForStep(sessionId, stepId);
}

export async function saveRecordForStep(input: {
  sessionId: string;
  stepId: string;
  recordEvent: string;
  recordExchangeNo: string;
  recordUnit: string;
  payload: Record<string, unknown>;
}): Promise<void> {
  const session = await getSession(input.sessionId);
  if (!session) {
    throw new Error("セッションが見つかりません。");
  }

  const now = nowIso();
  const recordId = `rec_${input.sessionId}_${input.stepId}_${input.recordEvent}`;
  await upsertRecord({
    recordId,
    sessionId: input.sessionId,
    dateLocal: session.dateLocal,
    stepId: input.stepId,
    recordEvent: input.recordEvent,
    recordExchangeNo: input.recordExchangeNo,
    recordUnit: input.recordUnit,
    payload: input.payload,
    createdAtIso: now,
    updatedAtIso: now
  });
}

async function createTimerEventAndTimerEndAlarm(input: {
  session: SessionEntity;
  step: SessionSnapshotStep;
  occurredAtIso: string;
}): Promise<void> {
  const timerSpec = input.step.timerSpec;
  if (!timerSpec) {
    return;
  }

  const dedupeKey = `timer:${input.session.sessionId}:${input.step.stepId}:${timerSpec.timerId}:${timerSpec.timerEvent}`;
  const timerEvent: TimerEventEntity = {
    eventId: `te_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    dedupeKey,
    sessionId: input.session.sessionId,
    dateLocal: input.session.dateLocal,
    stepId: input.step.stepId,
    timerId: timerSpec.timerId,
    timerEvent: timerSpec.timerEvent,
    timerExchangeNo: timerSpec.timerExchangeNo,
    timerSegment: timerSpec.timerSegment,
    occurredAtIso: input.occurredAtIso
  };

  const { inserted } = await addTimerEventIfAbsent(timerEvent);
  if (!inserted) {
    return;
  }

  const alarmSpec = input.step.alarmSpec;
  if (!alarmSpec || timerSpec.timerEvent !== "end") {
    return;
  }

  const trigger = alarmSpec.alarmTrigger || "timer_end";
  if (trigger !== "timer_end") {
    return;
  }

  const alarmDedupe = `alarm:timer_end:${input.session.sessionId}:${input.step.stepId}:${alarmSpec.alarmId}`;
  const existing = await findAlarmJobByDedupe(alarmDedupe);
  if (existing) {
    return;
  }

  const duration = alarmSpec.alarmDurationMin ?? 0;
  await upsertAlarmJob(
    createAlarmJob({
      dedupeKey: alarmDedupe,
      sessionId: input.session.sessionId,
      dateLocal: input.session.dateLocal,
      stepId: input.step.stepId,
      alarmId: alarmSpec.alarmId,
      alarmTrigger: "timer_end",
      alarmDurationMin: alarmSpec.alarmDurationMin,
      alarmRelatedTimerId: alarmSpec.alarmRelatedTimerId,
      dueAtIso: addMinutesIso(input.occurredAtIso, duration)
    })
  );
}

export async function ensureStepEnterAlarm(input: { sessionId: string; stepId: string }): Promise<AlarmDispatchJobEntity | null> {
  const runtime = await loadSessionRuntime(input.sessionId);
  const step = runtime.snapshot.steps.find((item) => item.stepId === input.stepId);
  if (!step?.alarmSpec) {
    return null;
  }

  const trigger = step.alarmSpec.alarmTrigger;
  if (trigger !== "step_enter") {
    return null;
  }

  const dedupeKey = `alarm:step_enter:${input.sessionId}:${input.stepId}:${step.alarmSpec.alarmId}`;
  const existing = await findAlarmJobByDedupe(dedupeKey);
  if (existing) {
    return existing;
  }

  const now = nowIso();
  const job = createAlarmJob({
    dedupeKey,
    sessionId: input.sessionId,
    dateLocal: runtime.session.dateLocal,
    stepId: input.stepId,
    alarmId: step.alarmSpec.alarmId,
    alarmTrigger: "step_enter",
    alarmDurationMin: step.alarmSpec.alarmDurationMin,
    alarmRelatedTimerId: step.alarmSpec.alarmRelatedTimerId,
    dueAtIso: addMinutesIso(now, step.alarmSpec.alarmDurationMin ?? 0)
  });

  await upsertAlarmJob(job);
  return job;
}

export async function advanceStep(input: { sessionId: string; stepId: string }): Promise<SessionEntity> {
  const runtime = await loadSessionRuntime(input.sessionId);
  if (runtime.session.status !== "active") {
    return runtime.session;
  }

  const currentStep = runtime.snapshot.steps.find((item) => item.stepId === input.stepId);
  if (!currentStep) {
    throw new Error("ステップが見つかりません。");
  }

  if (runtime.session.currentStepId !== input.stepId) {
    return runtime.session;
  }

  const now = nowIso();
  await createTimerEventAndTimerEndAlarm({
    session: runtime.session,
    step: currentStep,
    occurredAtIso: now
  });

  if (!currentStep.nextStepId) {
    return runtime.session;
  }

  const updated: SessionEntity = {
    ...runtime.session,
    currentStepId: currentStep.nextStepId,
    updatedAtIso: now
  };
  await upsertSession(updated);
  return updated;
}

export async function completeSession(sessionId: string): Promise<void> {
  const session = await getSession(sessionId);
  if (!session || session.status !== "active") {
    return;
  }

  const now = nowIso();
  await upsertSession({
    ...session,
    status: "completed",
    completedAtIso: now,
    updatedAtIso: now
  });
  await patchTodaySlotStatus(session.slotIndex, "実施済み");
}

export async function abortSession(sessionId: string): Promise<void> {
  const session = await getSession(sessionId);
  if (!session || session.status !== "active") {
    return;
  }

  const now = nowIso();
  await upsertSession({
    ...session,
    status: "aborted",
    abortedAtIso: now,
    updatedAtIso: now
  });
  await patchTodaySlotStatus(session.slotIndex, "未実施");
}

export async function acknowledgeAlarm(jobId: string): Promise<AlarmDispatchJobEntity | null> {
  const target = await getAlarmJob(jobId);
  if (!target) {
    return null;
  }

  if (target.status === "acknowledged") {
    return target;
  }

  const now = nowIso();
  const next: AlarmDispatchJobEntity = {
    ...target,
    status: "acknowledged",
    ackedAtIso: now,
    updatedAtIso: now
  };

  await upsertAlarmJob(next);
  return next;
}

export async function markAlarmMissed(jobId: string): Promise<AlarmDispatchJobEntity | null> {
  const target = await getAlarmJob(jobId);
  if (!target || target.status !== "notified") {
    return target;
  }

  const next: AlarmDispatchJobEntity = {
    ...target,
    status: "missed",
    updatedAtIso: nowIso()
  };
  await upsertAlarmJob(next);
  return next;
}

export async function markAlarmNotified(jobId: string, attemptNo: number): Promise<AlarmDispatchJobEntity | null> {
  const target = await getAlarmJob(jobId);
  if (!target || target.status === "acknowledged") {
    return target;
  }

  const next: AlarmDispatchJobEntity = {
    ...target,
    status: target.status === "missed" ? "missed" : "notified",
    attemptNo,
    updatedAtIso: nowIso()
  };

  await upsertAlarmJob(next);
  return next;
}

export async function getLatestAlarmForStep(sessionId: string, stepId: string): Promise<AlarmDispatchJobEntity | null> {
  const rows = await listAlarmJobsBySessionStep(sessionId, stepId);
  return rows[0] ?? null;
}
