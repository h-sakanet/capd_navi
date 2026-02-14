import { listRecordsByDate } from "@/lib/storage/record.repo";
import { listSessionsByDate } from "@/lib/storage/session.repo";
import { getSessionSnapshot } from "@/lib/storage/snapshot.repo";
import { listTimerEventsByDate } from "@/lib/storage/timer-event.repo";
import type { HomeExchangeNote, HomeNoteEntity, HomeNoteSummary } from "@/lib/storage/models";
import { toDateLocalJst } from "@/lib/storage/time";

export function createEmptyExchange(exchangeNo: number): HomeExchangeNote {
  return {
    exchangeNo,
    csvTitle: "",
    dwellStart: "",
    dwellEnd: "",
    drainStart: "",
    drainEnd: "",
    drainWeightG: null,
    bagWeightG: null,
    drainAppearance: ""
  };
}

export function createEmptyHomeNote(dateLocal: string): HomeNoteEntity {
  const exchanges: HomeExchangeNote[] = [];
  for (let i = 1; i <= 5; i++) {
    exchanges.push(createEmptyExchange(i));
  }
  return {
    dateLocal,
    protocolName: "",
    exchanges,
    summary: {
      bodyWeightKg: null,
      urineMl: null,
      fluidIntakeMl: null,
      stoolCountPerDay: null,
      bpSys: null,
      bpDia: null,
      exitSiteStatus: "",
      notes: ""
    }
  };
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    if (value.trim() === "") {
      return null;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export async function readTodayHomeNote(dateLocal: string = toDateLocalJst()): Promise<HomeNoteEntity | null> {
  const [sessions, records, timerEvents] = await Promise.all([
    listSessionsByDate(dateLocal),
    listRecordsByDate(dateLocal),
    listTimerEventsByDate(dateLocal)
  ]);

  const exchanges = new Map<number, HomeExchangeNote>();
  for (let no = 1; no <= 5; no += 1) {
    exchanges.set(no, createEmptyExchange(no));
  }

  let protocolName = "";
  const summary: HomeNoteSummary = {
    bodyWeightKg: null,
    urineMl: null,
    fluidIntakeMl: null,
    stoolCountPerDay: null,
    bpSys: null,
    bpDia: null,
    exitSiteStatus: "",
    notes: ""
  };

  const completedSessions = sessions.filter((session) => session.status === "completed");

  for (const session of completedSessions) {
    const snapshot = await getSessionSnapshot(session.sessionId);
    if (snapshot && !protocolName) {
      protocolName = snapshot.sourceProtocol.protocolName;
    }

    // Assign sessionId to exchanges (primarily from the first found session)
    // Subsequent processing might overwrite or add, but usually one session per day is primary
    for (const exchange of exchanges.values()) {
      if (!exchange.sessionId) exchange.sessionId = session.sessionId;
    }

    const scopedTimerEvents = timerEvents.filter((event) => event.sessionId === session.sessionId);
    for (const event of scopedTimerEvents) {
      const exchangeNo = Number(event.timerExchangeNo);
      if (!Number.isInteger(exchangeNo) || exchangeNo < 1 || exchangeNo > 5) {
        continue;
      }

      const exchange = exchanges.get(exchangeNo);
      if (!exchange) continue;

      const timeText = new Date(event.occurredAtIso).toLocaleTimeString("ja-JP", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Tokyo"
      });

      if (event.timerSegment === "dwell") {
        if (event.timerEvent === "start") exchange.dwellStart = timeText;
        if (event.timerEvent === "end") exchange.dwellEnd = timeText;
      }
      if (event.timerSegment === "drain") {
        if (event.timerEvent === "start") exchange.drainStart = timeText;
        if (event.timerEvent === "end") exchange.drainEnd = timeText;
      }
    }
  }

  // Process ALL records for the day.
  // Sort so that manual edits (stepId === "manual_edit") always come LAST,
  // ensuring they override any original session records regardless of createdAtIso.
  const sortedRecords = [...records].sort((a, b) => {
    const aIsManual = a.stepId === "manual_edit" ? 1 : 0;
    const bIsManual = b.stepId === "manual_edit" ? 1 : 0;
    if (aIsManual !== bIsManual) return aIsManual - bIsManual;
    return a.createdAtIso.localeCompare(b.createdAtIso);
  });

  for (const record of sortedRecords) {
    const exchangeNo = Number(record.recordExchangeNo);
    if (Number.isInteger(exchangeNo) && exchangeNo >= 1 && exchangeNo <= 5) {
      const exchange = exchanges.get(exchangeNo);
      if (!exchange) continue;

      // If exchange doesn't have a sessionId yet, take it from the manual record
      if (!exchange.sessionId) exchange.sessionId = record.sessionId;

      if (record.recordEvent === "drain_weight_g") {
        exchange.drainWeightG = toNumber(record.payload.value ?? record.payload.drainWeightG);
      }
      if (record.recordEvent === "bag_weight_g") {
        exchange.bagWeightG = toNumber(record.payload.value ?? record.payload.bagWeightG);
      }
      if (record.recordEvent === "drain_appearance") {
        const appearance = record.payload.drainAppearance;
        if (typeof appearance === "string") exchange.drainAppearance = appearance;
      }
      // Manual overrides
      if (record.recordEvent === "manual_dwell_start" && typeof record.payload.value === "string") exchange.dwellStart = record.payload.value;
      if (record.recordEvent === "manual_dwell_end" && typeof record.payload.value === "string") exchange.dwellEnd = record.payload.value;
      if (record.recordEvent === "manual_drain_start" && typeof record.payload.value === "string") exchange.drainStart = record.payload.value;
      if (record.recordEvent === "manual_drain_end" && typeof record.payload.value === "string") exchange.drainEnd = record.payload.value;
      if (record.recordEvent === "manual_conc_title" && typeof record.payload.value === "string") exchange.csvTitle = record.payload.value;
    }

    if (record.recordEvent === "session_summary") {
      summary.bodyWeightKg = toNumber(record.payload.bodyWeightKg);
      summary.urineMl = toNumber(record.payload.urineMl);
      summary.fluidIntakeMl = toNumber(record.payload.fluidIntakeMl);
      summary.stoolCountPerDay = toNumber(record.payload.stoolCountPerDay);
      summary.bpSys = toNumber(record.payload.bpSys);
      summary.bpDia = toNumber(record.payload.bpDia);
      if (Array.isArray(record.payload.exitSiteStatuses)) {
        summary.exitSiteStatus = (record.payload.exitSiteStatuses as string[]).join(", ");
      }
      if (typeof record.payload.note === "string") summary.notes = record.payload.note;
    }
  }

  // If there's no session and no records/timers, return null to keep the history list clean
  const hasData = completedSessions.length > 0 || records.length > 0 || timerEvents.length > 0;
  if (!hasData) return null;

  return {
    dateLocal,
    protocolName,
    exchanges: Array.from(exchanges.values()).sort((a, b) => a.exchangeNo - b.exchangeNo),
    summary
  };
}

export async function readMonthlyHomeNotes(
  year: number,
  month: number
): Promise<Array<{ dateLocal: string; note: HomeNoteEntity | null }>> {
  // Construct dates for the month
  const startDate = new Date(year, month - 1, 1);
  const nextMonth = new Date(year, month, 1);
  const daysInMonth = (new Date(nextMonth.getTime() - 1)).getDate();

  const dates: string[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month - 1, d);
    const dateLocal = toDateLocalJst(date);
    dates.push(dateLocal);
  }

  const results = await Promise.all(
    dates.map(async (dateLocal) => {
      const note = await readTodayHomeNote(dateLocal);
      return { dateLocal, note };
    })
  );

  return results;
}
