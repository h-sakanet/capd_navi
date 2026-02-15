import { beforeEach, describe, expect, it, vi } from "vitest";

  const mocks = vi.hoisted(() => ({
  requestToPromise: vi.fn(),
  withTransaction: vi.fn(),
  patchTodaySlotStatus: vi.fn(),
  findAlarmJobByDedupe: vi.fn(),
  getAlarmJob: vi.fn(),
  listAlarmJobsBySession: vi.fn(),
  listAlarmJobsBySessionStep: vi.fn(),
    upsertAlarmJob: vi.fn(),
    getProtocolPackage: vi.fn(),
    getProtocolAsset: vi.fn(),
  hasRecordForStep: vi.fn(),
  listRecordsBySession: vi.fn(),
  upsertRecord: vi.fn(),
  getSession: vi.fn(),
  upsertSession: vi.fn(),
  getSessionSnapshot: vi.fn(),
  addTimerEventIfAbsent: vi.fn(),
  listTimerEventsBySession: vi.fn()
}));

vi.mock("../../lib/storage/capd-db", () => ({
  requestToPromise: mocks.requestToPromise,
  withTransaction: mocks.withTransaction
}));

vi.mock("../../lib/storage/daily-plan.repo", () => ({
  patchTodaySlotStatus: mocks.patchTodaySlotStatus
}));

vi.mock("../../lib/storage/alarm-job.repo", () => ({
  findAlarmJobByDedupe: mocks.findAlarmJobByDedupe,
  getAlarmJob: mocks.getAlarmJob,
  listAlarmJobsBySession: mocks.listAlarmJobsBySession,
  listAlarmJobsBySessionStep: mocks.listAlarmJobsBySessionStep,
  upsertAlarmJob: mocks.upsertAlarmJob
}));

vi.mock("../../lib/storage/protocol.repo", () => ({
  getProtocolPackage: mocks.getProtocolPackage,
  getProtocolAsset: mocks.getProtocolAsset
}));

vi.mock("../../lib/storage/record.repo", () => ({
  hasRecordForStep: mocks.hasRecordForStep,
  listRecordsBySession: mocks.listRecordsBySession,
  upsertRecord: mocks.upsertRecord
}));

vi.mock("../../lib/storage/session.repo", () => ({
  getSession: mocks.getSession,
  upsertSession: mocks.upsertSession
}));

vi.mock("../../lib/storage/snapshot.repo", () => ({
  getSessionSnapshot: mocks.getSessionSnapshot
}));

vi.mock("../../lib/storage/timer-event.repo", () => ({
  addTimerEventIfAbsent: mocks.addTimerEventIfAbsent,
  listTimerEventsBySession: mocks.listTimerEventsBySession
}));

import {
  advanceStep,
  ensureStepEnterAlarm,
  resolveSessionStepImage,
  startSessionFromSlot
} from "../../lib/services/session-service";

const baseProtocolStep = {
  sequenceNo: 1,
  stepId: "step_001",
  nextStepId: "step_002",
  phase: "準備",
  state: "お腹-独立",
  title: "開始",
  image: "",
  displayText: "",
  warningText: "",
  requiredChecks: ["チェックA"],
  timerId: "timer_1",
  timerEvent: "end",
  timerExchangeNo: "1",
  timerSegment: "drain",
  alarmId: "alarm_1",
  alarmTrigger: "timer_end",
  alarmDurationMin: 5,
  alarmRelatedTimerId: "timer_1",
  recordEvent: "",
  recordExchangeNo: "",
  recordUnit: ""
};

