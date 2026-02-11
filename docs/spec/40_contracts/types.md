# Types Contract

## 1. 用語集
- ProtocolPackage: CSV取込後に保存される手技テンプレート。
- Session: 当日スロットに紐づく実施インスタンス。
- Record: `record_event` 単位の記録。
- SessionProtocolSnapshot: 開始時固定の手順定義。
- OutboxMutation: 同期対象のローカル更新。

## 2. 列挙型（完全列挙）
| 型名 | 値 | 備考 |
|---|---|---|
| `TimerEvent` | `start`, `end` | タイマーイベント |
| `TimerSegment` | `dwell`, `drain` | タイマー区分 |
| `RecordEvent` | `drain_appearance`, `drain_weight_g`, `bag_weight_g`, `session_summary` | 記録種別 |
| `DrainAppearanceCategory` | `透明`, `やや混濁`, `混濁`, `血性`, `その他` | 排液見た目分類 |
| `ExitSiteStatusCategory` | `正常`, `赤み`, `痛み`, `はれ`, `かさぶた`, `じゅくじゅく`, `出血`, `膿` | 出口部状態語彙 |
| `ExchangeColumnNo` | `1`, `2`, `3`, `4`, `5` | 記録ノート交換列 |
| `SessionStatus` | `active`, `completed`, `aborted` | セッション状態 |
| `DailyProcedureSlotStatus` | `empty`, `planned`, `completed` | 永続状態 |
| `DailyProcedureSlotDisplayStatus` | `empty`, `pending`, `in_progress`, `completed` | 画面表示状態 |
| `ProcedureSlotNo` | `1`, `2`, `3`, `4` | 当日4スロット番号 |
| `SnapshotSchemaVersion` | `1` | スナップショット版 |
| `WakeLockState` | `active`, `inactive`, `unsupported`, `failed` | スリープ抑止状態 |
| `SessionSummaryScope` | `first_of_day`, `last_of_day`, `both` | サマリ対象 |
| `AlarmDispatchStatus` | `pending`, `notified`, `acknowledged`, `missed` | アラーム状態 |
| `SyncTrigger` | `startup`, `resume`, `session_complete`, `manual` | 同期契機 |
| `SyncMode` | `delta`, `full_reseed` | 同期モード |
| `ConflictResolutionPolicy` | `lww_entity` | 競合解決方針 |
| `PhotoKind` | `drain`, `exit_site` | 写真種別 |
| `ProtocolImportMode` | `mac_directory` | 取込元モード（v1固定） |
| `ImportResultStatus` | `success`, `failed` | CSV取込結果 |

## 3. 厳密型定義（抜粋）
```ts
export interface ProtocolPackage {
  meta: {
    formatVersion: number;
    protocolId: string;
    protocolName: string;
    protocolVersion: string;
    effectiveFromLocal: string;
  };
  steps: Array<Record<string, unknown>>;
  source: {
    importMode: "mac_directory";
    basePath: string;
  };
  importedAt: string;
  validationReport: {
    errors: Array<{ row?: number; field?: string; message: string }>;
    warnings: Array<{ row?: number; field?: string; message: string }>;
  };
}

export type ProcedureSlotNo = 1 | 2 | 3 | 4;
```

### 3.1 データモデル型（移行補完）
```ts
export type ExchangeColumnNo = 1 | 2 | 3 | 4 | 5;
export type SnapshotSchemaVersion = 1;
export type WakeLockState = "active" | "inactive" | "unsupported" | "failed";
export type ConflictResolutionPolicy = "lww_entity";
export type DrainAppearanceCategory = "透明" | "やや混濁" | "混濁" | "血性" | "その他";
export type ExitSiteStatusCategory = "正常" | "赤み" | "痛み" | "はれ" | "かさぶた" | "じゅくじゅく" | "出血" | "膿";

export interface LwwMeta {
  updatedAt: string;
  updatedByDeviceId: string;
  mutationId: string;
}

export interface ExitSitePhotoMeta {
  photo_id: string;
  captured_at: string;
  uploaded_at: string;
  source_device_id: string;
}

export interface SessionSummaryPayload {
  summaryScope?: "first_of_day" | "last_of_day" | "both";
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

export interface DailyProcedureSlot extends LwwMeta {
  slotNo: ProcedureSlotNo;
  status: "empty" | "planned" | "completed";
  displayStatus: "empty" | "pending" | "in_progress" | "completed";
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

export interface DailyProcedurePlan {
  dateLocal: string;
  localRevision: number;
  cloudRevision: number;
  slots: DailyProcedureSlot[];
}

export interface Session extends LwwMeta {
  sessionId: string;
  slotNo: ProcedureSlotNo;
  scheduledDateLocal: string;
  protocolId: string;
  protocolVersion: string;
  status: "active" | "completed" | "aborted";
  ownerDevice: { deviceId: string; platform: "mac" | "iphone" };
  currentStepId: string;
  startedAt: string;
  completedAt: string | null;
  abortedAt: string | null;
}

export interface RecordEntity extends LwwMeta {
  recordId: string;
  sessionId: string;
  recordEvent: "drain_appearance" | "drain_weight_g" | "bag_weight_g" | "session_summary";
  payload: RecordPayload;
  deleted: boolean;
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
    timerEvent: "start" | "end";
    timerExchangeNo?: ExchangeColumnNo;
    timerSegment?: "dwell" | "drain";
  } | null;
  alarmSpec: {
    alarmId: string;
    segment: "dwell" | "drain";
  } | null;
  recordSpec: {
    recordEvent: "drain_appearance" | "drain_weight_g" | "bag_weight_g" | "session_summary";
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

export interface TombstoneRef extends LwwMeta {
  entityType: "session" | "record" | "daily_slot" | "photo";
  entityId: string;
  deletedAt: string;
  deletedByDeviceId: string;
}

export interface SyncManifest {
  cloudRevision: number;
  dayRefs: Array<{ dateLocal: string; blobKey: string; sha256: string; updatedAt: string }>;
  photoRefs: Array<{ photoId: string; blobKey: string; photo_kind: "drain" | "exit_site"; sizeBytes: number; sha256: string; updatedAt: string }>;
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

## 4. 不変条件（Invariants）
1. `record` のLWW比較キーは `(updatedAt, updatedByDeviceId, mutationId)` 降順。
2. `session_summary.payload.exit_site_photo` の更新は `patch_path=payload.exit_site_photo` の部分パッチ。
3. `SessionProtocolSnapshot` 保存失敗時はセッション開始失敗。
4. `cloudState=missing` 判定時にローカルデータ削除を禁止。
5. Import失敗時はテンプレート保存を行わない。

## 5. 参照元リンク
- `./storage-model.md`
- `./functional-requirements.md`
- `../30_capabilities/CAP-CSV-IMPORT-001.md`
- `../30_capabilities/CAP-SYNC-001.md`
- `../30_capabilities/CAP-SNAPSHOT-001.md`
