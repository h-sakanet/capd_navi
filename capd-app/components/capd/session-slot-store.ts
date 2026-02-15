"use client";

import {
  createEmptySlots,
  readMasterProcedurePlan,
  readTodayProcedureSlots,
  writeMasterProcedurePlan,
  writeTodayProcedureSlots
} from "@/lib/storage/daily-plan.repo";
import { clearActiveSessionFromDb, readActiveSessionFromDb, writeActiveSessionToDb } from "@/lib/storage/app-state.repo";
import type { ActiveSessionCache, ProcedureSlot, ProcedureSlotStatus } from "@/lib/storage/models";

export type { ProcedureSlot, ProcedureSlotStatus };

export type ActiveSession = ActiveSessionCache;

const SLOT_STORAGE_KEY = "capd-support:home:slots:v1";
const ACTIVE_SESSION_STORAGE_KEY = "capd-support:home:active-session:v1";

export const defaultProcedureSlots: Array<ProcedureSlot | null> = createEmptySlots();

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function normalizeProcedureSlot(value: unknown): ProcedureSlot | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const item = value as Partial<ProcedureSlot>;
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
  };
}

function normalizeSlots(value: unknown): Array<ProcedureSlot | null> {
  if (!Array.isArray(value) || value.length !== 4) {
    return [...defaultProcedureSlots];
  }
  return value.map((item) => normalizeProcedureSlot(item));
}

export async function readProcedureSlots(): Promise<Array<ProcedureSlot | null>> {
  if (!isBrowser()) {
    return [...defaultProcedureSlots];
  }

  // まず IndexedDB (今日のプラン) を確認
  const todaySlots = await readTodayProcedureSlots();
  const normalizedToday = normalizeSlots(todaySlots);
  if (normalizedToday.some(s => s !== null)) {
    return normalizedToday;
  }

  // 次に IndexedDB (マスターテンプレート) を確認
  const masterPlan = await readMasterProcedurePlan();
  if (masterPlan && masterPlan.slots.some(s => s !== null)) {
    const resetMaster = masterPlan.slots.map(slot =>
      slot ? { ...slot, status: "未実施" as const } : null
    );
    return resetMaster;
  }

  // 最後にレガシーな localStorage を確認 (移行用)
  try {
    const raw = window.localStorage.getItem(SLOT_STORAGE_KEY);
    if (raw) {
      const cached = normalizeSlots(JSON.parse(raw));
      if (cached.some(s => s !== null)) {
        // マスターに保存して移行
        await writeMasterProcedurePlan(cached);
        window.localStorage.removeItem(SLOT_STORAGE_KEY);
        return cached.map(s => s ? { ...s, status: "未実施" as const } : null);
      }
    }
  } catch {
    // ignore
  }

  return [...defaultProcedureSlots];
}

export async function readProcedureSlotsSource(): Promise<Array<ProcedureSlot | null>> {
  return readProcedureSlots();
}

export async function writeProcedureSlots(slots: Array<ProcedureSlot | null>): Promise<void> {
  if (!isBrowser()) {
    return;
  }
  // マスターとして保存 (ひな形)
  await writeMasterProcedurePlan(slots);
}

export async function writeProcedureSlotsSource(slots: Array<ProcedureSlot | null>): Promise<void> {
  // 今日分を保存
  await writeTodayProcedureSlots(slots);
  // ひな形も更新しておく（ステータスは「未実施」で保存するのがひな形としては適切。
  // ただし現在のUIコードは書き込み時に現在の状態をそのまま渡していることが多いので
  // ここでフィルタリングするか検討が必要。一旦そのまま保存し、読み込み時にリセットする）
  await writeMasterProcedurePlan(slots);
}

function normalizeActiveSession(value: unknown): ActiveSession | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const item = value as Partial<ActiveSession>;
  if (
    typeof item.sessionId !== "string" ||
    typeof item.slotIndex !== "number" ||
    item.slotIndex < 0 ||
    item.slotIndex > 3 ||
    typeof item.currentStepId !== "string" ||
    typeof item.updatedAtIso !== "string"
  ) {
    return null;
  }

  return {
    sessionId: item.sessionId,
    slotIndex: item.slotIndex,
    currentStepId: item.currentStepId,
    updatedAtIso: item.updatedAtIso,
    protocolId: typeof item.protocolId === "string" ? item.protocolId : "",
    snapshotHash: typeof item.snapshotHash === "string" ? item.snapshotHash : "",
    mode: item.mode === "preview" ? "preview" : "runtime"
  };
}

export async function readActiveSession(): Promise<ActiveSession | null> {
  if (!isBrowser()) {
    return null;
  }

  // まず IndexedDB を確認
  const dbSession = await readActiveSessionFromDb();
  if (dbSession) {
    return normalizeActiveSession(dbSession);
  }

  // なければ localStorage を確認 (移行用)
  try {
    const raw = window.localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);
    if (raw) {
      const parsed = normalizeActiveSession(JSON.parse(raw));
      if (parsed) {
        // 移行
        await writeActiveSessionToDb(parsed);
        window.localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
        return parsed;
      }
    }
  } catch {
    // ignore
  }

  return null;
}

export async function writeActiveSession(session: ActiveSession): Promise<void> {
  if (!isBrowser()) {
    return;
  }
  await writeActiveSessionToDb(session);
}

export async function clearActiveSession(): Promise<void> {
  if (!isBrowser()) {
    return;
  }
  await clearActiveSessionFromDb();
}

export function createSessionId(slotIndex: number): string {
  return `ses_${slotIndex + 1}_${Date.now()}`;
}
