import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  listRecordsByDate: vi.fn(),
  listSessionsByDate: vi.fn(),
  getSessionSnapshot: vi.fn(),
  listTimerEventsByDate: vi.fn()
}));

vi.mock("../../lib/storage/record.repo", () => ({
  listRecordsByDate: mocks.listRecordsByDate
}));

vi.mock("../../lib/storage/session.repo", () => ({
  listSessionsByDate: mocks.listSessionsByDate
}));

vi.mock("../../lib/storage/snapshot.repo", () => ({
  getSessionSnapshot: mocks.getSessionSnapshot
}));

vi.mock("../../lib/storage/timer-event.repo", () => ({
  listTimerEventsByDate: mocks.listTimerEventsByDate
}));

import { readTodayHomeNote } from "../../lib/services/home-note-query";

describe("home-note-query", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.listRecordsByDate.mockResolvedValue([]);
    mocks.listSessionsByDate.mockResolvedValue([]);
    mocks.getSessionSnapshot.mockResolvedValue(null);
    mocks.listTimerEventsByDate.mockResolvedValue([]);
  });

  it("UT-HOME-001: completed セッションが無い日は null を返す", async () => {
    mocks.listSessionsByDate.mockResolvedValue([
      {
        sessionId: "ses_a",
        slotIndex: 0,
        dateLocal: "2026-02-12",
        protocolId: "protocol-A",
        snapshotHash: "h1",
        currentStepId: "step_001",
        status: "active",
        startedAtIso: "2026-02-12T10:00:00+09:00",
        completedAtIso: null,
        abortedAtIso: null,
        updatedAtIso: "2026-02-12T10:00:00+09:00"
      }
    ]);

    const note = await readTodayHomeNote("2026-02-12");
    expect(note).toBeNull();
  });

  it("UT-HOME-002: records + timer_events から当日ノートを生成する", async () => {
    mocks.listSessionsByDate.mockResolvedValue([
      {
        sessionId: "ses_completed",
        slotIndex: 0,
        dateLocal: "2026-02-12",
        protocolId: "protocol-A",
        snapshotHash: "h1",
        currentStepId: "step_026",
        status: "completed",
        startedAtIso: "2026-02-12T10:00:00+09:00",
        completedAtIso: "2026-02-12T12:00:00+09:00",
        abortedAtIso: null,
        updatedAtIso: "2026-02-12T12:00:00+09:00"
      }
    ]);

    mocks.getSessionSnapshot.mockResolvedValue({
      sessionId: "ses_completed",
      sourceProtocol: {
        protocolId: "protocol-A",
        protocolName: "protocol-A",
        importedAt: "2026-02-12T09:00:00+09:00"
      },
      steps: [],
      assetManifest: [],
      snapshotHash: "h1",
      createdAtIso: "2026-02-12T09:00:00+09:00"
    });

    mocks.listTimerEventsByDate.mockResolvedValue([
      {
        eventId: "te_1",
        dedupeKey: "k1",
        sessionId: "ses_completed",
        dateLocal: "2026-02-12",
        stepId: "step_021",
        timerId: "t1",
        timerEvent: "start",
        timerExchangeNo: "1",
        timerSegment: "dwell",
        occurredAtIso: "2026-02-12T01:10:00.000Z"
      },
      {
        eventId: "te_2",
        dedupeKey: "k2",
        sessionId: "ses_completed",
        dateLocal: "2026-02-12",
        stepId: "step_022",
        timerId: "t1",
        timerEvent: "end",
        timerExchangeNo: "1",
        timerSegment: "dwell",
        occurredAtIso: "2026-02-12T02:00:00.000Z"
      },
      {
        eventId: "te_3",
        dedupeKey: "k3",
        sessionId: "ses_completed",
        dateLocal: "2026-02-12",
        stepId: "step_023",
        timerId: "t2",
        timerEvent: "start",
        timerExchangeNo: "1",
        timerSegment: "drain",
        occurredAtIso: "2026-02-12T02:10:00.000Z"
      },
      {
        eventId: "te_4",
        dedupeKey: "k4",
        sessionId: "ses_completed",
        dateLocal: "2026-02-12",
        stepId: "step_024",
        timerId: "t2",
        timerEvent: "end",
        timerExchangeNo: "1",
        timerSegment: "drain",
        occurredAtIso: "2026-02-12T02:30:00.000Z"
      }
    ]);

    mocks.listRecordsByDate.mockResolvedValue([
      {
        recordId: "rec_1",
        sessionId: "ses_completed",
        dateLocal: "2026-02-12",
        stepId: "step_025",
        recordEvent: "drain_weight_g",
        recordExchangeNo: "1",
        recordUnit: "g",
        payload: { value: 2200 },
        createdAtIso: "2026-02-12T02:31:00.000Z",
        updatedAtIso: "2026-02-12T02:31:00.000Z"
      },
      {
        recordId: "rec_2",
        sessionId: "ses_completed",
        dateLocal: "2026-02-12",
        stepId: "step_026",
        recordEvent: "bag_weight_g",
        recordExchangeNo: "1",
        recordUnit: "g",
        payload: { value: 2000 },
        createdAtIso: "2026-02-12T02:32:00.000Z",
        updatedAtIso: "2026-02-12T02:32:00.000Z"
      },
      {
        recordId: "rec_3",
        sessionId: "ses_completed",
        dateLocal: "2026-02-12",
        stepId: "step_027",
        recordEvent: "drain_appearance",
        recordExchangeNo: "1",
        recordUnit: "",
        payload: { drainAppearance: "透明" },
        createdAtIso: "2026-02-12T02:33:00.000Z",
        updatedAtIso: "2026-02-12T02:33:00.000Z"
      },
      {
        recordId: "rec_4",
        sessionId: "ses_completed",
        dateLocal: "2026-02-12",
        stepId: "step_028",
        recordEvent: "session_summary",
        recordExchangeNo: "",
        recordUnit: "",
        payload: {
          bodyWeightKg: 58.4,
          urineMl: 650,
          fluidIntakeMl: 1200,
          stoolCountPerDay: 1,
          bpSys: 118,
          bpDia: 72,
          exitSiteStatuses: ["正常"],
          note: "問題なし"
        },
        createdAtIso: "2026-02-12T02:34:00.000Z",
        updatedAtIso: "2026-02-12T02:34:00.000Z"
      }
    ]);

    const note = await readTodayHomeNote("2026-02-12");

    expect(note).not.toBeNull();
    expect(note?.protocolName).toBe("protocol-A");
    expect(note?.exchanges[0]?.dwellStart).toBe("10:10");
    expect(note?.exchanges[0]?.dwellEnd).toBe("11:00");
    expect(note?.exchanges[0]?.drainStart).toBe("11:10");
    expect(note?.exchanges[0]?.drainEnd).toBe("11:30");
    expect(note?.exchanges[0]?.drainWeightG).toBe(2200);
    expect(note?.exchanges[0]?.bagWeightG).toBe(2000);
    expect(note?.exchanges[0]?.drainAppearance).toBe("透明");
    expect(note?.summary.bodyWeightKg).toBe(58.4);
    expect(note?.summary.bpSys).toBe(118);
    expect(note?.summary.exitSiteStatus).toBe("正常");
    expect(note?.summary.notes).toBe("問題なし");
  });
});
