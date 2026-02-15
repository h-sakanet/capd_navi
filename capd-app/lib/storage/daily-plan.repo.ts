import { requestToPromise, withTransaction } from "@/lib/storage/capd-db";
import type { DailyProcedurePlanEntity, ProcedureSlot } from "@/lib/storage/models";
import { nowIso, toDateLocalJst } from "@/lib/storage/time";

const EMPTY_SLOTS: Array<ProcedureSlot | null> = [null, null, null, null];

function normalizeSlot(value: unknown): ProcedureSlot | null {
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

function normalizeDailyPlan(value: unknown): DailyProcedurePlanEntity | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const entity = value as Partial<DailyProcedurePlanEntity>;
  if (typeof entity.dateLocal !== "string" || !Array.isArray(entity.slots)) {
    return null;
  }

  const slots = entity.slots.map(normalizeSlot);
  if (slots.length !== 4) {
    return null;
  }

  return {
    dateLocal: entity.dateLocal,
    slots,
    updatedAtIso: typeof entity.updatedAtIso === "string" ? entity.updatedAtIso : nowIso()
  };
}

export function createEmptySlots(): Array<ProcedureSlot | null> {
  return [...EMPTY_SLOTS];
}

export async function readDailyProcedurePlan(dateLocal: string): Promise<DailyProcedurePlanEntity> {
  return withTransaction("daily_procedure_plans", "readonly", async (transaction) => {
    const store = transaction.objectStore("daily_procedure_plans");
    const row = await requestToPromise(store.get(dateLocal));
    const normalized = normalizeDailyPlan(row);
    if (normalized) {
      return normalized;
    }

    return {
      dateLocal,
      slots: createEmptySlots(),
      updatedAtIso: nowIso()
    };
  });
}

export async function writeDailyProcedurePlan(plan: DailyProcedurePlanEntity): Promise<void> {
  await withTransaction("daily_procedure_plans", "readwrite", async (transaction) => {
    const store = transaction.objectStore("daily_procedure_plans");
    await requestToPromise(
      store.put({
        dateLocal: plan.dateLocal,
        slots: plan.slots,
        updatedAtIso: plan.updatedAtIso
      })
    );
  });
}

export async function readTodayProcedureSlots(): Promise<Array<ProcedureSlot | null>> {
  const plan = await readDailyProcedurePlan(toDateLocalJst());
  return plan.slots;
}

export async function writeTodayProcedureSlots(slots: Array<ProcedureSlot | null>): Promise<void> {
  await writeDailyProcedurePlan({
    dateLocal: toDateLocalJst(),
    slots,
    updatedAtIso: nowIso()
  });
}

export async function patchTodaySlotStatus(slotIndex: number, status: ProcedureSlot["status"]): Promise<void> {
  const plan = await readDailyProcedurePlan(toDateLocalJst());
  if (slotIndex < 0 || slotIndex >= plan.slots.length) {
    return;
  }

  const current = plan.slots[slotIndex];
  if (!current) {
    return;
  }

  const nextSlots = [...plan.slots];
  nextSlots[slotIndex] = {
    ...current,
    status
  };

  await writeDailyProcedurePlan({
    ...plan,
    slots: nextSlots,
    updatedAtIso: nowIso()
  });
}

export const MASTER_PLAN_ID = "__master_template__";

export async function readMasterProcedurePlan(): Promise<DailyProcedurePlanEntity | null> {
  return withTransaction("daily_procedure_plans", "readonly", async (transaction) => {
    const store = transaction.objectStore("daily_procedure_plans");
    const row = await requestToPromise(store.get(MASTER_PLAN_ID));
    return normalizeDailyPlan(row);
  });
}

export async function writeMasterProcedurePlan(slots: Array<ProcedureSlot | null>): Promise<void> {
  await withTransaction("daily_procedure_plans", "readwrite", async (transaction) => {
    const store = transaction.objectStore("daily_procedure_plans");
    await requestToPromise(
      store.put({
        dateLocal: MASTER_PLAN_ID,
        slots,
        updatedAtIso: nowIso()
      })
    );
  });
}
