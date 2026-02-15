import type { ProtocolStep } from "@/lib/protocol-csv";

export type ProcedureSlotStatus = "未実施" | "実施中" | "実施済み";

export type ProcedureSlot = {
  protocolId: string;
  protocolLabel: string;
  recommendedTime: string;
  status: ProcedureSlotStatus;
};

export type ActiveSessionMode = "runtime" | "preview";

export type ActiveSessionCache = {
  sessionId: string;
  slotIndex: number;
  currentStepId: string;
  protocolId: string;
  snapshotHash: string;
  mode: ActiveSessionMode;
  updatedAtIso: string;
};

export type DailyProcedurePlanEntity = {
  dateLocal: string;
  slots: Array<ProcedureSlot | null>;
  updatedAtIso: string;
};

export type ImportValidationMessage = {
  row?: number;
  field?: string;
  message: string;
};

export type ProtocolPackage = {
  protocolId: string;
  protocolName: string;
  importedAt: string;
  stepCount: number;
  steps: ProtocolStep[];
  validationReport?: {
    errors: ImportValidationMessage[];
    warnings: ImportValidationMessage[];
  };
};

export type ProtocolAssetEntity = {
  photoId: string;
  protocolId: string;
  assetKey: string;
  mimeType: string;
  sizeBytes: number;
  blob: Blob;
  importedAt: string;
  sourceFileName: string;
};

export type SessionEntityStatus = "active" | "completed" | "aborted";

export type SessionEntity = {
  sessionId: string;
  slotIndex: number;
  dateLocal: string;
  protocolId: string;
  snapshotHash: string;
  currentStepId: string;
  status: SessionEntityStatus;
  startedAtIso: string;
  completedAtIso: string | null;
  abortedAtIso: string | null;
  updatedAtIso: string;
};

export type SessionSnapshotTimerSpec = {
  timerId: string;
  timerEvent: "start" | "end";
  timerExchangeNo: string;
  timerSegment: "dwell" | "drain" | "";
};

export type SessionSnapshotAlarmSpec = {
  alarmId: string;
  alarmTrigger: "timer_end" | "step_enter" | "";
  alarmDurationMin: number | null;
  alarmRelatedTimerId: string;
};

export type SessionSnapshotRecordSpec = {
  recordEvent: string;
  recordExchangeNo: string;
  recordUnit: string;
};

export type SessionSnapshotStep = {
  sequenceNo: number;
  stepId: string;
  nextStepId: string | null;
  phase: string;
  state: string;
  title: string;
  image: string;
  displayText: string;
  warningText: string;
  requiredChecks: string[];
  timerSpec: SessionSnapshotTimerSpec | null;
  alarmSpec: SessionSnapshotAlarmSpec | null;
  recordSpec: SessionSnapshotRecordSpec | null;
};

export type SessionProtocolSnapshot = {
  sessionId: string;
  sourceProtocol: {
    protocolId: string;
    protocolName: string;
    importedAt: string;
  };
  steps: SessionSnapshotStep[];
  assetManifest: Array<{ assetKey: string; sourceRelativePath: string }>;
  snapshotHash: string;
  createdAtIso: string;
};

export type RecordEntity = {
  recordId: string;
  sessionId: string;
  dateLocal: string;
  stepId: string;
  recordEvent: string;
  recordExchangeNo: string;
  recordUnit: string;
  payload: Record<string, unknown>;
  createdAtIso: string;
  updatedAtIso: string;
};

export type TimerEventEntity = {
  eventId: string;
  dedupeKey: string;
  sessionId: string;
  dateLocal: string;
  stepId: string;
  timerId: string;
  timerEvent: "start" | "end";
  timerExchangeNo: string;
  timerSegment: "dwell" | "drain" | "";
  occurredAtIso: string;
};

export type AlarmDispatchJobStatus = "pending" | "notified" | "acknowledged" | "missed";

export type AlarmDispatchJobEntity = {
  jobId: string;
  dedupeKey: string;
  sessionId: string;
  dateLocal: string;
  stepId: string;
  alarmId: string;
  alarmTrigger: "timer_end" | "step_enter" | "";
  alarmDurationMin: number | null;
  alarmRelatedTimerId: string;
  dueAtIso: string;
  status: AlarmDispatchJobStatus;
  attemptNo: number;
  createdAtIso: string;
  updatedAtIso: string;
  ackedAtIso: string | null;
};

export type HomeExchangeNote = {
  exchangeNo: number;
  sessionId?: string;
  csvTitle: string;
  dwellStart: string;
  dwellEnd: string;
  drainStart: string;
  drainEnd: string;
  drainWeightG: number | null;
  bagWeightG: number | null;
  drainAppearance: string;
};

export type HomeNoteSummary = {
  bodyWeightKg: number | null;
  urineMl: number | null;
  fluidIntakeMl: number | null;
  stoolCountPerDay: number | null;
  bpSys: number | null;
  bpDia: number | null;
  exitSiteStatus: string;
  notes: string;
};

export type HomeNoteEntity = {
  dateLocal: string;
  protocolName: string;
  exchanges: HomeExchangeNote[];
  summary: HomeNoteSummary;
};
