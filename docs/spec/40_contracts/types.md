# Types Contract

## 1. 目的
CSV駆動セッション（Phase1）の実装型を固定し、画面/サービス/ストレージ間の解釈差を防止します。

## 2. 主要列挙
- `SessionStatus`: `active | completed | aborted`
- `ProcedureSlotStatus`: `未実施 | 実施中 | 実施済み`
- `ActiveSessionMode`: `runtime | preview`
- `TimerEvent`: `start | end`
- `TimerSegment`: `dwell | drain | ""`
- `AlarmTrigger`: `timer_end | step_enter | ""`
- `AlarmDispatchStatus`: `pending | notified | acknowledged | missed`

## 3. 実装型（Phase1）
```ts
export type ProtocolPackage = {
  protocolId: string;
  protocolName: string;
  importedAt: string;
  stepCount: number;
  steps: ProtocolStep[];
  validationReport?: {
    errors: Array<{ row?: number; field?: string; message: string }>;
    warnings: Array<{ row?: number; field?: string; message: string }>;
  };
};

export type SessionEntity = {
  sessionId: string;
  slotIndex: number;
  dateLocal: string;
  protocolId: string;
  snapshotHash: string;
  currentStepId: string;
  status: "active" | "completed" | "aborted";
  startedAtIso: string;
  completedAtIso: string | null;
  abortedAtIso: string | null;
  updatedAtIso: string;
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
  timerSpec: {
    timerId: string;
    timerEvent: "start" | "end";
    timerExchangeNo: string;
    timerSegment: "dwell" | "drain" | "";
  } | null;
  alarmSpec: {
    alarmId: string;
    alarmTrigger: "timer_end" | "step_enter" | "";
    alarmDurationMin: number | null;
    alarmRelatedTimerId: string;
  } | null;
  recordSpec: {
    recordEvent: string;
    recordExchangeNo: string;
    recordUnit: string;
  } | null;
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
  status: "pending" | "notified" | "acknowledged" | "missed";
  attemptNo: number;
  createdAtIso: string;
  updatedAtIso: string;
  ackedAtIso: string | null;
};

export type ActiveSessionCache = {
  sessionId: string;
  slotIndex: number;
  currentStepId: string;
  protocolId: string;
  snapshotHash: string;
  mode: "runtime" | "preview";
  updatedAtIso: string;
};
```

## 4. 不変条件
1. `startSession` では `sessions` と `session_protocol_snapshots` を同一トランザクションで保存します。
2. `SessionProtocolSnapshot.snapshotHash` は保存step本文から算出し、セッション復帰時に照合します。
3. `timer_event` / `alarm_dispatch_jobs` は dedupeキーにより重複登録しません。
4. `session_summary.payload.exit_site_photo` の更新は `patch_path=payload.exit_site_photo` の部分パッチを使用します。
