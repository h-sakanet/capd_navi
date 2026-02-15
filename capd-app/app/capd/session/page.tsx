"use client";

import {
  ArrowLeftCircle,
  ArrowRightCircle,
  Bell,
  DangerTriangle,
  Link as LinkIcon,
  Unlink,
  X
} from "@mynaui/icons-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, type ComponentType, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  clearActiveSession,
  readActiveSession,
  readProcedureSlots,
  writeActiveSession
} from "@/components/capd/session-slot-store";
import { readProtocolTemplateById } from "@/components/capd/protocol-template-store";
import { CapdShell } from "@/components/capd/shell";
import { DrainAppearanceSelect, ExitSiteStatusCheckboxes, NumericField } from "@/components/capd/capd-record-fields";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SessionStepTimer } from "@/components/capd/session-step-timer";
import { alarmPlayer } from "@/lib/utils/audio";
import { Checkbox } from "@/components/ui/checkbox";
import {
  acknowledgeAlarm,
  advanceStep,
  cancelSession,
  completeSession,
  ensureStepEnterAlarm,
  getLatestAlarmForStep,
  isRecordSavedForStep,
  loadSessionRuntime,
  markAlarmMissed,
  markAlarmNotified,
  resolveSessionStepImage,
  saveRecordForStep
} from "@/lib/services/session-service";
import type { AlarmDispatchJobEntity, SessionSnapshotStep } from "@/lib/storage/models";
import { cn } from "@/lib/utils";
import { drainAppearanceOptions } from "@/lib/capd-constants";
import { normalizeNumericInput, parsePositiveNumber } from "@/lib/capd-validation";

type StateBadgeStyle = {
  icon: ComponentType<{ className?: string }>;
  className: string;
};

type SessionContext = {
  sessionId: string;
  slotIndex: number;
  protocolId: string;
  snapshotHash: string;
};

type RecordDraft = {
  drainAppearance?: string;
  drainWeightG?: string;
  bagWeightG?: string;
  bpSys?: string;
  bpDia?: string;
  bodyWeightKg?: string;
  pulse?: string;
  bodyTempC?: string;
  fluidIntakeMl?: string;
  urineMl?: string;
  stoolCountPerDay?: string;
  exitSiteStatuses: string[];
  note?: string;
};

type AlarmState = {
  jobId: string | null;
  status: "active" | "acked" | "missed";
  startedAtMs: number;
  notifications: number;
  ackedAtIso?: string;
};

// 定数は @/lib/capd-constants から import
const ALARM_MINUTE_MS = Number(process.env.NEXT_PUBLIC_ALARM_MINUTE_MS ?? "60000");

const stateBadgeByLabel: Record<string, StateBadgeStyle> = {
  "お腹-独立": {
    icon: Unlink,
    className: "border-slate-200 bg-slate-50 text-slate-700"
  },
  "お腹-接続": {
    icon: LinkIcon,
    className: "border-emerald-200 bg-emerald-50 text-emerald-800"
  },
  "お腹→廃液バッグ": {
    icon: ArrowRightCircle,
    className: "border-amber-200 bg-amber-50 text-amber-800"
  },
  "お腹←透析液バッグ": {
    icon: ArrowLeftCircle,
    className: "border-sky-200 bg-sky-50 text-sky-700"
  }
};

function formatStepTitle(step: SessionSnapshotStep): string {
  const baseTitle = step.title || "読み込み中";
  return step.sequenceNo > 0 ? `#${step.sequenceNo} ${baseTitle}` : baseTitle;
}

function isInteractiveTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  if (target.isContentEditable) {
    return true;
  }

  return Boolean(target.closest("button, input, textarea, select, a, [role='button']"));
}

function isMacPlatform(): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }
  return /mac/i.test(navigator.platform);
}

function parseSlotIndex(slotParam: string | null): number | null {
  const parsed = Number(slotParam);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 4) {
    return null;
  }
  return parsed - 1;
}

function createDefaultRecordDraft(recordEvent: string): RecordDraft {
  if (recordEvent === "drain_appearance") {
    return {
      drainAppearance: "透明",
      note: "",
      exitSiteStatuses: []
    };
  }
  if (recordEvent === "drain_weight_g") {
    return {
      drainWeightG: "",
      exitSiteStatuses: []
    };
  }
  if (recordEvent === "bag_weight_g") {
    return {
      bagWeightG: "",
      exitSiteStatuses: []
    };
  }
  return {
    bpSys: "130",
    bpDia: "95",
    pulse: "80",
    bodyWeightKg: "60.0",
    bodyTempC: "36.6",
    fluidIntakeMl: "1500",
    urineMl: "1500",
    stoolCountPerDay: "1",
    exitSiteStatuses: ["正常"],
    note: ""
  };
}

// parsePositiveNumber は @/lib/capd-validation から import

