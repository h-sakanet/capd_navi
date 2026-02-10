"use client";

export type ProcedureSlotStatus = "未実施" | "実施中" | "実施済み";

export type ProcedureSlot = {
  protocolId: string;
  protocolLabel: string;
  recommendedTime: string;
  status: ProcedureSlotStatus;
};

export type ActiveSession = {
  sessionId: string;
  slotIndex: number;
  currentStepId: string;
  updatedAtIso: string;
};

const SLOT_STORAGE_KEY = "capd-support:home:slots:v1";
const ACTIVE_SESSION_STORAGE_KEY = "capd-support:home:active-session:v1";

export const defaultProcedureSlots: Array<ProcedureSlot | null> = [null, null, null, null];

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function readProcedureSlots(): Array<ProcedureSlot | null> {
  if (!isBrowser()) {
    return [...defaultProcedureSlots];
  }

  try {
    const raw = window.localStorage.getItem(SLOT_STORAGE_KEY);
    if (!raw) {
      return [...defaultProcedureSlots];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length !== 4) {
      return [...defaultProcedureSlots];
    }

    return parsed.map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }
      if (
        typeof item.protocolId !== "string" ||
        typeof item.protocolLabel !== "string" ||
        typeof item.recommendedTime !== "string" ||
        (item.status !== "未実施" && item.status !== "実施中" && item.status !== "実施済み")
      ) {
        return null;
      }

      return {
        protocolId: item.protocolId,
        protocolLabel: item.protocolLabel,
        recommendedTime: item.recommendedTime,
        status: item.status
      } satisfies ProcedureSlot;
    });
  } catch {
    return [...defaultProcedureSlots];
  }
}

export function writeProcedureSlots(slots: Array<ProcedureSlot | null>): void {
  if (!isBrowser()) {
    return;
  }
  window.localStorage.setItem(SLOT_STORAGE_KEY, JSON.stringify(slots));
}

export function readActiveSession(): ActiveSession | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (
      !parsed ||
      typeof parsed.sessionId !== "string" ||
      typeof parsed.slotIndex !== "number" ||
      parsed.slotIndex < 0 ||
      parsed.slotIndex > 3 ||
      typeof parsed.currentStepId !== "string" ||
      typeof parsed.updatedAtIso !== "string"
    ) {
      return null;
    }

    return parsed satisfies ActiveSession;
  } catch {
    return null;
  }
}

export function writeActiveSession(session: ActiveSession): void {
  if (!isBrowser()) {
    return;
  }
  window.localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function clearActiveSession(): void {
  if (!isBrowser()) {
    return;
  }
  window.localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
}

export function createSessionId(slotIndex: number): string {
  return `ses_${slotIndex + 1}_${Date.now()}`;
}
