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
import { Suspense, type ComponentType, type ReactNode, useCallback, useEffect, useMemo, useState } from "react";

import {
  clearActiveSession,
  readActiveSession,
  readProcedureSlots,
  writeActiveSession,
  writeProcedureSlots
} from "@/components/preview/session-slot-store";
import { PreviewShell } from "@/components/preview/shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type CarouselApi, Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { parseProtocolCsv, type ProtocolStep } from "@/lib/protocol-csv";

type StateBadgeStyle = {
  icon: ComponentType<{ className?: string }>;
  className: string;
};

type SessionContext = {
  sessionId: string;
  slotIndex: number;
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

const drainAppearanceOptions = ["透明", "やや混濁", "混濁", "血性", "その他"] as const;
const exitSiteStatusOptions = ["正常", "赤み", "痛み", "はれ", "かさぶた", "じゅくじゅく", "出血", "膿"] as const;

const recordEventLabel: Record<string, string> = {
  drain_appearance: "排液の確認",
  drain_weight_g: "排液量",
  bag_weight_g: "注液量",
  session_summary: "セッションサマリ"
};

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

function encodePath(path: string): string {
  return path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function formatStepTitle(step: ProtocolStep): string {
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
      drainAppearance: "",
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
    bpSys: "",
    bpDia: "",
    bodyWeightKg: "",
    pulse: "",
    bodyTempC: "",
    fluidIntakeMl: "",
    urineMl: "",
    stoolCountPerDay: "",
    exitSiteStatuses: [],
    note: ""
  };
}

function parsePositiveNumber(value: string | undefined): number | null {
  if (!value) {
    return null;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

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

function SessionAPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionIdParam = searchParams.get("sessionId");
  const slotIndexParam = parseSlotIndex(searchParams.get("slot"));

  const [steps, setSteps] = useState<ProtocolStep[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [checkedByStep, setCheckedByStep] = useState<Record<string, string[]>>({});
  const [imageLoadFailedByStep, setImageLoadFailedByStep] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [sessionContext, setSessionContext] = useState<SessionContext | null>(null);
  const [isUtilityMenuOpen, setIsUtilityMenuOpen] = useState(false);
  const [isAbortDialogOpen, setIsAbortDialogOpen] = useState(false);
  const [abortConfirmText, setAbortConfirmText] = useState("");
  const [recordDraftByStep, setRecordDraftByStep] = useState<Record<string, RecordDraft>>({});
  const [recordCompletedByStep, setRecordCompletedByStep] = useState<Record<string, boolean>>({});
  const [recordModalStepId, setRecordModalStepId] = useState<string | null>(null);
  const [recordModalError, setRecordModalError] = useState<string | null>(null);

  useEffect(() => {
    const activeSession = readActiveSession();

    if (sessionIdParam && slotIndexParam !== null) {
      const nextCurrentStepId = activeSession?.sessionId === sessionIdParam ? activeSession.currentStepId : "step_021";
      writeActiveSession({
        sessionId: sessionIdParam,
        slotIndex: slotIndexParam,
        currentStepId: nextCurrentStepId,
        updatedAtIso: new Date().toISOString()
      });
      setSessionContext({ sessionId: sessionIdParam, slotIndex: slotIndexParam });
      return;
    }

    if (activeSession) {
      setSessionContext({ sessionId: activeSession.sessionId, slotIndex: activeSession.slotIndex });
      return;
    }

    setSessionContext(null);
  }, [sessionIdParam, slotIndexParam]);

  useEffect(() => {
    let cancelled = false;

    async function loadProtocol() {
      setLoading(true);
      try {
        const response = await fetch("/protocols/session-a.csv", { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`CSV読み込み失敗: ${response.status}`);
        }

        const csvText = await response.text();
        const parsedSteps = parseProtocolCsv(csvText);
        if (!parsedSteps.length) {
          throw new Error("CSVにstep行がありません。");
        }

        if (cancelled) {
          return;
        }

        const activeSession = readActiveSession();
        const targetStepId =
          sessionContext && activeSession?.sessionId === sessionContext.sessionId
            ? activeSession.currentStepId
            : "step_021";

        const initialIndex = parsedSteps.findIndex((step) => step.stepId === targetStepId);
        setSteps(parsedSteps);
        setCurrentIndex(initialIndex >= 0 ? initialIndex : 0);
        setError(null);
      } catch (loadError) {
        if (cancelled) {
          return;
        }

        setSteps([]);
        setCurrentIndex(0);
        setError(loadError instanceof Error ? loadError.message : "CSV読み込みに失敗しました。");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProtocol();

    return () => {
      cancelled = true;
    };
  }, [sessionContext]);

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
  const recordModalStep = useMemo(
    () => (recordModalStepId ? steps.find((step) => step.stepId === recordModalStepId) ?? null : null),
    [recordModalStepId, steps]
  );
  const recordModalDraft = useMemo(() => {
    if (!recordModalStep) {
      return null;
    }
    return recordDraftByStep[recordModalStep.stepId] ?? createDefaultRecordDraft(recordModalStep.recordEvent);
  }, [recordDraftByStep, recordModalStep]);

  const canGoNext = nextStepIndex >= 0;
  const canGoPrev = currentIndex > 0;
  const currentStepChecksCompleted = useMemo(() => {
    if (!currentStep) {
      return false;
    }
    const checked = new Set(checkedByStep[currentStep.stepId] ?? []);
    return currentStep.requiredChecks.every((item) => checked.has(item));
  }, [checkedByStep, currentStep]);
  const currentStepRecordCompleted = useMemo(() => {
    if (!currentStep?.recordEvent) {
      return true;
    }
    return Boolean(recordCompletedByStep[currentStep.stepId]);
  }, [currentStep, recordCompletedByStep]);
  const canAdvanceCurrentStep = currentStepChecksCompleted && currentStepRecordCompleted;

  useEffect(() => {
    if (!currentStep || !sessionContext) {
      return;
    }

    const activeSession = readActiveSession();
    if (!activeSession || activeSession.sessionId !== sessionContext.sessionId) {
      return;
    }

    if (activeSession.currentStepId === currentStep.stepId) {
      return;
    }

    writeActiveSession({
      ...activeSession,
      currentStepId: currentStep.stepId,
      updatedAtIso: new Date().toISOString()
    });
  }, [currentStep, sessionContext]);

  useEffect(() => {
    if (!carouselApi) {
      return;
    }

    const onSelect = () => {
      setCurrentIndex(carouselApi.selectedScrollSnap());
    };

    onSelect();
    carouselApi.on("select", onSelect);
    carouselApi.on("reInit", onSelect);

    return () => {
      carouselApi.off("select", onSelect);
      carouselApi.off("reInit", onSelect);
    };
  }, [carouselApi]);

  useEffect(() => {
    if (!carouselApi || !steps.length) {
      return;
    }

    const safeIndex = Math.max(0, Math.min(currentIndex, steps.length - 1));
    carouselApi.scrollTo(safeIndex, true);
    setCurrentIndex(safeIndex);
  }, [carouselApi, steps.length]);

  useEffect(() => {
    setIsUtilityMenuOpen(false);
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (nextStepIndex < 0) {
      return;
    }

    if (carouselApi) {
      carouselApi.scrollTo(nextStepIndex);
      return;
    }

    setCurrentIndex(nextStepIndex);
  }, [carouselApi, nextStepIndex]);

  const handlePrev = useCallback(() => {
    if (!canGoPrev) {
      return;
    }

    const prevIndex = Math.max(currentIndex - 1, 0);

    if (carouselApi) {
      carouselApi.scrollTo(prevIndex);
      return;
    }

    setCurrentIndex(prevIndex);
  }, [canGoPrev, carouselApi, currentIndex]);

  const handleCompleteSession = useCallback(() => {
    if (!sessionContext) {
      return;
    }

    const slots = readProcedureSlots();
    const targetSlot = slots[sessionContext.slotIndex];
    if (targetSlot) {
      slots[sessionContext.slotIndex] = { ...targetSlot, status: "実施済み" };
      writeProcedureSlots(slots);
    }

    const activeSession = readActiveSession();
    if (activeSession?.sessionId === sessionContext.sessionId) {
      clearActiveSession();
    }

    router.push("/ui-preview/home-a");
  }, [router, sessionContext]);

  const handleEmergencyAbort = useCallback(() => {
    if (!sessionContext) {
      return;
    }

    const slots = readProcedureSlots();
    const targetSlot = slots[sessionContext.slotIndex];
    if (targetSlot) {
      slots[sessionContext.slotIndex] = { ...targetSlot, status: "未実施" };
      writeProcedureSlots(slots);
    }

    const activeSession = readActiveSession();
    if (activeSession?.sessionId === sessionContext.sessionId) {
      clearActiveSession();
    }

    setAbortConfirmText("");
    setIsAbortDialogOpen(false);
    router.push("/ui-preview/home-a");
  }, [router, sessionContext]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Enter" || event.repeat || event.isComposing) {
        return;
      }
      if (isInteractiveTarget(event.target)) {
        return;
      }
      if (!canGoNext || !canAdvanceCurrentStep || loading || Boolean(error)) {
        return;
      }

      event.preventDefault();
      handleNext();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [canAdvanceCurrentStep, canGoNext, error, handleNext, loading]);

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

  const openRecordModal = useCallback((step: ProtocolStep) => {
    setRecordDraftByStep((prev) => {
      if (prev[step.stepId]) {
        return prev;
      }
      return {
        ...prev,
        [step.stepId]: createDefaultRecordDraft(step.recordEvent)
      };
    });
    setRecordModalError(null);
    setRecordModalStepId(step.stepId);
  }, []);

  const closeRecordModal = useCallback(() => {
    setRecordModalStepId(null);
    setRecordModalError(null);
  }, []);

  const updateRecordDraft = useCallback(
    (stepId: string, updater: (current: RecordDraft) => RecordDraft) => {
      setRecordDraftByStep((prev) => {
        const stepRecordEvent = steps.find((step) => step.stepId === stepId)?.recordEvent ?? "session_summary";
        const current = prev[stepId] ?? createDefaultRecordDraft(stepRecordEvent);
        return {
          ...prev,
          [stepId]: updater(current)
        };
      });
    },
    [steps]
  );

  const saveRecordModal = useCallback(() => {
    if (!recordModalStep || !recordModalDraft) {
      return;
    }

    if (recordModalStep.recordEvent === "drain_appearance") {
      if (
        !recordModalDraft.drainAppearance ||
        !drainAppearanceOptions.some((option) => option === recordModalDraft.drainAppearance)
      ) {
        setRecordModalError("排液の確認を選択してください。");
        return;
      }
    } else if (recordModalStep.recordEvent === "drain_weight_g") {
      if (parsePositiveNumber(recordModalDraft.drainWeightG) === null) {
        setRecordModalError("排液量(g)を正しく入力してください。");
        return;
      }
    } else if (recordModalStep.recordEvent === "bag_weight_g") {
      if (parsePositiveNumber(recordModalDraft.bagWeightG) === null) {
        setRecordModalError("注液量(g)を正しく入力してください。");
        return;
      }
    } else if (recordModalStep.recordEvent === "session_summary") {
      const requiredSummaryFields = [
        parsePositiveNumber(recordModalDraft.bpSys),
        parsePositiveNumber(recordModalDraft.bpDia),
        parsePositiveNumber(recordModalDraft.bodyWeightKg),
        parsePositiveNumber(recordModalDraft.pulse),
        parsePositiveNumber(recordModalDraft.bodyTempC),
        parsePositiveNumber(recordModalDraft.fluidIntakeMl),
        parsePositiveNumber(recordModalDraft.urineMl),
        parsePositiveNumber(recordModalDraft.stoolCountPerDay)
      ];
      const hasAllRequiredNumbers = requiredSummaryFields.every((value) => value !== null);
      if (!hasAllRequiredNumbers) {
        setRecordModalError("血圧/体重/脈拍/体温/飲水量/尿量/排便回数を入力してください。");
        return;
      }
      if (!recordModalDraft.exitSiteStatuses.length) {
        setRecordModalError("出口部状態を1つ以上選択してください。");
        return;
      }
    }

    setRecordCompletedByStep((prev) => ({
      ...prev,
      [recordModalStep.stepId]: true
    }));
    setRecordModalError(null);
    setRecordModalStepId(null);
  }, [recordModalDraft, recordModalStep]);

  if (!steps.length) {
    return (
      <PreviewShell>
        <section className="overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="space-y-2 p-5">
            <h2 className="text-xl font-semibold tracking-tight">
              {loading ? "手順を読み込み中です" : "手順を表示できません"}
            </h2>
            <p className="text-sm text-muted-foreground">{error ?? "CSVを読み込んでいます。"}</p>
          </div>
        </section>
      </PreviewShell>
    );
  }

  return (
    <PreviewShell>
      <Carousel className="w-full" opts={{ watchDrag: false }} setApi={setCarouselApi}>
        <CarouselContent className="-ml-2">
          {steps.map((step, index) => {
            const stateBadgeStyle = stateBadgeByLabel[step.state] ?? null;
            const stepChecks = new Set(checkedByStep[step.stepId] ?? []);
            const imageSrc = step.image ? `/protocols/images/${encodePath(step.image)}` : null;
            const imageLoadFailed = Boolean(imageLoadFailedByStep[step.stepId]);
            const stepCanGoNext = step.nextStepId ? stepIndexById.has(step.nextStepId) : false;
            const stepCanGoPrev = index > 0;
            const isCurrent = index === currentIndex;
            const stepChecksCompleted = step.requiredChecks.every((checkItem) => stepChecks.has(checkItem));
            const stepRecordRequired = Boolean(step.recordEvent);
            const stepRecordCompleted = !stepRecordRequired || Boolean(recordCompletedByStep[step.stepId]);
            const canAdvanceStep = stepChecksCompleted && stepRecordCompleted;
            const canFinish = !stepCanGoNext && Boolean(sessionContext);
            const stepBlockReason = !stepChecksCompleted
              ? "必須チェックを完了してください。"
              : !stepRecordCompleted
                ? "記録入力を完了してください。"
                : null;

            return (
              <CarouselItem key={step.stepId} className="pl-2">
                <section className="overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm">
                  <div className="grid gap-0 md:grid-cols-[minmax(0,1.35fr)_minmax(340px,1fr)]">
                    <div className="border-b p-3 md:border-b-0 md:p-5">
                      <div className="aspect-square w-full rounded-md border bg-muted p-4 text-sm text-muted-foreground">
                        {!loading && !error && imageSrc && !imageLoadFailed ? (
                          <img
                            alt={step.title || "手順画像"}
                            className="h-full w-full rounded-sm object-cover"
                            src={imageSrc}
                            onError={() => {
                              setImageLoadFailedByStep((prev) => ({
                                ...prev,
                                [step.stepId]: true
                              }));
                            }}
                          />
                        ) : (
                          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                            <p className="text-sm">正方形画像 (1:1) プレースホルダ</p>
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

                        {isCurrent && sessionContext ? (
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
                                  className="w-full rounded-sm px-2 py-1 text-left text-sm text-destructive hover:bg-muted"
                                  onClick={() => {
                                    setIsUtilityMenuOpen(false);
                                    setIsAbortDialogOpen(true);
                                  }}
                                >
                                  セッションを中断（非常用）
                                </button>
                              </div>
                            ) : null}
                          </div>
                        ) : null}
                      </div>

                      <div className="space-y-1">
                        <h2 className="text-xl font-semibold tracking-tight">{formatStepTitle(step)}</h2>
                        <p className="whitespace-pre-line text-sm text-muted-foreground">
                          {step.displayText || "CSVの表示テキストがここに表示されます。"}
                        </p>
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
                                    onCheckedChange={(nextChecked) =>
                                      setCheckForStep(step.stepId, checkItem, nextChecked === true)
                                    }
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
                          <p className="font-medium">記録入力（必須）</p>
                          <p className="mt-1 text-xs text-muted-foreground">{recordEventLabel[step.recordEvent] ?? step.recordEvent}</p>
                          <div className="mt-3 flex items-center gap-2">
                            <Button size="sm" variant={stepRecordCompleted ? "secondary" : "default"} onClick={() => openRecordModal(step)}>
                              {stepRecordCompleted ? "記録を確認/編集" : "記録を入力"}
                            </Button>
                            <span className={cn("text-xs", stepRecordCompleted ? "text-emerald-700" : "text-muted-foreground")}>
                              {stepRecordCompleted ? "入力済み" : "未入力"}
                            </span>
                          </div>
                        </div>
                      ) : null}

                      {step.alarmId && step.alarmDurationMin ? (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">
                          <div className="flex items-center gap-2 font-medium">
                            <Bell className="h-4 w-4" />
                            {`待機アラーム: ${step.alarmDurationMin}分経過 [確認する]`}
                          </div>
                        </div>
                      ) : null}

                      {error && isCurrent ? <p className="text-sm text-destructive">{error}</p> : null}
                      {isCurrent && stepBlockReason ? <p className="text-sm text-destructive">{stepBlockReason}</p> : null}

                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          className="w-full"
                          disabled={!isCurrent || !stepCanGoPrev || loading || Boolean(error)}
                          onClick={handlePrev}
                        >
                          戻る
                        </Button>
                        <Button
                          className="w-full"
                          disabled={
                            !isCurrent || loading || Boolean(error) || !canAdvanceStep || (!stepCanGoNext && !canFinish)
                          }
                          onClick={() => {
                            if (stepCanGoNext) {
                              handleNext();
                              return;
                            }
                            handleCompleteSession();
                          }}
                        >
                          {stepCanGoNext ? "次へ" : "この手順で終了"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </section>
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>

      {recordModalStep && recordModalDraft ? (
        <ModalShell title={`${recordEventLabel[recordModalStep.recordEvent] ?? "記録入力"}`} onClose={closeRecordModal}>
          <div className="space-y-4 px-5 py-4 text-sm">
            {recordModalStep.recordEvent === "drain_appearance" ? (
              <>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium" htmlFor="record-drain-appearance">
                    排液の確認
                  </label>
                  <select
                    id="record-drain-appearance"
                    className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                    value={recordModalDraft.drainAppearance ?? ""}
                    onChange={(event) =>
                      updateRecordDraft(recordModalStep.stepId, (current) => ({
                        ...current,
                        drainAppearance: event.target.value
                      }))
                    }
                  >
                    <option value="">選択してください</option>
                    {drainAppearanceOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium" htmlFor="record-drain-note">
                    備考（任意）
                  </label>
                  <textarea
                    id="record-drain-note"
                    className="min-h-[88px] w-full rounded-md border bg-background px-3 py-2 text-sm"
                    value={recordModalDraft.note ?? ""}
                    onChange={(event) =>
                      updateRecordDraft(recordModalStep.stepId, (current) => ({
                        ...current,
                        note: event.target.value
                      }))
                    }
                  />
                </div>
              </>
            ) : null}

            {recordModalStep.recordEvent === "drain_weight_g" ? (
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="record-drain-weight">
                  排液量(g)
                </label>
                <input
                  id="record-drain-weight"
                  type="number"
                  min={0}
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                  value={recordModalDraft.drainWeightG ?? ""}
                  onChange={(event) =>
                    updateRecordDraft(recordModalStep.stepId, (current) => ({
                      ...current,
                      drainWeightG: event.target.value
                    }))
                  }
                />
              </div>
            ) : null}

            {recordModalStep.recordEvent === "bag_weight_g" ? (
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="record-bag-weight">
                  注液量(g)
                </label>
                <input
                  id="record-bag-weight"
                  type="number"
                  min={0}
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                  value={recordModalDraft.bagWeightG ?? ""}
                  onChange={(event) =>
                    updateRecordDraft(recordModalStep.stepId, (current) => ({
                      ...current,
                      bagWeightG: event.target.value
                    }))
                  }
                />
              </div>
            ) : null}

            {recordModalStep.recordEvent === "session_summary" ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium" htmlFor="summary-bp-sys">
                    血圧上
                  </label>
                  <input
                    id="summary-bp-sys"
                    type="number"
                    min={0}
                    className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                    value={recordModalDraft.bpSys ?? ""}
                    onChange={(event) =>
                      updateRecordDraft(recordModalStep.stepId, (current) => ({ ...current, bpSys: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium" htmlFor="summary-bp-dia">
                    血圧下
                  </label>
                  <input
                    id="summary-bp-dia"
                    type="number"
                    min={0}
                    className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                    value={recordModalDraft.bpDia ?? ""}
                    onChange={(event) =>
                      updateRecordDraft(recordModalStep.stepId, (current) => ({ ...current, bpDia: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium" htmlFor="summary-body-weight">
                    体重(kg)
                  </label>
                  <input
                    id="summary-body-weight"
                    type="number"
                    min={0}
                    step="0.1"
                    className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                    value={recordModalDraft.bodyWeightKg ?? ""}
                    onChange={(event) =>
                      updateRecordDraft(recordModalStep.stepId, (current) => ({
                        ...current,
                        bodyWeightKg: event.target.value
                      }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium" htmlFor="summary-pulse">
                    脈拍
                  </label>
                  <input
                    id="summary-pulse"
                    type="number"
                    min={0}
                    className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                    value={recordModalDraft.pulse ?? ""}
                    onChange={(event) =>
                      updateRecordDraft(recordModalStep.stepId, (current) => ({ ...current, pulse: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium" htmlFor="summary-body-temp">
                    体温(°C)
                  </label>
                  <input
                    id="summary-body-temp"
                    type="number"
                    min={0}
                    step="0.1"
                    className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                    value={recordModalDraft.bodyTempC ?? ""}
                    onChange={(event) =>
                      updateRecordDraft(recordModalStep.stepId, (current) => ({ ...current, bodyTempC: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium" htmlFor="summary-fluid-intake">
                    飲水量(ml)
                  </label>
                  <input
                    id="summary-fluid-intake"
                    type="number"
                    min={0}
                    className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                    value={recordModalDraft.fluidIntakeMl ?? ""}
                    onChange={(event) =>
                      updateRecordDraft(recordModalStep.stepId, (current) => ({
                        ...current,
                        fluidIntakeMl: event.target.value
                      }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium" htmlFor="summary-urine">
                    尿量(ml)
                  </label>
                  <input
                    id="summary-urine"
                    type="number"
                    min={0}
                    className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                    value={recordModalDraft.urineMl ?? ""}
                    onChange={(event) =>
                      updateRecordDraft(recordModalStep.stepId, (current) => ({ ...current, urineMl: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium" htmlFor="summary-stool">
                    排便回数
                  </label>
                  <input
                    id="summary-stool"
                    type="number"
                    min={0}
                    className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                    value={recordModalDraft.stoolCountPerDay ?? ""}
                    onChange={(event) =>
                      updateRecordDraft(recordModalStep.stepId, (current) => ({
                        ...current,
                        stoolCountPerDay: event.target.value
                      }))
                    }
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <p className="text-sm font-medium">出口部状態（複数選択）</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {exitSiteStatusOptions.map((option) => {
                      const checked = recordModalDraft.exitSiteStatuses.includes(option);
                      return (
                        <label key={option} className="flex items-center gap-2">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(nextChecked) =>
                              updateRecordDraft(recordModalStep.stepId, (current) => {
                                const nextValues = new Set(current.exitSiteStatuses);
                                if (nextChecked === true) {
                                  nextValues.add(option);
                                } else {
                                  nextValues.delete(option);
                                }
                                return {
                                  ...current,
                                  exitSiteStatuses: Array.from(nextValues)
                                };
                              })
                            }
                          />
                          <span>{option}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-sm font-medium" htmlFor="summary-note">
                    備考（任意）
                  </label>
                  <textarea
                    id="summary-note"
                    className="min-h-[88px] w-full rounded-md border bg-background px-3 py-2 text-sm"
                    value={recordModalDraft.note ?? ""}
                    onChange={(event) =>
                      updateRecordDraft(recordModalStep.stepId, (current) => ({ ...current, note: event.target.value }))
                    }
                  />
                </div>
              </div>
            ) : null}

            {recordModalError ? <p className="text-sm text-destructive">{recordModalError}</p> : null}
          </div>

          <div className="flex justify-end gap-2 border-t px-5 py-4">
            <Button variant="outline" onClick={closeRecordModal}>
              閉じる
            </Button>
            <Button onClick={saveRecordModal}>保存</Button>
          </div>
        </ModalShell>
      ) : null}

      {isAbortDialogOpen ? (
        <ModalShell title="セッションを中断（非常用）" onClose={() => setIsAbortDialogOpen(false)}>
          <div className="space-y-4 px-5 py-4">
            <p className="text-sm text-muted-foreground">
              この操作は非常手段です。中断するとセッションは `中断` として終了し、ホームで同スロットを未実施として再開できます。
            </p>
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="abort-confirm-input">
                確認のため「中断」と入力してください
              </label>
              <input
                id="abort-confirm-input"
                type="text"
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                value={abortConfirmText}
                onChange={(event) => setAbortConfirmText(event.target.value)}
                placeholder="中断"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t px-5 py-4">
            <Button variant="outline" onClick={() => setIsAbortDialogOpen(false)}>
              キャンセル
            </Button>
            <Button variant="destructive" disabled={abortConfirmText.trim() !== "中断"} onClick={handleEmergencyAbort}>
              中断する
            </Button>
          </div>
        </ModalShell>
      ) : null}
    </PreviewShell>
  );
}

export default function SessionAPage() {
  return (
    <Suspense
      fallback={
        <PreviewShell>
          <section className="overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm">
            <div className="space-y-2 p-5">
              <h2 className="text-xl font-semibold tracking-tight">手順を読み込み中です</h2>
              <p className="text-sm text-muted-foreground">セッション情報を取得しています。</p>
            </div>
          </section>
        </PreviewShell>
      }
    >
      <SessionAPageContent />
    </Suspense>
  );
}