function validateRecordDraft(
  recordEvent: string,
  recordDraft: RecordDraft,
  options: {
    showLeftSummaryFields: boolean;
    showRightSummaryFields: boolean;
  }
): string | null {
  if (recordEvent === "drain_appearance") {
    if (!recordDraft.drainAppearance || !drainAppearanceOptions.some((option) => option === recordDraft.drainAppearance)) {
      return "排液の確認を選択してください。";
    }
    return null;
  }

  if (recordEvent === "drain_weight_g") {
    if (parsePositiveNumber(recordDraft.drainWeightG) === null) {
      return "排液量(g)を正しく入力してください。";
    }
    return null;
  }

  if (recordEvent === "bag_weight_g") {
    if (parsePositiveNumber(recordDraft.bagWeightG) === null) {
      return "注液量(g)を正しく入力してください。";
    }
    return null;
  }

  if (recordEvent !== "session_summary") {
    return null;
  }

  if (options.showLeftSummaryFields) {
    const requiredLeftFields = [
      parsePositiveNumber(recordDraft.bpSys),
      parsePositiveNumber(recordDraft.bpDia),
      parsePositiveNumber(recordDraft.pulse),
      parsePositiveNumber(recordDraft.bodyWeightKg),
      parsePositiveNumber(recordDraft.bodyTempC)
    ];
    const hasAllLeftNumbers = requiredLeftFields.every((value) => value !== null);
    if (!hasAllLeftNumbers) {
      return "血圧/脈拍/体重/体温を入力してください。";
    }
  }

  if (options.showRightSummaryFields) {
    const requiredRightFields = [
      parsePositiveNumber(recordDraft.fluidIntakeMl),
      parsePositiveNumber(recordDraft.urineMl),
      parsePositiveNumber(recordDraft.stoolCountPerDay)
    ];
    const hasAllRightNumbers = requiredRightFields.every((value) => value !== null);
    if (!hasAllRightNumbers) {
      return "飲水量/尿量/排便回数を入力してください。";
    }
  }

  if (options.showLeftSummaryFields && !recordDraft.exitSiteStatuses.length) {
    return "出口部状態を1つ以上選択してください。";
  }

  return null;
}

// normalizeNumericInput は @/lib/capd-validation から import

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

function toAlarmState(job: AlarmDispatchJobEntity): AlarmState {
  return {
    jobId: job.jobId,
    status: job.status === "acknowledged" ? "acked" : job.status === "missed" ? "missed" : "active",
    startedAtMs: new Date(job.createdAtIso).getTime(),
    notifications: Math.max(1, job.attemptNo),
    ackedAtIso: job.ackedAtIso ?? undefined
  };
}

function supportsSelectionRange(input: HTMLInputElement): boolean {
  return ["text", "search", "url", "tel", "password", "email"].includes(input.type);
}

function focusFirstRecordField(stepId: string, recordEvent?: string): void {
  // drain_appearance はデフォルト値のまま保存することが多いため、「次へ」ボタンにフォーカス
  if (recordEvent === "drain_appearance") {
    const nextBtn = document.querySelector<HTMLButtonElement>(
      "[data-next-step-btn]"
    );
    if (nextBtn) {
      nextBtn.focus();
      return;
    }
  }

  const recordForm = document.querySelector<HTMLElement>(`[data-record-form-step-id="${stepId}"]`);
  if (!recordForm) {
    return;
  }

  const activeElement = document.activeElement as HTMLElement | null;
  if (activeElement && recordForm.contains(activeElement)) {
    return;
  }

  const firstField = recordForm.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
    "input:not([type='checkbox']):not([disabled]), select:not([disabled]), textarea:not([disabled])"
  );
  if (!firstField) {
    return;
  }

  firstField.focus();
  if (firstField instanceof HTMLTextAreaElement) {
    const cursor = firstField.value.length;
    firstField.setSelectionRange(cursor, cursor);
    return;
  }

  if (firstField instanceof HTMLInputElement && supportsSelectionRange(firstField)) {
    const cursor = firstField.value.length;
    firstField.setSelectionRange(cursor, cursor);
  }
}

function SessionPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionIdParam = searchParams.get("sessionId");
  const slotIndexParam = parseSlotIndex(searchParams.get("slot"));
  const stepIdParam = searchParams.get("stepId");
  const modeParam = searchParams.get("mode");

  const [steps, setSteps] = useState<SessionSnapshotStep[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [checkedByStep, setCheckedByStep] = useState<Record<string, string[]>>({});
  const [stepImageSrc, setStepImageSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionContext, setSessionContext] = useState<SessionContext | null>(null);
  const [previewProtocolId, setPreviewProtocolId] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isUtilityMenuOpen, setIsUtilityMenuOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancelConfirmText, setCancelConfirmText] = useState("");
  const [slotBounds, setSlotBounds] = useState<{ leftmost: number | null; rightmost: number | null }>({
    leftmost: null,
    rightmost: null
  });
  const [recordDraftByStep, setRecordDraftByStep] = useState<Record<string, RecordDraft>>({});
  const [recordCompletedByStep, setRecordCompletedByStep] = useState<Record<string, boolean>>({});
  const [recordErrorByStep, setRecordErrorByStep] = useState<Record<string, string | null>>({});
  const [alarmByStepId, setAlarmByStepId] = useState<Record<string, AlarmState>>({});

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      setLoading(true);
      setError(null);

      try {
        const activeSession = await readActiveSession();
        const isPreview = modeParam === "preview";
        setIsPreviewMode(isPreview);

        if (isPreview) {
          const protocolId = activeSession?.protocolId;
          if (!protocolId) {
            throw new Error("確認モードのテンプレートが見つかりません。");
          }

          const template = await readProtocolTemplateById(protocolId);
          if (!template) {
            throw new Error("テンプレートが見つかりません。CSVを再取り込みしてください。");
          }

          const previewSteps = template.steps.map((step) => ({
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
            timerSpec:
              step.timerId && (step.timerEvent === "start" || step.timerEvent === "end")
                ? {
                  timerId: step.timerId,
                  timerEvent: step.timerEvent,
                  timerExchangeNo: step.timerExchangeNo,
                  timerSegment:
                    step.timerSegment === "dwell" || step.timerSegment === "drain" ? step.timerSegment : ""
                }
                : null,
            alarmSpec: step.alarmId
              ? {
                alarmId: step.alarmId,
                alarmTrigger: step.alarmTrigger === "step_enter" ? "step_enter" : step.alarmTrigger === "timer_end" ? "timer_end" : "",
                alarmDurationMin: step.alarmDurationMin,
                alarmRelatedTimerId: step.alarmRelatedTimerId
              }
              : null,
            recordSpec: step.recordEvent
              ? {
                recordEvent: step.recordEvent,
                recordExchangeNo: step.recordExchangeNo,
                recordUnit: step.recordUnit
              }
              : null
          } satisfies SessionSnapshotStep));

          if (cancelled) {
            return;
          }

          setSessionContext(null);
          setPreviewProtocolId(protocolId);
          setSteps(previewSteps);
          setCurrentIndex(0);
          setRecordCompletedByStep({});
          setRecordErrorByStep({});
          setAlarmByStepId({});
          setLoading(false);
          return;
        }

        const resolvedSessionId = sessionIdParam ?? activeSession?.sessionId ?? null;
        const resolvedSlotIndex = slotIndexParam ?? activeSession?.slotIndex ?? null;

        if (!resolvedSessionId || resolvedSlotIndex === null) {
          throw new Error("進行中セッションが見つかりません。");
        }

        const runtime = await loadSessionRuntime(resolvedSessionId);
        if (cancelled) {
          return;
        }

        const currentStepId =
          stepIdParam && runtime.snapshot.steps.some((step) => step.stepId === stepIdParam)
            ? stepIdParam
            : runtime.session.currentStepId;
        const initialIndex = runtime.snapshot.steps.findIndex((step) => step.stepId === currentStepId);

        setSessionContext({
          sessionId: runtime.session.sessionId,
          slotIndex: runtime.session.slotIndex,
          protocolId: runtime.session.protocolId,
          snapshotHash: runtime.session.snapshotHash
        });
        setPreviewProtocolId(null);
        setSteps(runtime.snapshot.steps);
        setCurrentIndex(initialIndex >= 0 ? initialIndex : 0);
        setRecordCompletedByStep(
          runtime.records.reduce<Record<string, boolean>>((acc, record) => {
            acc[record.stepId] = true;
            return acc;
          }, {})
        );
        setAlarmByStepId(
          runtime.alarms.reduce<Record<string, AlarmState>>((acc, job) => {
            acc[job.stepId] = toAlarmState(job);
            return acc;
          }, {})
        );

        await writeActiveSession({
          sessionId: runtime.session.sessionId,
          slotIndex: runtime.session.slotIndex,
          currentStepId,
          protocolId: runtime.session.protocolId,
          snapshotHash: runtime.session.snapshotHash,
          mode: "runtime",
          updatedAtIso: new Date().toISOString()
        });

        setLoading(false);
      } catch (loadError) {
        if (cancelled) {
          return;
        }
        setSteps([]);
        setCurrentIndex(0);
        setPreviewProtocolId(null);
        setLoading(false);
        setError(loadError instanceof Error ? loadError.message : "セッション読み込みに失敗しました。");
      }
    }

    void boot();

    return () => {
      cancelled = true;
    };
  }, [modeParam, sessionIdParam, slotIndexParam, stepIdParam]);

  useEffect(() => {
    async function loadBounds() {
      const slots = await readProcedureSlots();
      const configuredIndices = slots.flatMap((slot, index) => (slot ? [index] : []));
      const activeSession = await readActiveSession();
      const fallbackSlotIndex = sessionContext?.slotIndex ?? slotIndexParam ?? activeSession?.slotIndex ?? null;

      if (!configuredIndices.length) {
        setSlotBounds({
          leftmost: fallbackSlotIndex,
          rightmost: fallbackSlotIndex
        });
        return;
      }

      setSlotBounds({
        leftmost: configuredIndices[0] ?? fallbackSlotIndex,
        rightmost: configuredIndices[configuredIndices.length - 1] ?? fallbackSlotIndex
      });
    }

    void loadBounds();
  }, [sessionContext?.slotIndex, slotIndexParam]);

  const stepIndexById = useMemo(() => {
    return new Map(steps.map((step, index) => [step.stepId, index]));
  }, [steps]);

  const currentStep = useMemo(() => steps[currentIndex] ?? null, [steps, currentIndex]);
  const nextStepIndex = useMemo(() => {
    if (!currentStep?.nextStepId) {
      return -1;
    }
    return stepIndexById.get(currentStep.nextStepId) ?? -1;
  }, [currentStep?.nextStepId, stepIndexById]);

  const canGoNext = nextStepIndex >= 0;
  const canGoPrev = currentIndex > 0;
  const imageProtocolId = sessionContext?.protocolId ?? previewProtocolId;

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    async function loadStepImage() {
      setStepImageSrc(null);

      if (!currentStep?.image || !imageProtocolId) {
        return;
      }

      try {
        const blob = await resolveSessionStepImage(imageProtocolId, currentStep.image);
        if (cancelled || !blob) {
          return;
        }

        objectUrl = URL.createObjectURL(blob);
        setStepImageSrc(objectUrl);
      } catch {
        if (!cancelled) {
          setStepImageSrc(null);
        }
      }
    }

    void loadStepImage();

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [currentStep?.image, currentStep?.stepId, imageProtocolId]);

  const currentStepChecksCompleted = useMemo(() => {
    if (!currentStep) {
      return false;
    }
    const checked = new Set(checkedByStep[currentStep.stepId] ?? []);
    return currentStep.requiredChecks.every((item) => checked.has(item));
  }, [checkedByStep, currentStep]);

  const currentStepRecordReady = useMemo(() => {
    if (!currentStep?.recordSpec?.recordEvent) {
      return true;
    }

    const recordEvent = currentStep.recordSpec.recordEvent;
    const recordDraft = recordDraftByStep[currentStep.stepId] ?? createDefaultRecordDraft(recordEvent);
    let showLeftSummaryFields = true;
    let showRightSummaryFields = true;

    if (recordEvent === "session_summary") {
      const resolvedCurrentSlotIndex = sessionContext?.slotIndex ?? slotIndexParam;
      showLeftSummaryFields =
        resolvedCurrentSlotIndex === null ||
        slotBounds.leftmost === null ||
        resolvedCurrentSlotIndex === slotBounds.leftmost;
      showRightSummaryFields =
        resolvedCurrentSlotIndex === null ||
        slotBounds.rightmost === null ||
        resolvedCurrentSlotIndex === slotBounds.rightmost;
    }

    return (
      validateRecordDraft(recordEvent, recordDraft, {
        showLeftSummaryFields,
        showRightSummaryFields
      }) === null
    );
  }, [currentStep, recordDraftByStep, sessionContext?.slotIndex, slotBounds.leftmost, slotBounds.rightmost, slotIndexParam]);

  const canAdvanceCurrentStep = currentStepChecksCompleted && currentStepRecordReady;

  useEffect(() => {
    if (!currentStep || !sessionContext || isPreviewMode) {
      return;
    }

    async function syncStepId() {
      if (!sessionContext) return;
      const active = await readActiveSession();
      if (!active || active.sessionId !== sessionContext.sessionId) {
        return;
      }

      if (active.currentStepId === currentStep.stepId) {
        return;
      }

      await writeActiveSession({
        ...active,
        currentStepId: currentStep.stepId,
        updatedAtIso: new Date().toISOString()
      });
    }

    void syncStepId();
  }, [currentStep, isPreviewMode, sessionContext]);

  useEffect(() => {
    if (!sessionContext || !currentStep || isPreviewMode || !currentStep.alarmSpec) {
      return;
    }

    let cancelled = false;
    const runtimeSessionId = sessionContext.sessionId;

    async function syncStepEnterAlarm() {
      const latest = await getLatestAlarmForStep(runtimeSessionId, currentStep.stepId);
      if (cancelled) {
        return;
      }

      if (latest) {
        setAlarmByStepId((prev) => ({
          ...prev,
          [currentStep.stepId]: toAlarmState(latest)
        }));
        return;
      }

      const created = await ensureStepEnterAlarm({
        sessionId: runtimeSessionId,
        stepId: currentStep.stepId
      });

      if (!cancelled && created) {
        setAlarmByStepId((prev) => ({
          ...prev,
          [currentStep.stepId]: toAlarmState(created)
        }));
      }
    }

    void syncStepEnterAlarm();

    return () => {
      cancelled = true;
    };
  }, [currentStep, isPreviewMode, sessionContext]);

  useEffect(() => {
    if (!currentStep?.alarmSpec) {
      return;
    }

    const stepId = currentStep.stepId;
    const alarmState = alarmByStepId[stepId];
    if (!alarmState || alarmState.status === "acked") {
      return;
    }

    const minuteMs = Number.isFinite(ALARM_MINUTE_MS) && ALARM_MINUTE_MS > 0 ? ALARM_MINUTE_MS : 60_000;

    const timerId = window.setInterval(() => {
      setAlarmByStepId((prev) => {
        const state = prev[stepId];
        if (!state || state.status === "acked") {
          return prev;
        }

        const elapsedMs = Date.now() - state.startedAtMs;
        let nextNotifications = state.notifications;

        if (elapsedMs >= minuteMs * 5) {
          const additionalCycles = Math.floor((elapsedMs - minuteMs * 5) / (minuteMs * 3));
          nextNotifications = Math.max(nextNotifications, 3 + additionalCycles);
        } else if (elapsedMs >= minuteMs * 2) {
          nextNotifications = Math.max(nextNotifications, 2);
        }

        let nextStatus: AlarmState["status"] = state.status;
        if (elapsedMs >= minuteMs * 30 && state.status === "active") {
          nextStatus = "missed";
        }

        if (nextNotifications === state.notifications && nextStatus === state.status) {
          return prev;
        }

        if (state.jobId && nextNotifications !== state.notifications) {
          void markAlarmNotified(state.jobId, nextNotifications);
        }
        if (state.jobId && nextStatus === "missed" && state.status !== "missed") {
          void markAlarmMissed(state.jobId);
        }

        return {
          ...prev,
          [stepId]: {
            ...state,
            notifications: nextNotifications,
            status: nextStatus
          }
        };
      });
    }, 250);

    return () => {
      window.clearInterval(timerId);
    };
  }, [alarmByStepId, currentStep?.alarmSpec, currentStep?.stepId]);

  const saveRecordInline = useCallback(async (step: SessionSnapshotStep): Promise<boolean> => {
    if (!step.recordSpec) {
      return true;
    }

    const recordEvent = step.recordSpec.recordEvent;
    const recordDraft = recordDraftByStep[step.stepId] ?? createDefaultRecordDraft(recordEvent);
    let showLeftSummaryFields = true;
    let showRightSummaryFields = true;

    if (recordEvent === "session_summary") {
      const activeSession = await readActiveSession();
      const activeSlotIndex = sessionContext?.slotIndex ?? slotIndexParam ?? activeSession?.slotIndex ?? null;
      showLeftSummaryFields =
        activeSlotIndex === null || slotBounds.leftmost === null || activeSlotIndex === slotBounds.leftmost;
      showRightSummaryFields =
        activeSlotIndex === null || slotBounds.rightmost === null || activeSlotIndex === slotBounds.rightmost;
    }

    const validationError = validateRecordDraft(recordEvent, recordDraft, {
      showLeftSummaryFields,
      showRightSummaryFields
    });
    if (validationError) {
      setRecordErrorByStep((prev) => ({
        ...prev,
        [step.stepId]: validationError
      }));
      return false;
    }

    if (sessionContext && !isPreviewMode) {
      const payload: Record<string, unknown> = {
        ...recordDraft,
        value:
          parsePositiveNumber(recordDraft.drainWeightG) ??
          parsePositiveNumber(recordDraft.bagWeightG) ??
          null
      };

      if (recordEvent === "session_summary") {
        if (!showLeftSummaryFields) {
          delete payload.bpSys;
          delete payload.bpDia;
          delete payload.bodyWeightKg;
          delete payload.pulse;
          delete payload.bodyTempC;
          delete payload.exitSiteStatuses;
          delete payload.note;
        }
        if (!showRightSummaryFields) {
          delete payload.fluidIntakeMl;
          delete payload.urineMl;
          delete payload.stoolCountPerDay;
        }
      }

      await saveRecordForStep({
        sessionId: sessionContext.sessionId,
        stepId: step.stepId,
        recordEvent: step.recordSpec.recordEvent,
        recordExchangeNo: step.recordSpec.recordExchangeNo,
        recordUnit: step.recordSpec.recordUnit,
        payload
      });
      const saved = await isRecordSavedForStep(sessionContext.sessionId, step.stepId);
      if (saved) {
        setRecordCompletedByStep((prev) => ({
          ...prev,
          [step.stepId]: true
        }));
      }
    } else {
      setRecordCompletedByStep((prev) => ({
        ...prev,
        [step.stepId]: true
      }));
    }

    setRecordErrorByStep((prev) => ({
      ...prev,
      [step.stepId]: null
    }));

    return true;
  }, [isPreviewMode, recordDraftByStep, sessionContext, slotBounds.leftmost, slotBounds.rightmost, slotIndexParam]);

  const handleNext = useCallback(async () => {
    if (!currentStep || nextStepIndex < 0) {
      return;
    }
    void alarmPlayer.unlock();

    if (currentStep.recordSpec) {
      const saved = await saveRecordInline(currentStep);
      if (!saved) {
        return;
      }
    }

    if (sessionContext && !isPreviewMode) {
      const updated = await advanceStep({
        sessionId: sessionContext.sessionId,
        stepId: currentStep.stepId
      });
      await writeActiveSession({
        sessionId: updated.sessionId,
        slotIndex: updated.slotIndex,
        currentStepId: updated.currentStepId,
        protocolId: updated.protocolId,
        snapshotHash: updated.snapshotHash,
        mode: "runtime",
        updatedAtIso: new Date().toISOString()
      });
    }

    setCurrentIndex(nextStepIndex);
  }, [currentStep, isPreviewMode, nextStepIndex, saveRecordInline, sessionContext]);

  const handlePrev = useCallback(() => {
    if (!canGoPrev) {
      return;
    }
    void alarmPlayer.unlock();
    setCurrentIndex((value) => Math.max(value - 1, 0));
  }, [canGoPrev]);

  const handleCompleteSession = useCallback(async () => {
    isNavigatingRef.current = true;
    if (!sessionContext || isPreviewMode) {
      window.location.href = "/capd/home";
      return;
    }

    await completeSession(sessionContext.sessionId);
    await clearActiveSession();
    window.location.href = "/capd/home";
  }, [isPreviewMode, router, sessionContext]);

  const handlePause = useCallback(async () => {
    isNavigatingRef.current = true;
    // 中断: セッションを active のまま、スロットも「実施中」のまま Home に戻る
    window.location.href = "/capd/home";
  }, [router]);

  const handleCancelSession = useCallback(async () => {
    isNavigatingRef.current = true;
    if (!sessionContext || isPreviewMode) {
      window.location.href = "/capd/home";
      return;
    }

    await cancelSession(sessionContext.sessionId);
    await clearActiveSession();
    setCancelConfirmText("");
    setIsCancelDialogOpen(false);
    window.location.href = "/capd/home";
  }, [isPreviewMode, router, sessionContext]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || event.isComposing) {
        return;
      }
      if (isInteractiveTarget(event.target)) {
        return;
      }

      if (event.key === "Enter") {
        if (!canGoNext || !canAdvanceCurrentStep || loading || Boolean(error)) {
          return;
        }

        event.preventDefault();
        void handleNext();
        return;
      }

      if ((event.key === " " || event.code === "Space") && isMacPlatform()) {
        if (!currentStep || !currentStep.requiredChecks.length || loading || Boolean(error)) {
          return;
        }

        event.preventDefault();
        setCheckedByStep((prev) => {
          const checked = new Set(prev[currentStep.stepId] ?? []);
          const nextRequired = currentStep.requiredChecks.find((item) => !checked.has(item));
          if (!nextRequired) {
            return prev;
          }

          checked.add(nextRequired);
          return {
            ...prev,
            [currentStep.stepId]: Array.from(checked)
          };
        });
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [canAdvanceCurrentStep, canGoNext, currentStep, error, handleNext, loading]);

  useEffect(() => {
    if (loading || error || !currentStep?.recordSpec?.recordEvent) {
      return;
    }

    const rafId = window.requestAnimationFrame(() => {
      focusFirstRecordField(currentStep.stepId, currentStep.recordSpec?.recordEvent);
    });

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [currentStep?.recordSpec?.recordEvent, currentStep?.stepId, error, loading]);

  // --- Navigation guards: prevent reload / tab close during active session ---
  const isNavigatingRef = useRef(false);

  // --- Navigation guards: prevent reload / tab close during active session ---
  useEffect(() => {
    if (!sessionContext || isPreviewMode) return;
    const handler = (e: BeforeUnloadEvent) => {
      // 意図的な遷移（完了・中断・キャンセル）の場合はガードしない
      if (isNavigatingRef.current) return;
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [sessionContext, isPreviewMode]);

  // --- Navigation guards: prevent browser back / swipe-back during active session ---
  useEffect(() => {
    if (!sessionContext || isPreviewMode) return;
    // Push a dummy history entry so the first "back" stays on this page
    history.pushState({ sessionGuard: true }, "", location.href);
    const handler = () => {
      // Re-push to absorb the back navigation
      history.pushState({ sessionGuard: true }, "", location.href);
    };
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, [sessionContext, isPreviewMode]);

  const setCheckForStep = (stepId: string, checkLabel: string, nextChecked: boolean) => {
    setCheckedByStep((prev) => {
      const checked = new Set(prev[stepId] ?? []);
      if (nextChecked) {
        checked.add(checkLabel);
      } else {
        checked.delete(checkLabel);
      }
      return {
        ...prev,
        [stepId]: Array.from(checked)
      };
    });
  };

  const updateRecordDraft = useCallback(
    (stepId: string, updater: (current: RecordDraft) => RecordDraft) => {
      setRecordDraftByStep((prev) => {
        const stepRecordEvent = steps.find((step) => step.stepId === stepId)?.recordSpec?.recordEvent ?? "session_summary";
        const current = prev[stepId] ?? createDefaultRecordDraft(stepRecordEvent);
        return {
          ...prev,
          [stepId]: updater(current)
        };
      });
      setRecordErrorByStep((prev) => ({
        ...prev,
        [stepId]: null
      }));
    },
    [steps]
  );

  const acknowledgeStepAlarm = useCallback(
    async (stepId: string) => {
      const state = alarmByStepId[stepId];
      if (!state) {
        return;
      }

      if (state.jobId) {
        const next = await acknowledgeAlarm(state.jobId);
        if (next) {
          setAlarmByStepId((prev) => ({
            ...prev,
            [stepId]: toAlarmState(next)
          }));
          return;
        }
      }

      setAlarmByStepId((prev) => ({
        ...prev,
        [stepId]: {
          ...state,
          status: "acked",
          ackedAtIso: new Date().toISOString()
        }
      }));
    },
    [alarmByStepId]
  );

  if (!steps.length) {
    return (
      <CapdShell>
        <section className="overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="space-y-2 p-5">
            <h2 className="text-xl font-semibold tracking-tight">
              {loading ? "手順を読み込み中です" : "手順を表示できません"}
            </h2>
            <p className="text-sm text-muted-foreground">{error ?? "セッションを読み込んでいます。"}</p>
          </div>
        </section>
      </CapdShell>
    );
  }

  const step = steps[currentIndex];
  const stateBadgeStyle = stateBadgeByLabel[step.state] ?? null;
  const stepChecks = new Set(checkedByStep[step.stepId] ?? []);
  const stepCanGoNext = step.nextStepId ? stepIndexById.has(step.nextStepId) : false;
  const stepCanGoPrev = currentIndex > 0;
  const stepChecksCompleted = step.requiredChecks.every((checkItem) => stepChecks.has(checkItem));
  const stepRecordRequired = Boolean(step.recordSpec?.recordEvent);
  const stepRecordDraft = stepRecordRequired
    ? recordDraftByStep[step.stepId] ?? createDefaultRecordDraft(step.recordSpec?.recordEvent ?? "")
    : null;
  const inlineRecordDraft = stepRecordDraft ?? createDefaultRecordDraft(step.recordSpec?.recordEvent ?? "");
  const stepRecordError = recordErrorByStep[step.stepId];
  const resolvedCurrentSlotIndex = sessionContext?.slotIndex ?? slotIndexParam;
  const showSummaryLeftFields =
    step.recordSpec?.recordEvent === "session_summary"
      ? resolvedCurrentSlotIndex === null ||
      slotBounds.leftmost === null ||
      resolvedCurrentSlotIndex === slotBounds.leftmost
      : false;
  const showSummaryRightFields =
    step.recordSpec?.recordEvent === "session_summary"
      ? resolvedCurrentSlotIndex === null ||
      slotBounds.rightmost === null ||
      resolvedCurrentSlotIndex === slotBounds.rightmost
      : false;
  const stepRecordValidationError =
    step.recordSpec?.recordEvent && stepRecordDraft
      ? validateRecordDraft(step.recordSpec.recordEvent, stepRecordDraft, {
        showLeftSummaryFields: showSummaryLeftFields,
        showRightSummaryFields: showSummaryRightFields
      })
      : null;
  const stepRecordReady = !stepRecordRequired || stepRecordValidationError === null;
  const alarmState = alarmByStepId[step.stepId];
  const canAdvanceStep = stepChecksCompleted && stepRecordReady;
  const canFinish = !stepCanGoNext && Boolean(sessionContext || isPreviewMode);
  const stepBlockReason = !stepChecksCompleted
    ? "必須チェックを完了してください。"
    : !stepRecordReady
      ? "記録入力を完了してください。"
      : null;

  return (
    <CapdShell>
      <section className="overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="grid gap-0 md:grid-cols-[minmax(0,1.35fr)_minmax(340px,1fr)]">
          <div className="border-b p-3 md:border-b-0 md:p-5">
            <div className="aspect-square w-full rounded-md border bg-muted p-4 text-sm text-muted-foreground">
              {!loading && !error && stepImageSrc ? (
                <img
                  alt={step.title || "手順画像"}
                  className="h-full w-full rounded-sm object-cover"
                  src={stepImageSrc}
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                  <p className="text-sm">正方形画像 (1:1) は未登録です</p>
                  {step.image ? <p className="text-xs">画像: {step.image}</p> : null}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 p-4 md:p-5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-wrap gap-2">
                <Badge className="h-8 border-border px-3 text-xs font-semibold">{`フェーズ: ${step.phase || "-"}`}</Badge>
                {stateBadgeStyle ? (
                  <Badge
                    variant="outline"
                    className={cn("h-8 gap-1.5 border px-3 text-xs font-semibold", stateBadgeStyle.className)}
                  >
                    <stateBadgeStyle.icon className="h-3.5 w-3.5" />
                    {step.state}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="h-8 px-3 text-xs font-semibold">
                    {`状態: ${step.state || "-"}`}
                  </Badge>
                )}
              </div>

              {!isPreviewMode && sessionContext ? (
                <div className="relative">
                  <button
                    type="button"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-sm text-muted-foreground hover:bg-muted"
                    aria-label="セッション操作メニュー"
                    aria-haspopup="menu"
                    aria-expanded={isUtilityMenuOpen}
                    onClick={() => setIsUtilityMenuOpen((current) => !current)}
                  >
                    •••
                  </button>
                  {isUtilityMenuOpen ? (
                    <div className="absolute right-0 top-9 z-20 min-w-[190px] rounded-md border bg-background p-1 shadow-sm">
                      <button
                        type="button"
                        className="w-full rounded-sm px-2 py-1 text-left text-sm hover:bg-muted"
                        onClick={() => {
                          setIsUtilityMenuOpen(false);
                          void handlePause();
                        }}
                      >
                        中断（途中から再開可能）
                      </button>
                      <button
                        type="button"
                        className="w-full rounded-sm px-2 py-1 text-left text-sm text-destructive hover:bg-muted"
                        onClick={() => {
                          setIsUtilityMenuOpen(false);
                          setIsCancelDialogOpen(true);
                        }}
                      >
                        キャンセル（保存せず終了）
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-semibold tracking-tight">{formatStepTitle(step)}</h2>
              {step.displayText ? <p className="whitespace-pre-line text-sm text-muted-foreground">{step.displayText}</p> : null}
            </div>

            {step.warningText ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <div className="flex items-center gap-2 font-medium">
                  <DangerTriangle className="h-4 w-4" />
                  {step.warningText}
                </div>
              </div>
            ) : null}

            {step.requiredChecks.length ? (
              <div className="rounded-lg border p-4 text-sm">
                <p className="font-medium">必須チェック</p>
                <div className="mt-2 space-y-2">
                  {step.requiredChecks.map((checkItem) => {
                    const checked = stepChecks.has(checkItem);
                    return (
                      <label key={checkItem} className="flex items-start gap-2">
                        <Checkbox
                          checked={checked}
                          className="mt-0.5"
                          onCheckedChange={(nextChecked) => setCheckForStep(step.stepId, checkItem, nextChecked === true)}
                        />
                        <span className="leading-5">{checkItem}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {stepRecordRequired ? (
              <div className="rounded-lg border p-4 text-sm">
                <div className="space-y-3" data-record-form-step-id={step.stepId}>
                  {step.recordSpec?.recordEvent === "drain_appearance" ? (
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium" htmlFor={`record-drain-appearance-${step.stepId}`}>
                        排液の確認
                      </label>
                      <DrainAppearanceSelect
                        id={`record-drain-appearance-${step.stepId}`}
                        value={inlineRecordDraft.drainAppearance ?? ""}
                        onChange={(v) =>
                          updateRecordDraft(step.stepId, (current) => ({
                            ...current,
                            drainAppearance: v
                          }))
                        }
                      />
                    </div>
                  ) : null}

                  {step.recordSpec?.recordEvent === "drain_weight_g" ? (
                    <NumericField
                      label="排液量"
                      unit="g"
                      id={`record-drain-weight-${step.stepId}`}
                      value={inlineRecordDraft.drainWeightG ?? ""}
                      onChange={(v) =>
                        updateRecordDraft(step.stepId, (current) => ({
                          ...current,
                          drainWeightG: v
                        }))
                      }
                      min={0}
                      inputClassName="h-9 w-full rounded-md border bg-background px-3 text-sm"
                      className="space-y-1.5"
                    />
                  ) : null}

                  {step.recordSpec?.recordEvent === "bag_weight_g" ? (
                    <NumericField
                      label="注液量"
                      unit="g"
                      id={`record-bag-weight-${step.stepId}`}
                      value={inlineRecordDraft.bagWeightG ?? ""}
                      onChange={(v) =>
                        updateRecordDraft(step.stepId, (current) => ({
                          ...current,
                          bagWeightG: v
                        }))
                      }
                      min={0}
                      inputClassName="h-9 w-full rounded-md border bg-background px-3 text-sm"
                      className="space-y-1.5"
                    />
                  ) : null}

                  {step.recordSpec?.recordEvent === "session_summary" ? (
                    <>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {showSummaryLeftFields ? (
                          <>
                            <NumericField label="血圧上" unit="mmHg" id={`record-bp-sys-${step.stepId}`}
                              value={inlineRecordDraft.bpSys ?? ""}
                              onChange={(v) => updateRecordDraft(step.stepId, (c) => ({ ...c, bpSys: v }))} min={0} />
                            <NumericField label="血圧下" unit="mmHg" id={`record-bp-dia-${step.stepId}`}
                              value={inlineRecordDraft.bpDia ?? ""}
                              onChange={(v) => updateRecordDraft(step.stepId, (c) => ({ ...c, bpDia: v }))} min={0} />
                            <NumericField label="脈拍" unit="回/分" id={`record-pulse-${step.stepId}`}
                              value={inlineRecordDraft.pulse ?? ""}
                              onChange={(v) => updateRecordDraft(step.stepId, (c) => ({ ...c, pulse: v }))} min={0} />
                            <NumericField label="体重" unit="kg" mode="decimal" step="0.1" id={`record-body-weight-${step.stepId}`}
                              value={inlineRecordDraft.bodyWeightKg ?? ""}
                              onChange={(v) => updateRecordDraft(step.stepId, (c) => ({ ...c, bodyWeightKg: v }))} min={0} />
                            <NumericField label="体温" unit="℃" mode="decimal" step="0.1" id={`record-body-temp-${step.stepId}`}
                              value={inlineRecordDraft.bodyTempC ?? ""}
                              onChange={(v) => updateRecordDraft(step.stepId, (c) => ({ ...c, bodyTempC: v }))} min={0} />
                          </>
                        ) : null}
                        {showSummaryRightFields ? (
                          <>
                            <NumericField label="飲水量" unit="ml" id={`record-fluid-intake-${step.stepId}`}
                              value={inlineRecordDraft.fluidIntakeMl ?? ""}
                              onChange={(v) => updateRecordDraft(step.stepId, (c) => ({ ...c, fluidIntakeMl: v }))} min={0} />
                            <NumericField label="尿量" unit="ml" id={`record-urine-${step.stepId}`}
                              value={inlineRecordDraft.urineMl ?? ""}
                              onChange={(v) => updateRecordDraft(step.stepId, (c) => ({ ...c, urineMl: v }))} min={0} />
                            <NumericField label="排便回数" unit="回" id={`record-stool-count-${step.stepId}`}
                              value={inlineRecordDraft.stoolCountPerDay ?? ""}
                              onChange={(v) => updateRecordDraft(step.stepId, (c) => ({ ...c, stoolCountPerDay: v }))} min={0} />
                          </>
                        ) : null}
                      </div>

                      {showSummaryLeftFields ? (
                        <>
                          <fieldset className="space-y-2">
                            <legend className="text-sm font-medium">出口部状態（1つ以上選択）</legend>
                            <ExitSiteStatusCheckboxes
                              value={inlineRecordDraft.exitSiteStatuses}
                              onChange={(v) =>
                                updateRecordDraft(step.stepId, (current) => ({
                                  ...current,
                                  exitSiteStatuses: v
                                }))
                              }
                              exclusiveNormal
                              className="grid gap-2 sm:grid-cols-2"
                            />
                          </fieldset>

                          <div className="space-y-1.5">
                            <label className="text-sm font-medium" htmlFor={`record-summary-note-${step.stepId}`}>
                              備考（任意）
                            </label>
                            <textarea
                              id={`record-summary-note-${step.stepId}`}
                              className="min-h-[88px] w-full rounded-md border bg-background px-3 py-2 text-sm"
                              value={inlineRecordDraft.note ?? ""}
                              onChange={(event) =>
                                updateRecordDraft(step.stepId, (current) => ({
                                  ...current,
                                  note: event.target.value
                                }))
                              }
                            />
                          </div>
                        </>
                      ) : null}

                      {!showSummaryLeftFields && !showSummaryRightFields ? (
                        <p className="text-sm text-muted-foreground">このスロットではセッションサマリ入力項目はありません。</p>
                      ) : null}
                    </>
                  ) : null}

                  {stepRecordError ? <p className="text-sm text-destructive">{stepRecordError}</p> : null}
                </div>
              </div>
            ) : null}

            {step.alarmSpec && step.alarmSpec.alarmDurationMin ? (
              <div data-testid={`alarm-${step.stepId}`} className="py-2">
                {alarmState?.status === "acked" ? (
                  <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 font-medium text-emerald-700">
                    <Bell className="h-4 w-4" />
                    {`アラーム確認済み (acked_at: ${alarmState.ackedAtIso ? new Date(alarmState.ackedAtIso).toLocaleTimeString() : "-"})`}
                  </div>
                ) : (
                  <SessionStepTimer
                    startedAtMs={alarmState?.startedAtMs ?? Date.now()}
                    durationMinutes={step.alarmSpec.alarmDurationMin}
                    onAcknowledge={() => void acknowledgeStepAlarm(step.stepId)}
                    className="w-full"
                  />
                )}
              </div>
            ) : null}

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {stepBlockReason ? <p className="text-sm text-destructive">{stepBlockReason}</p> : null}

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="w-full"
                disabled={!stepCanGoPrev || loading || Boolean(error)}
                onClick={handlePrev}
              >
                戻る
              </Button>
              <Button
                data-next-step-btn
                className="w-full"
                disabled={loading || Boolean(error) || !canAdvanceStep || (!stepCanGoNext && !canFinish)}
                onClick={() => {
                  if (stepCanGoNext) {
                    void handleNext();
                    return;
                  }
                  void handleCompleteSession();
                }}
              >
                {stepCanGoNext ? "次へ" : "この手順で終了"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {isCancelDialogOpen ? (
        <ModalShell title="セッションをキャンセル" onClose={() => setIsCancelDialogOpen(false)}>
          <div className="space-y-4 px-5 py-4 text-sm">
            <p className="text-muted-foreground">
              このセッションの全ての入力データを削除し、スロットを「未実施」に戻します。この操作は取り消せません。
            </p>
            <label className="space-y-1.5">
              <span className="text-sm font-medium">確認のため「キャンセル」と入力してください</span>
              <input
                type="text"
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                value={cancelConfirmText}
                onChange={(event) => setCancelConfirmText(event.target.value)}
              />
            </label>
          </div>
          <div className="flex justify-end gap-2 border-t px-5 py-4">
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
              戻る
            </Button>
            <Button
              variant="destructive"
              disabled={cancelConfirmText.trim() !== "キャンセル"}
              onClick={() => void handleCancelSession()}
            >
              キャンセルする
            </Button>
          </div>
        </ModalShell>
      ) : null}
    </CapdShell>
  );
}

export default function SessionPage() {
  return (
    <Suspense
      fallback={
        <CapdShell>
          <section className="overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="space-y-2 p-5">
              <h2 className="text-xl font-semibold tracking-tight">手順を読み込み中です</h2>
              <p className="text-sm text-muted-foreground">セッションを読み込んでいます。</p>
            </div>
          </section>
        </CapdShell>
      }
    >
      <SessionPageContent />
    </Suspense>
  );
}
