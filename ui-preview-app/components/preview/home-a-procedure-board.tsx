"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "@mynaui/icons-react";

import {
  createPreviewSessionId,
  defaultProcedureSlots,
  readActiveSession,
  readProcedureSlots,
  writeActiveSession,
  writeProcedureSlots,
  type ProcedureSlot
} from "@/components/preview/session-slot-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ProcedureForm = {
  protocolId: string;
  recommendedTime: string;
};

const protocolCatalog = [
  { id: "reguneal-15", label: "レギニュール1.5" },
  { id: "night-drain-v12", label: "夜間排液 v1.2.0" },
  { id: "morning-exchange-v101", label: "朝交換 v1.0.1" }
] as const;

const defaultForm: ProcedureForm = {
  protocolId: protocolCatalog[0].id,
  recommendedTime: "20:00"
};

function ModalShell({
  title,
  children,
  onClose
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-lg border bg-background shadow-lg" role="dialog" aria-modal="true">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <Button size="icon" variant="ghost" onClick={onClose} aria-label="モーダルを閉じる">
            <X />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}

function hasReadyLeftSlots(slots: Array<ProcedureSlot | null>, slotIndex: number): boolean {
  return slots.slice(0, slotIndex).every((slot) => slot?.status === "実施済み");
}

function validateRecommendedOrder(slots: Array<ProcedureSlot | null>): string | null {
  let previousTime: string | null = null;
  for (const slot of slots) {
    if (!slot) {
      continue;
    }
    if (previousTime !== null && slot.recommendedTime <= previousTime) {
      return "推奨実施時間は左から右へ遅くなるように設定してください。";
    }
    previousTime = slot.recommendedTime;
  }
  return null;
}

export function HomeAProcedureBoard() {
  const router = useRouter();
  const [slots, setSlots] = useState<Array<ProcedureSlot | null>>([...defaultProcedureSlots]);
  const [storageReady, setStorageReady] = useState(false);
  const [editingSlotIndex, setEditingSlotIndex] = useState<number | null>(null);
  const [confirmSlotIndex, setConfirmSlotIndex] = useState<number | null>(null);
  const [confirmMode, setConfirmMode] = useState<"start" | "view">("view");
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  const [form, setForm] = useState<ProcedureForm>(defaultForm);
  const [boardNotice, setBoardNotice] = useState<string | null>(null);

  const hasInProgressSlot = slots.some((slot) => slot?.status === "実施中");
  const confirmSlot = useMemo(
    () => (confirmSlotIndex === null ? null : slots[confirmSlotIndex]),
    [confirmSlotIndex, slots]
  );

  useEffect(() => {
    const persistedSlots = readProcedureSlots();
    setSlots(persistedSlots);
    setStorageReady(true);
  }, []);

  useEffect(() => {
    if (!storageReady) {
      return;
    }
    writeProcedureSlots(slots);
  }, [slots, storageReady]);

  useEffect(() => {
    if (!storageReady) {
      return;
    }

    const activeSession = readActiveSession();
    if (!activeSession) {
      return;
    }

    setSlots((current) => {
      const slot = current[activeSession.slotIndex];
      if (!slot || slot.status === "実施中") {
        return current;
      }
      const next = [...current];
      next[activeSession.slotIndex] = { ...slot, status: "実施中" };
      return next;
    });
  }, [storageReady]);

  const openSetupModal = (slotIndex: number) => {
    setOpenMenuIndex(null);
    if (hasInProgressSlot) {
      setBoardNotice("実施中セッションがあるため、スロット編集はできません。");
      return;
    }

    const currentSlot = slots[slotIndex];
    if (currentSlot) {
      setForm({
        protocolId: currentSlot.protocolId,
        recommendedTime: currentSlot.recommendedTime
      });
    } else {
      setForm(defaultForm);
    }
    setBoardNotice(null);
    setEditingSlotIndex(slotIndex);
  };

  const closeSetupModal = () => {
    setEditingSlotIndex(null);
  };

  const saveSlot = () => {
    if (editingSlotIndex === null) {
      return;
    }

    const selectedProtocol = protocolCatalog.find((item) => item.id === form.protocolId);
    if (!selectedProtocol || !form.recommendedTime) {
      return;
    }

    const nextSlots = [...slots];
    const currentStatus = slots[editingSlotIndex]?.status ?? "未実施";
    nextSlots[editingSlotIndex] = {
      protocolId: selectedProtocol.id,
      protocolLabel: selectedProtocol.label,
      recommendedTime: form.recommendedTime,
      status: currentStatus
    };

    const orderError = validateRecommendedOrder(nextSlots);
    if (orderError) {
      setBoardNotice(orderError);
      return;
    }

    setBoardNotice(null);
    setSlots(nextSlots);
    closeSetupModal();
  };

  const openStartConfirm = (slotIndex: number) => {
    setOpenMenuIndex(null);
    setBoardNotice(null);
    setConfirmMode("start");
    setConfirmSlotIndex(slotIndex);
  };

  const startOrResumeSession = () => {
    if (confirmSlotIndex === null) {
      return;
    }

    const targetSlot = slots[confirmSlotIndex];
    if (!targetSlot) {
      return;
    }

    const currentActive = readActiveSession();
    const isResume = targetSlot.status === "実施中";
    const sessionId =
      isResume && currentActive?.slotIndex === confirmSlotIndex
        ? currentActive.sessionId
        : createPreviewSessionId(confirmSlotIndex);
    const currentStepId =
      isResume && currentActive?.slotIndex === confirmSlotIndex ? currentActive.currentStepId : "step_021";

    const nextSlots = [...slots];
    if (targetSlot.status !== "実施中") {
      nextSlots[confirmSlotIndex] = { ...targetSlot, status: "実施中" };
      setSlots(nextSlots);
    }

    writeActiveSession({
      sessionId,
      slotIndex: confirmSlotIndex,
      currentStepId,
      updatedAtIso: new Date().toISOString()
    });

    setConfirmSlotIndex(null);
    router.push(`/ui-preview/session-a?slot=${confirmSlotIndex + 1}&sessionId=${encodeURIComponent(sessionId)}`);
  };

  return (
    <>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {slots.map((slot, index) => {
          if (slot) {
            const blockedByLeft = !hasReadyLeftSlots(slots, index);
            const canStart = slot.status !== "実施済み" && !blockedByLeft;
            const isCompleted = slot.status === "実施済み";

            return (
              <section
                key={`slot-${index + 1}`}
                className={cn(
                  "relative rounded-xl border px-3 py-2.5 transition-colors",
                  canStart
                    ? "bg-background hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    : "cursor-default bg-muted/20"
                )}
                role={canStart ? "button" : undefined}
                aria-disabled={!canStart}
                tabIndex={canStart ? 0 : -1}
                onClick={() => {
                  if (openMenuIndex !== null) {
                    setOpenMenuIndex(null);
                    return;
                  }
                  if (!canStart) {
                    return;
                  }
                  openStartConfirm(index);
                }}
                onKeyDown={(event) => {
                  if (!canStart) {
                    return;
                  }
                  if (event.key !== "Enter" && event.key !== " ") {
                    return;
                  }
                  event.preventDefault();
                  if (openMenuIndex !== null) {
                    setOpenMenuIndex(null);
                    return;
                  }
                  openStartConfirm(index);
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-medium text-muted-foreground">#{index + 1}.</p>
                  <button
                    type="button"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-background text-sm leading-none text-muted-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="その他操作"
                    aria-haspopup="menu"
                    aria-expanded={openMenuIndex === index}
                    onClick={(event) => {
                      event.stopPropagation();
                      setOpenMenuIndex((current) => (current === index ? null : index));
                    }}
                  >
                    •••
                  </button>
                </div>

                <div className="mt-1.5 space-y-1 text-sm">
                  <p className="font-semibold">{slot.protocolLabel}</p>
                  <p>ステータス：{slot.status}</p>
                  <p className="text-muted-foreground">推奨実施 {slot.recommendedTime}</p>
                  {blockedByLeft && !isCompleted ? (
                    <p className="text-xs text-destructive">左側スロットを実施済みにすると開始できます。</p>
                  ) : null}
                </div>

                {openMenuIndex === index && (
                  <div
                    className="absolute right-2 top-12 z-20 w-24 rounded-md border bg-background p-1 shadow-sm"
                    role="menu"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <button
                      type="button"
                      className="w-full rounded-sm px-2 py-1 text-left text-sm hover:bg-muted"
                      role="menuitem"
                      onClick={() => {
                        setOpenMenuIndex(null);
                        setConfirmMode("view");
                        setConfirmSlotIndex(index);
                      }}
                    >
                      確認
                    </button>
                    <button
                      type="button"
                      disabled={hasInProgressSlot || slot.status === "実施済み"}
                      className="w-full rounded-sm px-2 py-1 text-left text-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                      role="menuitem"
                      onClick={() => openSetupModal(index)}
                    >
                      編集
                    </button>
                  </div>
                )}
              </section>
            );
          }

          return (
            <button
              key={`slot-${index + 1}`}
              type="button"
              disabled={hasInProgressSlot}
              className="flex min-h-[132px] items-center justify-center rounded-xl border border-dashed bg-muted/30 text-muted-foreground transition-colors hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => openSetupModal(index)}
              aria-label={`手技スロット${index + 1}を設定`}
            >
              <Plus className="h-8 w-8" />
            </button>
          );
        })}
      </div>

      {boardNotice ? <p className="mt-2 text-sm text-destructive">{boardNotice}</p> : null}

      {editingSlotIndex !== null && (
        <ModalShell title={`#${editingSlotIndex + 1} 手技設定`} onClose={closeSetupModal}>
          <div className="space-y-4 px-5 py-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="protocol-select">
                CSV選択
              </label>
              <select
                id="protocol-select"
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                value={form.protocolId}
                onChange={(event) => setForm((current) => ({ ...current, protocolId: event.target.value }))}
              >
                {protocolCatalog.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="recommended-time">
                推奨実施時間
              </label>
              <input
                id="recommended-time"
                type="time"
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                value={form.recommendedTime}
                onChange={(event) => setForm((current) => ({ ...current, recommendedTime: event.target.value }))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t px-5 py-4">
            <Button variant="outline" onClick={closeSetupModal}>
              キャンセル
            </Button>
            <Button onClick={saveSlot}>保存</Button>
          </div>
        </ModalShell>
      )}

      {confirmSlot && (
        <ModalShell
          title={
            confirmMode === "start"
              ? confirmSlot.status === "実施中"
                ? "手技の再開"
                : "手技の開始"
              : "手技内容の確認"
          }
          onClose={() => setConfirmSlotIndex(null)}
        >
          <div className="space-y-4 px-5 py-4">
            <dl className="grid gap-3 rounded-lg border bg-muted/30 p-4 text-sm">
              <div className="grid grid-cols-[120px_1fr] items-start gap-2">
                <dt className="text-muted-foreground">手技</dt>
                <dd>{confirmSlot.protocolLabel}</dd>
              </div>
              <div className="grid grid-cols-[120px_1fr] items-start gap-2">
                <dt className="text-muted-foreground">ステータス</dt>
                <dd>{confirmSlot.status}</dd>
              </div>
              <div className="grid grid-cols-[120px_1fr] items-start gap-2">
                <dt className="text-muted-foreground">推奨実施</dt>
                <dd>{confirmSlot.recommendedTime}</dd>
              </div>
            </dl>
            {confirmMode === "view" ? (
              <p className="text-sm text-muted-foreground">
                この確認画面では、記録入力・タイマー設定・アラーム設定は行いません。
              </p>
            ) : null}
          </div>

          <div className="flex justify-end gap-2 border-t px-5 py-4">
            <Button variant="outline" onClick={() => setConfirmSlotIndex(null)}>
              閉じる
            </Button>
            <Button onClick={startOrResumeSession}>{confirmSlot.status === "実施中" ? "再開" : "開始"}</Button>
          </div>
        </ModalShell>
      )}
    </>
  );
}
