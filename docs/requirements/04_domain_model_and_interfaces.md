# 04. ドメインモデルと公開インターフェース

## 1. 正規化JSONモデル

### 1.1 ProtocolPackage
```json
{
  "meta": {
    "formatVersion": 3,
    "protocolId": "capd_onebag",
    "protocolName": "ワンバッグ手技",
    "protocolVersion": "v3.0.0",
    "effectiveFromLocal": "2026-02-10T00:00:00+09:00"
  },
  "steps": [],
  "source": {
    "importMode": "mac_directory",
    "basePath": "protocol_package"
  },
  "importedAt": "2026-02-09T13:00:00+09:00",
  "validationReport": {
    "errors": [],
    "warnings": []
  }
}
```

### 1.2 Session
```json
{
  "sessionId": "ses_01H...",
  "slotNo": 1,
  "scheduledDateLocal": "2026-02-09",
  "protocolId": "capd_onebag",
  "protocolVersion": "v3.0.0",
  "status": "active",
  "ownerDevice": {
    "deviceId": "macbook-main",
    "platform": "mac"
  },
  "currentStepId": "step_021",
  "startedAt": "2026-02-09T20:00:00+09:00",
  "completedAt": null,
  "abortedAt": null,
  "updatedAt": "2026-02-09T20:21:00+09:00",
  "updatedByDeviceId": "macbook-main",
  "mutationId": "mut_01J..."
}
```

### 1.3 DailyProcedurePlan
```json
{
  "dateLocal": "2026-02-09",
  "localRevision": 7,
  "cloudRevision": 102,
  "slots": [
    {
      "slotNo": 1,
      "status": "planned",
      "displayStatus": "in_progress",
      "protocolId": "capd_onebag",
      "protocolTitle": "レギニュール1.5",
      "recommendedAtLocal": "20:00",
      "activeSessionId": "ses_01H...",
      "startBlocked": false,
      "updatedAt": "2026-02-09T20:21:00+09:00",
      "updatedByDeviceId": "macbook-main",
      "mutationId": "mut_01J..."
    }
  ]
}
```

### 1.4 Record
```json
{
  "recordId": "rec_01H...",
  "sessionId": "ses_01H...",
  "recordEvent": "session_summary",
  "payload": {
    "summaryScope": "first_of_day",
    "bp_sys": 120,
    "bp_dia": 78,
    "body_weight_kg": 54.2,
    "exit_site_statuses": ["正常"],
    "exit_site_photo": {
      "photo_id": "pho_exit_01H...",
      "captured_at": "2026-02-09T21:15:00+09:00",
      "uploaded_at": "2026-02-09T21:16:00+09:00",
      "source_device_id": "iphone-main"
    },
    "pulse": 66,
    "body_temp_c": 36.6,
    "symptom_memo": "軽い違和感あり",
    "note": "定期外来日"
  },
  "updatedAt": "2026-02-09T21:12:00+09:00",
  "updatedByDeviceId": "macbook-main",
  "mutationId": "mut_01J...",
  "deleted": false
}
```

### 1.5 SessionProtocolSnapshot
```json
{
  "sessionId": "ses_01H...",
  "snapshotSchemaVersion": 1,
  "sourceProtocol": {
    "protocolId": "capd_onebag",
    "protocolVersion": "v3.0.0",
    "importedAt": "2026-02-09T13:00:00+09:00"
  },
  "steps": [
    {
      "sequenceNo": 21,
      "stepId": "step_021",
      "nextStepId": "step_022",
      "phase": "廃液",
      "state": "お腹→廃液バッグ",
      "title": "お腹のチューブのクランプを開ける",
      "imageAssetKey": "protocol/capd_onebag/v3/step_021.png",
      "displayText": "クランプを開けます。",
      "warningText": "チューブの折れに注意してください。",
      "requiredChecks": ["チューブのクランプが開いている"],
      "timerSpec": {
        "timerId": "drain_1",
        "timerEvent": "start",
        "timerExchangeNo": 1,
        "timerSegment": "drain"
      },
      "alarmSpec": null,
      "recordSpec": null
    }
  ],
  "assetManifest": [
    {
      "assetKey": "protocol/capd_onebag/v3/step_021.png",
      "sourceRelativePath": "v3/step_021.png",
      "contentSha256": "9f5c...",
      "sizeBytes": 384221
    }
  ],
  "snapshotHash": "sha256:5d3a..."
}
```

