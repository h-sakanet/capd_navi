"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "@mynaui/icons-react";

import {
  clearActiveSession,
  defaultProcedureSlots,
  readActiveSession,
  readProcedureSlots,
  readProcedureSlotsSource,
  writeActiveSession,
  writeProcedureSlotsSource,
  type ProcedureSlot
} from "@/components/capd/session-slot-store";
import {
  hasLegacyProtocolTemplates,
  readProtocolTemplates
} from "@/components/capd/protocol-template-store";
import { startSessionFromSlot } from "@/lib/services/session-service";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ProcedureForm = {
  protocolId: string;
  recommendedTime: string;
};

type Props = {
  onCompletionChange?: (allCompleted: boolean) => void;
};

const defaultForm: ProcedureForm = {
  protocolId: "",
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

export function HomeProcedureBoard({ onCompletionChange }: Props) {
  const router = useRouter();
  const [slots, setSlots] = useState<Array<ProcedureSlot | null>>([...defaultProcedureSlots]);
  const [protocolCatalog, setProtocolCatalog] = useState<Array<{ id: string; label: string }>>([]);
  const [storageReady, setStorageReady] = useState(false);
  const [editingSlotIndex, setEditingSlotIndex] = useState<number | null>(null);
  const [confirmSlotIndex, setConfirmSlotIndex] = useState<number | null>(null);
  const [deletingSlotIndex, setDeletingSlotIndex] = useState<number | null>(null);
  const [confirmMode, setConfirmMode] = useState<"start" | "view">("view");
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  const [form, setForm] = useState<ProcedureForm>(defaultForm);
  const [boardNotice, setBoardNotice] = useState<string | null>(null);

  const hasInProgressSlot = slots.some((slot) => slot?.status === "実施中");
  const selectableProtocols = useMemo(() => {
    const byId = new Map<string, { id: string; label: string }>();
    for (const protocol of protocolCatalog) {
      byId.set(protocol.id, protocol);
    }
    for (const slot of slots) {
      if (slot && !byId.has(slot.protocolId)) {
        byId.set(slot.protocolId, { id: slot.protocolId, label: slot.protocolLabel });
      }
    }
    return Array.from(byId.values());
  }, [protocolCatalog, slots]);
  const confirmSlot = useMemo(
    () => (confirmSlotIndex === null ? null : slots[confirmSlotIndex]),
    [confirmSlotIndex, slots]
  );
  const deletingSlot = useMemo(
    () => (deletingSlotIndex === null ? null : slots[deletingSlotIndex]),
    [deletingSlotIndex, slots]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadInitialState() {
      const [templates, sourceSlots] = await Promise.all([readProtocolTemplates(), readProcedureSlotsSource()]);
      if (cancelled) {
        return;
      }

      setProtocolCatalog(
        templates.map((template) => ({
          id: template.protocolId,
          label: template.protocolName
        }))
      );
      setSlots(sourceSlots);
      setStorageReady(true);

      if (hasLegacyProtocolTemplates()) {
        setBoardNotice("旧テンプレート形式を検出しました。CSVを再取り込みしてください。");
      }
    }

    void loadInitialState();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!storageReady) {
      return;
    }
    void writeProcedureSlotsSource(slots);

    const allCompleted = slots.every((slot) => !slot || slot.status === "実施済み");
    onCompletionChange?.(allCompleted);
  }, [slots, storageReady, onCompletionChange]);

  useEffect(() => {
    if (!storageReady) {
      return;
    }

    async function syncActiveSession() {
      const activeSession = await readActiveSession();
      if (!activeSession || activeSession.mode === "preview") {
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
    }

    void syncActiveSession();
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
      if (!selectableProtocols.length) {
        setBoardNotice("手技テンプレートがありません。CSV取り込み後に設定してください。");
        return;
      }
      setForm({
        ...defaultForm,
        protocolId: selectableProtocols[0].id
      });
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

    const selectedProtocol = selectableProtocols.find((item) => item.id === form.protocolId);
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
    const targetSlot = slots[slotIndex];
    if (!targetSlot) {
      return;
    }

    if (hasInProgressSlot && targetSlot.status !== "実施中") {
      setBoardNotice("実施中セッションがあるため開始できません。");
      return;
    }

    setOpenMenuIndex(null);
    setBoardNotice(null);
    setConfirmMode("start");
    setConfirmSlotIndex(slotIndex);
  };

  const openDeleteConfirm = (slotIndex: number) => {
    const targetSlot = slots[slotIndex];
    if (!targetSlot) {
      return;
    }

    if (hasInProgressSlot || targetSlot.status === "実施済み") {
      return;
    }

    setOpenMenuIndex(null);
    setBoardNotice(null);
    setDeletingSlotIndex(slotIndex);
  };

  const deleteSlot = () => {
    if (deletingSlotIndex === null) {
      return;
    }

    const targetSlot = slots[deletingSlotIndex];
    if (!targetSlot || hasInProgressSlot || targetSlot.status === "実施済み") {
      setDeletingSlotIndex(null);
      return;
    }

    const next = [...slots];
    next[deletingSlotIndex] = null;
    setSlots(next);
    setDeletingSlotIndex(null);
  };

  const startOrResumeSession = async () => {
    if (confirmSlotIndex === null) {
      return;
    }

    const targetSlot = slots[confirmSlotIndex];
    if (!targetSlot) {
      return;
    }

    if (hasInProgressSlot && targetSlot.status !== "実施中") {
      setBoardNotice("実施中セッションがあるため開始できません。");
      setConfirmSlotIndex(null);
      return;
    }

    if (confirmMode === "view") {
      setConfirmSlotIndex(null);
      await writeActiveSession({
        sessionId: "preview",
        slotIndex: confirmSlotIndex,
        currentStepId: "",
        protocolId: targetSlot.protocolId,
        snapshotHash: "",
        mode: "preview",
        updatedAtIso: new Date().toISOString()
      });
      router.push(`/capd/session?mode=preview&slot=${confirmSlotIndex + 1}`);
      return;
    }

    try {
      const currentActive = await readActiveSession();
      const isResume =
        targetSlot.status === "実施中" &&
        currentActive?.slotIndex === confirmSlotIndex &&
        currentActive.mode === "runtime";

      if (isResume && currentActive) {
        await writeActiveSession({
          ...currentActive,
          protocolId: currentActive.protocolId || targetSlot.protocolId,
          mode: "runtime",
          updatedAtIso: new Date().toISOString()
        });
        setConfirmSlotIndex(null);
        router.push(`/capd/session?slot=${confirmSlotIndex + 1}&sessionId=${encodeURIComponent(currentActive.sessionId)}`);
        return;
      }

      const activeSession = await startSessionFromSlot({
        slotIndex: confirmSlotIndex,
        protocolId: targetSlot.protocolId
      });

      const nextSlots = [...slots];
      nextSlots[confirmSlotIndex] = {
        ...targetSlot,
        status: "実施中"
      };
      setSlots(nextSlots);

      await writeActiveSession(activeSession);
      setConfirmSlotIndex(null);
      router.push(`/capd/session?slot=${confirmSlotIndex + 1}&sessionId=${encodeURIComponent(activeSession.sessionId)}`);
    } catch (error) {
      setBoardNotice(error instanceof Error ? error.message : "セッション開始に失敗しました。");
      await clearActiveSession();
      setConfirmSlotIndex(null);
    }
  };

  return (
    <>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {slots.map((slot, index) => {
          if (slot) {
            const blockedByLeft = !hasReadyLeftSlots(slots, index);
            const canStart = slot.status !== "実施済み" && !blockedByLeft;
            const isCompleted = slot.status === "実施済み";
            const isEmphasized = slot.status === "未実施" || slot.status === "実施中";
            const isMutatingDisabled = hasInProgressSlot || slot.status === "実施済み";

            return (
              <section
                key={`slot-${index + 1}`}
                className={cn(
                  "relative rounded-xl border px-3 py-2.5 transition-colors",
                  canStart ? "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" : "cursor-default",
                  isEmphasized ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted/20"
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
                    if (hasInProgressSlot && slot.status !== "実施中") {
                      setBoardNotice("実施中セッションがあるため開始できません。");
                    }
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
                  if (!canStart) {
                    if (hasInProgressSlot && slot.status !== "実施中") {
                      setBoardNotice("実施中セッションがあるため開始できません。");
                    }
                    return;
                  }
                  if (openMenuIndex !== null) {
                    setOpenMenuIndex(null);
                    return;
                  }
                  openStartConfirm(index);
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className={cn("text-xs font-medium", isEmphasized ? "text-primary-foreground/80" : "text-muted-foreground")}>
                    #{index + 1}.
                  </p>
                  <button
                    type="button"
                    className={cn(
                      "inline-flex h-9 w-9 items-center justify-center rounded-md text-sm leading-none disabled:cursor-not-allowed disabled:opacity-50",
                      isEmphasized
                        ? "bg-primary text-primary-foreground hover:bg-primary"
                        : "bg-background text-muted-foreground hover:bg-muted"
                    )}
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
                  <p className={cn(isEmphasized ? "text-primary-foreground/80" : "text-muted-foreground")}>
                    推奨実施 {slot.recommendedTime}
                  </p>
                </div>

                {openMenuIndex === index && (
                  <div
                    className="absolute right-2 top-12 z-20 w-24 rounded-md border bg-background p-1 shadow-sm"
                    role="menu"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <button
                      type="button"
                      className="w-full rounded-sm px-2 py-1 text-left text-sm text-foreground hover:bg-muted"
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
                      disabled={isMutatingDisabled}
                      className="w-full rounded-sm px-2 py-1 text-left text-sm text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                      role="menuitem"
                      onClick={() => openSetupModal(index)}
                    >
                      編集
                    </button>
                    <button
                      type="button"
                      disabled={isMutatingDisabled}
                      className="w-full rounded-sm px-2 py-1 text-left text-sm text-destructive hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                      role="menuitem"
                      onClick={() => openDeleteConfirm(index)}
                    >
                      削除
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
                {selectableProtocols.map((item) => (
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
            <Button onClick={() => void startOrResumeSession()}>
              {confirmMode === "view" ? "手順を表示（保存なし）" : confirmSlot.status === "実施中" ? "再開" : "開始"}
            </Button>
          </div>
        </ModalShell>
      )}

      {deletingSlot && deletingSlotIndex !== null && (
        <ModalShell title="スロット登録の削除" onClose={() => setDeletingSlotIndex(null)}>
          <div className="space-y-4 px-5 py-4">
            <p className="text-sm">
              #{deletingSlotIndex + 1} の「{deletingSlot.protocolLabel}」を削除します。
            </p>
            <p className="text-sm text-muted-foreground">この操作は取り消せません。</p>
          </div>

          <div className="flex justify-end gap-2 border-t px-5 py-4">
            <Button variant="outline" onClick={() => setDeletingSlotIndex(null)}>
              キャンセル
            </Button>
            <Button variant="destructive" onClick={deleteSlot}>
              削除する
            </Button>
          </div>
        </ModalShell>
      )}
    </>
  );
}