function installSimpleTransactionMock(captures?: Record<string, unknown[]>): void {
  mocks.withTransaction.mockImplementation(async (_stores: unknown, _mode: unknown, runner: (tx: IDBTransaction) => Promise<unknown>) => {
    const tx = {
      objectStore: (storeName: string) => ({
        put: (value: unknown) => {
          if (captures) {
            captures[storeName] ??= [];
            captures[storeName].push(value);
          }
          return value as unknown as IDBRequest<unknown>;
        }
      })
    } as unknown as IDBTransaction;

    return runner(tx);
  });
  mocks.requestToPromise.mockImplementation(async (value: unknown) => value);
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-02-12T12:00:00+09:00"));

  vi.clearAllMocks();
  installSimpleTransactionMock();

  mocks.patchTodaySlotStatus.mockResolvedValue(undefined);
  mocks.getProtocolAsset.mockResolvedValue(null);
  mocks.listRecordsBySession.mockResolvedValue([]);
  mocks.listTimerEventsBySession.mockResolvedValue([]);
  mocks.listAlarmJobsBySession.mockResolvedValue([]);
  mocks.listAlarmJobsBySessionStep.mockResolvedValue([]);
  mocks.upsertSession.mockResolvedValue(undefined);
  mocks.upsertAlarmJob.mockResolvedValue(undefined);
  mocks.findAlarmJobByDedupe.mockResolvedValue(null);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("session-service", () => {
  it("UT-SESSION-001: テンプレート未登録時は開始失敗する", async () => {
    mocks.getProtocolPackage.mockResolvedValue(null);

    await expect(startSessionFromSlot({ slotIndex: 0, protocolId: "missing" })).rejects.toThrow(
      "選択されたテンプレートが見つかりません。CSVを再取り込みしてください。"
    );
  });

  it("UT-SESSION-002: 開始時に session/snapshot を同一処理で保存する", async () => {
    const captures: Record<string, unknown[]> = {};
    installSimpleTransactionMock(captures);

    mocks.getProtocolPackage.mockResolvedValue({
      protocolId: "protocol-A",
      protocolName: "protocol-A",
      importedAt: "2026-02-12T10:00:00+09:00",
      stepCount: 1,
      steps: [{ ...baseProtocolStep, nextStepId: null }]
    });

    const active = await startSessionFromSlot({ slotIndex: 1, protocolId: "protocol-A" });

    expect(captures.sessions).toHaveLength(1);
    expect(captures.session_protocol_snapshots).toHaveLength(1);
    expect(mocks.patchTodaySlotStatus).toHaveBeenCalledWith(1, "実施中");
    expect(active.protocolId).toBe("protocol-A");
    expect(active.mode).toBe("runtime");
    expect(active.snapshotHash).not.toBe("");
  });

  it("UT-SESSION-003: protocolId + assetKey で画像Blobを取得できる", async () => {
    const blob = new Blob(["<svg></svg>"], { type: "image/svg+xml" });
    mocks.getProtocolAsset.mockResolvedValue({
      photoId: "protasset::protocol-A::img-1.svg",
      protocolId: "protocol-A",
      assetKey: "img-1.svg",
      mimeType: "image/svg+xml",
      sizeBytes: blob.size,
      blob,
      importedAt: "2026-02-12T10:00:00+09:00",
      sourceFileName: "img-1.svg"
    });

    const resolved = await resolveSessionStepImage("protocol-A", "img-1.svg");

    expect(mocks.getProtocolAsset).toHaveBeenCalledWith("protocol-A", "img-1.svg");
    expect(resolved).toBe(blob);
  });

  it("UT-TIMER-001: ACT-001成功時に timer_event と timer_end アラームを生成する", async () => {
    mocks.getSession.mockResolvedValue({
      sessionId: "ses_1",
      slotIndex: 0,
      dateLocal: "2026-02-12",
      protocolId: "protocol-A",
      snapshotHash: "h_1",
      currentStepId: "step_001",
      status: "active",
      startedAtIso: "2026-02-12T09:00:00+09:00",
      completedAtIso: null,
      abortedAtIso: null,
      updatedAtIso: "2026-02-12T09:00:00+09:00"
    });

    mocks.getSessionSnapshot.mockResolvedValue({
      sessionId: "ses_1",
      sourceProtocol: {
        protocolId: "protocol-A",
        protocolName: "protocol-A",
        importedAt: "2026-02-12T08:30:00+09:00"
      },
      steps: [
        {
          sequenceNo: 1,
          stepId: "step_001",
          nextStepId: "step_002",
          phase: "準備",
          state: "お腹-独立",
          title: "開始",
          image: "",
          displayText: "",
          warningText: "",
          requiredChecks: [],
          timerSpec: {
            timerId: "timer_1",
            timerEvent: "end",
            timerExchangeNo: "1",
            timerSegment: "drain"
          },
          alarmSpec: {
            alarmId: "alarm_1",
            alarmTrigger: "timer_end",
            alarmDurationMin: 5,
            alarmRelatedTimerId: "timer_1"
          },
          recordSpec: null
        },
        {
          sequenceNo: 2,
          stepId: "step_002",
          nextStepId: null,
          phase: "終了",
          state: "お腹-独立",
          title: "終了",
          image: "",
          displayText: "",
          warningText: "",
          requiredChecks: [],
          timerSpec: null,
          alarmSpec: null,
          recordSpec: null
        }
      ],
      assetManifest: [],
      snapshotHash: "h_1",
      createdAtIso: "2026-02-12T09:00:00+09:00"
    });

    mocks.addTimerEventIfAbsent.mockResolvedValue({
      inserted: true,
      row: {}
    });

    const updated = await advanceStep({ sessionId: "ses_1", stepId: "step_001" });

    expect(mocks.addTimerEventIfAbsent).toHaveBeenCalledTimes(1);
    expect(mocks.upsertAlarmJob).toHaveBeenCalledTimes(1);
    expect(mocks.upsertSession).toHaveBeenCalledTimes(1);
    expect(updated.currentStepId).toBe("step_002");
  });

  it("UT-TIMER-002: timer_event 重複時は timer_end アラームを再生成しない", async () => {
    mocks.getSession.mockResolvedValue({
      sessionId: "ses_1",
      slotIndex: 0,
      dateLocal: "2026-02-12",
      protocolId: "protocol-A",
      snapshotHash: "h_1",
      currentStepId: "step_001",
      status: "active",
      startedAtIso: "2026-02-12T09:00:00+09:00",
      completedAtIso: null,
      abortedAtIso: null,
      updatedAtIso: "2026-02-12T09:00:00+09:00"
    });

    mocks.getSessionSnapshot.mockResolvedValue({
      sessionId: "ses_1",
      sourceProtocol: {
        protocolId: "protocol-A",
        protocolName: "protocol-A",
        importedAt: "2026-02-12T08:30:00+09:00"
      },
      steps: [
        {
          sequenceNo: 1,
          stepId: "step_001",
          nextStepId: "step_002",
          phase: "準備",
          state: "お腹-独立",
          title: "開始",
          image: "",
          displayText: "",
          warningText: "",
          requiredChecks: [],
          timerSpec: {
            timerId: "timer_1",
            timerEvent: "end",
            timerExchangeNo: "1",
            timerSegment: "drain"
          },
          alarmSpec: {
            alarmId: "alarm_1",
            alarmTrigger: "timer_end",
            alarmDurationMin: 5,
            alarmRelatedTimerId: "timer_1"
          },
          recordSpec: null
        },
        {
          sequenceNo: 2,
          stepId: "step_002",
          nextStepId: null,
          phase: "終了",
          state: "お腹-独立",
          title: "終了",
          image: "",
          displayText: "",
          warningText: "",
          requiredChecks: [],
          timerSpec: null,
          alarmSpec: null,
          recordSpec: null
        }
      ],
      assetManifest: [],
      snapshotHash: "h_1",
      createdAtIso: "2026-02-12T09:00:00+09:00"
    });

    mocks.addTimerEventIfAbsent.mockResolvedValue({
      inserted: false,
      row: {}
    });

    await advanceStep({ sessionId: "ses_1", stepId: "step_001" });

    expect(mocks.addTimerEventIfAbsent).toHaveBeenCalledTimes(1);
    expect(mocks.upsertAlarmJob).not.toHaveBeenCalled();
  });

  it("UT-ALARM-001: step_enter アラームを初回表示時に生成する", async () => {
    mocks.getSession.mockResolvedValue({
      sessionId: "ses_1",
      slotIndex: 0,
      dateLocal: "2026-02-12",
      protocolId: "protocol-A",
      snapshotHash: "h_1",
      currentStepId: "step_010",
      status: "active",
      startedAtIso: "2026-02-12T09:00:00+09:00",
      completedAtIso: null,
      abortedAtIso: null,
      updatedAtIso: "2026-02-12T09:00:00+09:00"
    });

    mocks.getSessionSnapshot.mockResolvedValue({
      sessionId: "ses_1",
      sourceProtocol: {
        protocolId: "protocol-A",
        protocolName: "protocol-A",
        importedAt: "2026-02-12T08:30:00+09:00"
      },
      steps: [
        {
          sequenceNo: 10,
          stepId: "step_010",
          nextStepId: null,
          phase: "廃液",
          state: "お腹→廃液バッグ",
          title: "廃液中",
          image: "",
          displayText: "",
          warningText: "",
          requiredChecks: [],
          timerSpec: null,
          alarmSpec: {
            alarmId: "alarm_enter",
            alarmTrigger: "step_enter",
            alarmDurationMin: 10,
            alarmRelatedTimerId: ""
          },
          recordSpec: null
        }
      ],
      assetManifest: [],
      snapshotHash: "h_1",
      createdAtIso: "2026-02-12T09:00:00+09:00"
    });

    mocks.findAlarmJobByDedupe.mockResolvedValue(null);

    const alarm = await ensureStepEnterAlarm({ sessionId: "ses_1", stepId: "step_010" });

    expect(alarm?.alarmTrigger).toBe("step_enter");
    expect(mocks.upsertAlarmJob).toHaveBeenCalledTimes(1);
  });

  it("UT-ALARM-002: step_enter アラームは dedupe により重複生成しない", async () => {
    mocks.getSession.mockResolvedValue({
      sessionId: "ses_1",
      slotIndex: 0,
      dateLocal: "2026-02-12",
      protocolId: "protocol-A",
      snapshotHash: "h_1",
      currentStepId: "step_010",
      status: "active",
      startedAtIso: "2026-02-12T09:00:00+09:00",
      completedAtIso: null,
      abortedAtIso: null,
      updatedAtIso: "2026-02-12T09:00:00+09:00"
    });

    mocks.getSessionSnapshot.mockResolvedValue({
      sessionId: "ses_1",
      sourceProtocol: {
        protocolId: "protocol-A",
        protocolName: "protocol-A",
        importedAt: "2026-02-12T08:30:00+09:00"
      },
      steps: [
        {
          sequenceNo: 10,
          stepId: "step_010",
          nextStepId: null,
          phase: "廃液",
          state: "お腹→廃液バッグ",
          title: "廃液中",
          image: "",
          displayText: "",
          warningText: "",
          requiredChecks: [],
          timerSpec: null,
          alarmSpec: {
            alarmId: "alarm_enter",
            alarmTrigger: "step_enter",
            alarmDurationMin: 10,
            alarmRelatedTimerId: ""
          },
          recordSpec: null
        }
      ],
      assetManifest: [],
      snapshotHash: "h_1",
      createdAtIso: "2026-02-12T09:00:00+09:00"
    });

    const existing = {
      jobId: "alarm_existing",
      dedupeKey: "alarm:step_enter:ses_1:step_010:alarm_enter",
      sessionId: "ses_1",
      dateLocal: "2026-02-12",
      stepId: "step_010",
      alarmId: "alarm_enter",
      alarmTrigger: "step_enter",
      alarmDurationMin: 10,
      alarmRelatedTimerId: "",
      dueAtIso: "2026-02-12T12:10:00+09:00",
      status: "pending",
      attemptNo: 1,
      createdAtIso: "2026-02-12T12:00:00+09:00",
      updatedAtIso: "2026-02-12T12:00:00+09:00",
      ackedAtIso: null
    };

    mocks.findAlarmJobByDedupe.mockResolvedValue(existing);

    const alarm = await ensureStepEnterAlarm({ sessionId: "ses_1", stepId: "step_010" });

    expect(alarm).toEqual(existing);
    expect(mocks.upsertAlarmJob).not.toHaveBeenCalled();
  });
});