### 1.6 SyncManifest
```json
{
  "cloudRevision": 102,
  "dayRefs": [
    {
      "dateLocal": "2026-02-09",
      "blobKey": "days/2026-02-09.json",
      "sha256": "f30a...",
      "updatedAt": "2026-02-09T21:20:00+09:00"
    }
  ],
  "photoRefs": [
    {
      "photoId": "pho_01H...",
      "blobKey": "photos/pho_01H....jpg",
      "photo_kind": "drain",
      "sizeBytes": 188221,
      "sha256": "3c21...",
      "updatedAt": "2026-02-09T21:10:00+09:00"
    },
    {
      "photoId": "pho_exit_01H...",
      "blobKey": "photos/pho_exit_01H....jpg",
      "photo_kind": "exit_site",
      "sizeBytes": 202114,
      "sha256": "7af1...",
      "updatedAt": "2026-02-09T21:16:00+09:00"
    }
  ],
  "tombstones": [],
  "integrityHash": "sha256:manifest..."
}
```

### 1.7 DayBundle
```json
{
  "dateLocal": "2026-02-09",
  "dailyProcedurePlan": {},
  "sessions": [],
  "records": [],
  "snapshotRefs": [],
  "updatedAt": "2026-02-09T21:20:00+09:00",
  "updatedByDeviceId": "macbook-main",
  "mutationId": "mut_01J..."
}
```

### 1.8 OutboxMutation
```json
{
  "mutationId": "mut_01J...",
  "deviceId": "macbook-main",
  "entityType": "record",
  "entityId": "rec_01H...",
  "operation": "patch",
  "patch_path": "payload.exit_site_photo",
  "payload": {
    "exit_site_photo": {
      "photo_id": "pho_exit_01H...",
      "captured_at": "2026-02-09T21:15:00+09:00",
      "uploaded_at": "2026-02-09T21:16:00+09:00",
      "source_device_id": "iphone-main"
    }
  },
  "updatedAt": "2026-02-09T21:12:00+09:00",
  "retryCount": 0,
  "status": "pending"
}
```

### 1.9 SyncState
```json
{
  "deviceId": "iphone-main",
  "lastCloudRevision": 102,
  "lastSyncedAt": "2026-02-09T21:22:00+09:00",
  "lastSyncStatus": "success",
  "lastError": null
}
```

## 2. 型定義（TypeScript想定）
```ts
export type TimerEvent = "start" | "end";
export type TimerSegment = "dwell" | "drain";
export type RecordEvent = "drain_appearance" | "drain_weight_g" | "bag_weight_g" | "session_summary";
export type DrainAppearanceCategory = "透明" | "やや混濁" | "混濁" | "血性" | "その他";
export type ExitSiteStatusCategory = "正常" | "赤み" | "痛み" | "はれ" | "かさぶた" | "じゅくじゅく" | "出血" | "膿";
export type ExchangeColumnNo = 1 | 2 | 3 | 4 | 5;
export type ProcedureSlotNo = 1 | 2 | 3 | 4;
export type DailyProcedureSlotStatus = "empty" | "planned" | "completed";
export type DailyProcedureSlotDisplayStatus = "empty" | "pending" | "in_progress" | "completed";
export type SnapshotSchemaVersion = 1;
export type WakeLockState = "active" | "inactive" | "unsupported" | "failed";
export type SessionStatus = "active" | "completed" | "aborted";
export type SessionOwnerDevice = { deviceId: string; platform: "mac" | "iphone" };
export type SessionSummaryScope = "first_of_day" | "last_of_day" | "both";
export type AlarmDispatchStatus = "pending" | "notified" | "acknowledged" | "missed";
export type SyncTrigger = "startup" | "resume" | "session_complete" | "manual";
export type SyncMode = "delta" | "full_reseed";
export type ConflictResolutionPolicy = "lww_entity";
export type PhotoKind = "drain" | "exit_site";

export interface ExitSitePhotoMeta {
  photo_id: string;
  captured_at: string;
  uploaded_at: string;
  source_device_id: string;
}

export interface SessionSummaryPayload {
  summaryScope?: SessionSummaryScope;
  bp_sys?: number;
  bp_dia?: number;
  body_weight_kg?: number;
  exit_site_statuses?: ExitSiteStatusCategory[];
  fluid_intake_ml?: number;
  urine_ml?: number;
  stool_count_per_day?: number;
  pulse?: number;
  body_temp_c?: number;
  symptom_memo?: string;
  note?: string;
  exit_site_photo?: ExitSitePhotoMeta | null;
}

export type RecordPayload = SessionSummaryPayload | Record<string, unknown>;

export interface LwwMeta {
  updatedAt: string;
  updatedByDeviceId: string;
  mutationId: string;
}

export interface DailyProcedurePlan {
  dateLocal: string;
  localRevision: number;
  cloudRevision: number;
  slots: DailyProcedureSlot[];
}

export interface DailyProcedureSlot extends LwwMeta {
  slotNo: ProcedureSlotNo;
  status: DailyProcedureSlotStatus;
  displayStatus: DailyProcedureSlotDisplayStatus;
  protocolId: string | null;
  protocolTitle: string | null;
  recommendedAtLocal: string | null;
  activeSessionId: string | null;
  startBlocked: boolean;
  startBlockedReason?:
    | "LEFT_SLOT_NOT_COMPLETED"
    | "SLOT_EMPTY"
    | "SLOT_ALREADY_COMPLETED"
    | "ACTIVE_SESSION_EXISTS"
    | "SLOT_IN_PROGRESS";
}

export interface Session extends LwwMeta {
  sessionId: string;
  slotNo: ProcedureSlotNo;
  scheduledDateLocal: string;
  protocolId: string;
  protocolVersion: string;
  status: SessionStatus;
  ownerDevice: SessionOwnerDevice;
  currentStepId: string;
  startedAt: string;
  completedAt: string | null;
  abortedAt: string | null;
}

export interface RecordEntity extends LwwMeta {
  recordId: string;
  sessionId: string;
  recordEvent: RecordEvent;
  payload: RecordPayload;
  deleted: boolean;
}

export interface SessionProtocolSnapshot {
  sessionId: string;
  snapshotSchemaVersion: SnapshotSchemaVersion;
  sourceProtocol: {
    protocolId: string;
    protocolVersion: string;
    importedAt: string;
  };
  steps: SessionSnapshotStep[];
  assetManifest: SessionSnapshotAsset[];
  snapshotHash: string;
  createdAt: string;
}

export interface SessionSnapshotStep {
  sequenceNo: number;
  stepId: string;
  nextStepId: string | null;
  phase: string;
  state: string;
  title: string;
  imageAssetKey: string | null;
  displayText: string | null;
  warningText: string | null;
  requiredChecks: string[];
  timerSpec: {
    timerId: string;
    timerEvent: TimerEvent;
    timerExchangeNo?: ExchangeColumnNo;
    timerSegment?: TimerSegment;
  } | null;
  alarmSpec: {
    alarmId: string;
    segment: TimerSegment;
  } | null;
  recordSpec: {
    recordEvent: RecordEvent;
    recordExchangeNo?: ExchangeColumnNo;
    recordUnit?: string;
  } | null;
}

export interface SessionSnapshotAsset {
  assetKey: string;
  sourceRelativePath: string;
  contentSha256: string;
  sizeBytes: number;
}

export interface TombstoneRef extends LwwMeta {
  entityType: "session" | "record" | "daily_slot" | "photo";
  entityId: string;
  deletedAt: string;
  deletedByDeviceId: string;
}

export interface SyncManifest {
  cloudRevision: number;
  dayRefs: Array<{ dateLocal: string; blobKey: string; sha256: string; updatedAt: string }>;
  photoRefs: Array<{ photoId: string; blobKey: string; photo_kind: PhotoKind; sizeBytes: number; sha256: string; updatedAt: string }>;
  tombstones: TombstoneRef[];
  integrityHash: string;
}

export interface DayBundle extends LwwMeta {
  dateLocal: string;
  dailyProcedurePlan: DailyProcedurePlan;
  sessions: Session[];
  records: RecordEntity[];
  snapshotRefs: Array<{ sessionId: string; snapshotHash: string }>;
}

export interface OutboxMutation {
  mutationId: string;
  deviceId: string;
  entityType: "session" | "record" | "daily_slot" | "photo" | "tombstone";
  entityId: string;
  operation: "upsert" | "delete" | "patch";
  patch_path?: "payload.exit_site_photo";
  payload: Record<string, unknown>;
  updatedAt: string;
  retryCount: number;
  status: "pending" | "acked" | "failed";
}

export interface SyncState {
  deviceId: string;
  lastCloudRevision: number;
  lastSyncedAt?: string;
  lastSyncStatus: "idle" | "success" | "failed";
  lastError?: string;
}
```

## 3. クライアント公開インターフェース

### 3.1 SessionService
```ts
interface SessionService {
  startSession(input: { slotNo: ProcedureSlotNo; protocolId: string }): Promise<{ sessionId: string }>;
  enterStep(input: { sessionId: string; stepId: string }): Promise<void>;
  completeStep(input: { sessionId: string; stepId: string }): Promise<void>;
  abortSession(input: { sessionId: string }): Promise<void>;
  getSession(sessionId: string): Promise<Session>;
}
```

### 3.2 RecordService
```ts
interface RecordService {
  saveRecord(input: { sessionId: string; recordEvent: RecordEvent; payload: RecordPayload }): Promise<{ recordId: string }>;
  updateRecord(input: { recordId: string; patch: Record<string, unknown>; patch_path?: "payload.exit_site_photo" }): Promise<void>;
  listRecords(input: { fromDate: string; toDate: string }): Promise<RecordEntity[]>;
}
```

### 3.3 DailyPlanService
```ts
interface DailyPlanService {
  getPlan(dateLocal: string): Promise<DailyProcedurePlan>;
  upsertSlot(input: { dateLocal: string; slotNo: ProcedureSlotNo; protocolId: string; recommendedAtLocal: string }): Promise<void>;
  deleteSlot(input: { dateLocal: string; slotNo: ProcedureSlotNo }): Promise<void>;
}
```

### 3.4 ProtocolImportService（Macローカル）
```ts
interface ProtocolImportService {
  importFromDirectory(input: { basePath: string }): Promise<{
    status: "success" | "failed";
    errors: Array<{ row?: number; field?: string; message: string }>;
    warnings: Array<{ row?: number; field?: string; message: string }>;
    summary: { stepCount: number; timerCount: number; alarmCount: number; recordEventCount: number };
  }>;
}
```

### 3.5 SyncService
```ts
interface SyncService {
  sync(trigger: SyncTrigger): Promise<{ applied: number; failed: number; reseedApplied: boolean }>;
  restoreFromCloud(): Promise<{ restoredDays: number; restoredRecords: number }>;
  getSyncState(): Promise<SyncState>;
}
```

## 4. サーバー最小API契約

### 4.1 `POST /sync/push`
- 目的: outbox mutation をクラウドへ反映
- 入力:
```json
{
  "deviceId": "macbook-main",
  "syncMode": "delta",
  "baseCloudRevision": 100,
  "mutations": [
    {
      "mutationId": "mut_01J...",
      "entityType": "record",
      "entityId": "rec_01H...",
      "operation": "patch",
      "patch_path": "payload.exit_site_photo",
      "payload": {
        "exit_site_photo": {
          "photo_id": "pho_exit_01H...",
          "captured_at": "2026-02-09T21:15:00+09:00",
          "uploaded_at": "2026-02-09T21:16:00+09:00",
          "source_device_id": "iphone-main"
        }
      }
    }
  ]
}
```
- 出力:
```json
{
  "acceptedMutations": ["mut_01J..."],
  "rejectedMutations": [],
  "newCloudRevision": 102,
  "reseedApplied": false
}
```
- 契約:
  - `syncMode=delta`: 通常差分同期
  - `syncMode=full_reseed`: クラウド欠損時にローカル全量を再シード

### 4.2 `POST /sync/pull`
- 目的: 指定revision以降の差分取得
- 入力:
```json
{
  "deviceId": "iphone-main",
  "knownCloudRevision": 100,
  "knownDayRevisions": {
    "2026-02-09": "sha256:old"
  }
}
```
- 出力:
```json
{
  "cloudState": "ok",
  "cloudRevision": 102,
  "manifestDiff": {},
  "dayBundles": [],
  "photoRefs": [
    {
      "photoId": "pho_exit_01H...",
      "blobKey": "photos/pho_exit_01H....jpg",
      "photo_kind": "exit_site",
      "sizeBytes": 202114,
      "sha256": "7af1...",
      "updatedAt": "2026-02-09T21:16:00+09:00"
    }
  ]
}
```
- 契約:
  - `cloudState=ok`: 通常差分応答
  - `cloudState=missing`: クラウド側の同期基盤が欠損している状態。クライアントは `syncMode=full_reseed` で再シードを実行
  - `cloudState=missing` の判定条件（いずれか該当で返却）:
    - `index.json` が存在しない
    - `index.json` の必須フィールド（`cloudRevision`, `dayRefs`, `photoRefs`, `tombstones`, `integrity`）が欠落または不正
    - `index.json` が参照する `days/*.json` の必須オブジェクトが1件でも欠損
    - `index.json` が参照する `photos/*` が1件でも欠損
    - `integrity` 検証が失敗し、整合性を回復できない

## 5. 競合解決契約（固定）
- 解決単位: エンティティ単位
- ルール: `(updatedAt, updatedByDeviceId, mutationId)` 降順で勝者決定
- `session_summary.payload.exit_site_photo` はフィールド単位LWWで解決し、同一record内の他フィールドは上書きしません
- `record` への出口部写真更新は `patch_path=payload.exit_site_photo` の部分パッチで反映します
- tombstone: 削除優先なし、同一ルールで勝敗決定
- 競合UI: ユーザー向け競合件数表示・詳細表示は行いません（内部適用のみ）
