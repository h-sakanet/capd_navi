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
  "executionToken": "exec_...",
  "currentStepId": "step_021",
  "startedAt": "2026-02-09T20:00:00+09:00",
  "completedAt": null,
  "abortedAt": null
}
```

### 1.3 DailyProcedurePlan
```json
{
  "dateLocal": "2026-02-09",
  "revision": 7,
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
      "updatedAt": "2026-02-09T07:20:00+09:00"
    },
    {
      "slotNo": 2,
      "status": "empty",
      "displayStatus": "empty",
      "protocolId": null,
      "protocolTitle": null,
      "recommendedAtLocal": null,
      "activeSessionId": null,
      "startBlocked": true,
      "startBlockedReason": "SLOT_EMPTY",
      "updatedAt": "2026-02-09T07:20:00+09:00"
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
    "pulse": 66,
    "body_temp_c": 36.6,
    "symptom_memo": "軽い違和感あり",
    "note": "定期外来日"
  },
  "revision": 3,
  "recordedAt": "2026-02-09T21:12:00+09:00"
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
export type StartBlockedReason =
  | "LEFT_SLOT_NOT_COMPLETED"
  | "SLOT_EMPTY"
  | "SLOT_ALREADY_COMPLETED"
  | "ACTIVE_SESSION_EXISTS"
  | "SLOT_IN_PROGRESS";
export type WakeLockState = "active" | "inactive" | "unsupported" | "failed";
export type SessionStatus = "active" | "completed" | "aborted";
export type SessionOwnerDevice = { deviceId: string; platform: "mac" | "iphone" };
export type SessionSummaryScope = "first_of_day" | "last_of_day" | "both";
export type AlarmDispatchStatus = "pending" | "notified" | "acknowledged" | "missed";

export interface DailyProcedurePlan {
  dateLocal: string;
  revision: number;
  slots: DailyProcedureSlot[];
}

export interface DailyProcedureSlot {
  slotNo: ProcedureSlotNo;
  status: DailyProcedureSlotStatus;
  displayStatus: DailyProcedureSlotDisplayStatus;
  protocolId: string | null;
  protocolTitle: string | null;
  recommendedAtLocal: string | null;
  activeSessionId: string | null;
  startBlocked: boolean;
  startBlockedReason?: StartBlockedReason;
  updatedAt: string;
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

export interface AlarmDispatchState {
  alarmId: string;
  segment: TimerSegment;
  dueAt: string;
  ackedAt?: string;
  attemptNo: number;
  status: AlarmDispatchStatus;
  lastNotifiedAt?: string;
}

export interface SessionRuntimeState {
  wakeLockState: WakeLockState;
  alarmDispatches: AlarmDispatchState[];
  pendingAlarm?: {
    alarmId: string;
    segment: TimerSegment;
    dueAt: string;
    status: Exclude<AlarmDispatchStatus, "acknowledged">;
    attemptNo: number;
    lastNotifiedAt?: string;
  };
  isEditableOnThisDevice: boolean;
}

export interface SessionDetailResponse {
  sessionId: string;
  slotNo: ProcedureSlotNo;
  scheduledDateLocal: string;
  status: SessionStatus;
  ownerDevice: SessionOwnerDevice;
  currentStepId: string;
  runtimeState: SessionRuntimeState;
  protocolSnapshot: SessionProtocolSnapshot;
}

export interface SyncChangeSet {
  nextCursor: string;
  dailyProcedurePlans: Array<{
    dateLocal: string;
    revision: number;
    updatedAt: string;
  }>;
  sessions: Array<{
    sessionId: string;
    slotNo: ProcedureSlotNo;
    status: Exclude<SessionStatus, "active">;
    completedAt: string | null;
    abortedAt: string | null;
  }>;
  records: Array<{
    recordId: string;
    sessionId: string;
    revision: number;
    updatedAt: string;
  }>;
}
```

## 3. サーバーAPI（v1固定）

### 3.1 `POST /protocols/import-package`
- 目的: Macで選択したCSV+画像ディレクトリを取り込み
- 入力: `multipart/form-data` (`protocolCsv`, `assets[]`, `basePath`)
- 出力: `success/failed`, `errors[]`, `warnings[]`, `summary`

### 3.2 `GET /protocols`
- 目的: ホーム表示用テンプレート一覧取得
- 出力: `protocolId`, `protocolName`, `protocolVersion`, `effectiveFromLocal`, `isActive`

### 3.2.1 `GET /daily-procedure-slots?date=YYYY-MM-DD`
- 目的: 当日4スロットの登録状態と開始可否を取得
- 挙動: 対象日データが未作成の場合は `empty` 4スロットで初期化して返却
- 出力: `dateLocal`, `revision`, `slots[4]`（`slotNo`, `status`, `displayStatus`, `protocolId`, `protocolTitle`, `recommendedAtLocal`, `activeSessionId`, `startBlocked`, `startBlockedReason`, `updatedAt`）
- `displayStatus` 判定:
  - `empty` -> `empty`（未登録）
  - `planned` + `activeSessionId=null` -> `pending`（未実施）
  - `planned` + `activeSessionId!=null` -> `in_progress`（実施中）
  - `completed` -> `completed`（実施済み）

### 3.2.2 `PUT /daily-procedure-slots/{slotNo}`
- 目的: ホームスロットへ手技を登録/更新
- 入力: `dateLocal`, `protocolId`, `recommendedAtLocal`, `baseRevision`
- 検証:
  - `baseRevision` が現在revisionと不一致なら `409` (`SLOT_PLAN_REVISION_MISMATCH`)
  - 登録済みスロット間で `recommendedAtLocal` は左から右へ厳密昇順（同値不可）
  - 同一日に active セッションが存在する場合は `409` (`ACTIVE_SESSION_EXISTS`)
  - `completed` スロットは更新不可（`409 SLOT_ALREADY_COMPLETED`）
  - 不正時は `422` (`SLOT_TIME_ORDER_INVALID`)
- 出力: 更新後の `dateLocal`, `revision`, `slots[4]`

### 3.2.3 `DELETE /daily-procedure-slots/{slotNo}`
- 目的: スロット登録解除（`+` 状態へ戻す）
- 入力: `dateLocal`, `baseRevision`
- 検証:
  - `baseRevision` が現在revisionと不一致なら `409` (`SLOT_PLAN_REVISION_MISMATCH`)
  - 同一日に active セッションが存在する場合は `409` (`ACTIVE_SESSION_EXISTS`)
  - `completed` スロットは削除不可（`409 SLOT_ALREADY_COMPLETED`）
- 出力: 更新後の `dateLocal`, `revision`, `slots[4]`

### 3.3 `POST /sessions`
- 目的: セッション開始
- 入力: `protocolId`, `slotNo`, `scheduledDateLocal`, `deviceId`, `platform`
- 処理: 同時実行セッションが存在する場合は `409` (`ACTIVE_SESSION_EXISTS`)
- 追加検証:
  - 指定 `slotNo` が `empty` の場合は `409` (`SLOT_EMPTY`)
  - 指定 `slotNo` が `completed` の場合は `409` (`SLOT_ALREADY_COMPLETED`)
  - 指定 `slotNo` が `in_progress` の場合は `409` (`SLOT_IN_PROGRESS`)
  - 指定 `slotNo` より左に `completed` でないスロットがある場合は `409` (`LEFT_SLOT_NOT_COMPLETED`)
- スナップショット生成（必須）:
  1. 指定 `protocolId` の有効テンプレート版を取得
  2. 実行に必要な手順定義（step本文、`requiredChecks`、`timer/alarm/record` 指示、画像 `assetKey`）を固定化
  3. `assetManifest`（`sourceRelativePath`, `assetKey`, `contentSha256`, `sizeBytes`）を固定化
  4. 固定化JSONから `snapshotHash` を算出
  5. `sessions` 作成、`session_protocol_snapshots` 作成、`daily_procedure_slots.active_session_id` 設定を1トランザクションで実行
  6. いずれか失敗時は全体ロールバックし `500 SESSION_SNAPSHOT_CREATE_FAILED` を返却
- 出力: `sessionId`, `slotNo`, `scheduledDateLocal`, `currentStepId`, `executionToken`, `ownerDevice`, `slotPlanRevision`, `snapshotSchemaVersion`, `snapshotHash`
- 備考: 予期せぬ離脱後の再開は `GET /daily-procedure-slots` の `activeSessionId` を使って `GET /sessions/{id}` へ遷移し、`POST /sessions` は再実行しない

### 3.4 `GET /sessions/{id}`
- 目的: セッション復元（同一端末での再開）
- 制約:
  - `status=active` の場合、`ownerDevice` 以外からの参照は `403` (`ACTIVE_SESSION_VIEW_FORBIDDEN`)
  - 進行中セッションの別端末閲覧は v1 対象外
- 復元規則:
  - レンダリング用の手順定義は `session_protocol_snapshots` のみを使用し、現行テンプレート版へフォールバックしない
  - `session_protocol_snapshots` 欠落、または `snapshotHash` 再計算不一致時は `409 SESSION_SNAPSHOT_INTEGRITY_ERROR`
- 出力: 進行状態、記録済みデータ、タイマー状態、アラーム状態、`slotNo`、`scheduledDateLocal`、`wakeLockState`、`alarmDispatches[]`、`pendingAlarm`、`isEditableOnThisDevice`、`protocolSnapshot`
- `pendingAlarm` 選定規則:
  - 対象: `acked_at IS NULL` かつ `status IN (pending, notified, missed)`
  - 優先順位: `due_at` 昇順（最古優先）
  - 同着時: `alarm_id` 昇順
  - 対象なし時: `pendingAlarm` は省略

### 3.4.1 `POST /sessions/{id}/steps/{stepId}/enter`
- 目的: ステップ到達時の副作用（`timer_event` 記録 / 通知ジョブ生成）を1回だけ確定
- ヘッダ: `X-Execution-Token` 必須
- 入力: `enteredAt`, `clientTransitionId`（UUID）
- 処理:
  - `clientTransitionId` は同一リクエスト再送を吸収する冪等キー（推奨保持24時間）
  - ステップ到達イベントは `(sessionId, stepId)` で一意化し、既到達ステップへの再送/再表示では副作用を再発火しない
  - `timer_event=start/end` は未記録時のみ保存し、既存時は再保存しない
  - `timer_event=end` かつ `timer_segment=dwell/drain` の行で `alarm_id` が定義されている場合、通知ジョブを作成する
  - 通知ジョブは `dueAt = enteredAt`（終了時刻）で登録し、`attemptNo=0`, `status=pending` で開始する
  - 通知ジョブ登録は `(sessionId, alarmId)` 一意制約で重複作成を防止
- エラー:
  - `403` トークン不正
- 出力:
  - `alreadyEntered`（既到達なら `true`）
  - `timerEventsApplied[]`
  - `alarmJobsCreated[]`（`alarmId`, `segment`, `dueAt`, `attemptNo`, `status`）

### 3.5 `POST /sessions/{id}/steps/{stepId}/complete`
- 目的: ステップ完了登録
- ヘッダ: `X-Execution-Token` 必須
- 入力: `checkedItems[]`, `completedAt`
- 前提: 対象ステップで `POST /sessions/{id}/steps/{stepId}/enter` が成功済みであること
- 最終ステップ完了時の追加処理:
  - 同一セッションの `recordEvent=session_summary` 最新レコードを取得し、未登録なら `422 SESSION_SUMMARY_REQUIRED_MISSING`
  - `completedAt` を確定時刻として同日完了セッション順を算出し、`summaryScope` をサーバー決定:
    - 最初のみ該当: `first_of_day`
    - 最後のみ該当: `last_of_day`
    - 最初かつ最後（同日1セッション）: `both`
  - `summaryScope` に応じて必須項目を検証:
    - `first_of_day`: `bp_sys`, `bp_dia`, `body_weight_kg`, `pulse`, `body_temp_c`, `exit_site_statuses(1件以上)`
    - `last_of_day`: `fluid_intake_ml`, `urine_ml`, `stool_count_per_day`
    - `both`: 上記両方
  - 検証成功時のみ `sessions.status=completed` / `completed_at=completedAt` を確定し、`session_summary.summaryScope` を保存
- エラー:
  - `403` トークン不正
  - `409` 必須未完了/端末不一致
  - `422` `SESSION_SUMMARY_REQUIRED_MISSING`（最終完了時の必須不足）

### 3.6 `POST /sessions/{id}/records`
- 目的: `record_event` 入力保存
- ヘッダ: `X-Execution-Token` 必須
- 入力: `recordEvent`, `recordExchangeNo`, `payload`, `recordedAt`
- `recordEvent=session_summary` の `payload.summaryScope` はクライアント入力必須にしません（省略可）。
- `payload.summaryScope` が未指定/空文字/enum外値/型不正でも `POST /sessions/{id}/records` は `422` を返さず、`summaryScope` の入力値を破棄して受理します。
- `payload.summaryScope` 以外の `session_summary` 項目（血圧・体重・脈拍など）は通常どおり形式検証し、妥当な値は保存します。
- `POST /sessions/{id}/records` では `session_summary` の型/語彙/単位などの形式検証のみを行い、`first_of_day/last_of_day` の必須判定は行いません。
- `summaryScope`（`first_of_day` / `last_of_day` / `both`）は最終ステップ完了処理（`POST /sessions/{id}/steps/{stepId}/complete`）でサーバー算出し保存します。
- エラー:
  - `403` トークン不正
  - `422` 入力形式不正（`payload.summaryScope` 以外）

### 3.6.1 交換列マッピング仕様（記録ノート）
- `recordExchangeNo` は `1..5` の交換列番号です（`1` が最左列）。
- `timerExchangeNo` は `1..5` の交換列番号です（`1` が最左列）。
- 表示マッピング:
  - `drain_weight_g` → 排液量
  - `bag_weight_g` → 注液量
  - `drain_appearance` → 排液の確認
  - `timer_segment=dwell` の `start/end` → 貯留時間
  - `timer_segment=drain` の `start/end` → 排液時間

除水量計算:
- 交換#1: 前回注液量がないため `未計算` 表示
- 交換#2以降: `交換Nの排液量 - 交換N-1の注液量`
- 1日の総除水量: 計算可能な交換分のみ合算
- `opening_infuse_weight_g` は v1 では `null` 許容・計算不使用

### 3.7 `PATCH /sessions/{id}/records/{recordId}`
- 目的: 記録一覧画面からの履歴編集
- 入力: `payload`, `baseRevision`, `editedAt`
- 仕様: optimistic lock
- エラー:
  - `409` `baseRevision` 不一致

### 3.8 `POST /sessions/{id}/alarms/{alarmId}/ack`
- 目的: アプリ内アラーム確認状態保存
- 入力: `acknowledgedAt`
- 冪等:
  - `(sessionId, alarmId)` で一意
  - 既に確認済みの場合は状態を変更せず `alreadyAcknowledged=true` を返却
- 処理: ACK時に該当 `alarmId` の再通知ジョブを停止し `acked_at` を記録
- 出力: `alarmId`, `acknowledged=true`, `alreadyAcknowledged`, `stopped=true`

### 3.8.1 通知ディスパッチャ（バックグラウンド）
- 対象: `session_alarm_dispatches` の `acked_at IS NULL` かつ `status IN (pending, notified, missed)`
- 段階通知:
  - `now >= due_at` かつ `attempt_no=0`: `T0` 通知送信、`attempt_no=1`, `status=notified`, `last_notified_at=now`
  - `now >= due_at + 2分` かつ `attempt_no=1`: 再通知送信、`attempt_no=2`, `status=notified`
  - `now >= due_at + 5分` かつ `last_notified_at + 3分 <= now`: 再通知送信、`attempt_no += 1`, `status=notified`
- 見逃し遷移:
  - `now >= due_at + 30分` かつ未ACKで `status != missed` の場合、`status=missed` を永続化
  - `status=missed` 遷移後も、ACKまで3分間隔の再通知を継続
- 停止条件:
  - `POST /sessions/{id}/alarms/{alarmId}/ack` 成功時に `status=acknowledged`, `acked_at` を保存し、以後の再通知を停止

### 3.9 `POST /sessions/{id}/abort`
- 目的: 非常手段としてセッションを明示中断
- ヘッダ: `X-Execution-Token` 必須
- 入力: `abortedAt`, `reason`（固定値: `user_emergency_abort`）
- 処理:
  - `sessions.status` を `aborted` へ更新
  - 対応スロットは `planned` へ戻し、`activeSessionId=null`（表示は `pending`）
- 出力: `sessionId`, `status=aborted`, `abortedAt`, `slotNo`, `slotPlanRevision`

### 3.10 `GET /sync/changes?sinceCursor=...`
- 目的: 端末間の遅延同期差分取得
- 出力: `nextCursor`, `dailyProcedurePlans[]`, `sessions[]`, `records[]`
- 同期対象制約:
  - `sessions[]` は `status=completed|aborted` のみを返却
  - `dailyProcedurePlans[]` は `displayStatus=in_progress` / `activeSessionId` を含めない
  - 進行中セッションの復元情報は同期しない
- 補足: 別端末での `sessionId` 解決は `sessions[].sessionId`（completed|aborted）を利用し、active は解決対象にしない

### 3.11 `POST /exports/manual`
- 目的: 手動ZIPエクスポート作成
- 入力: `fromDate`, `toDate`, `includePhotos`
- 出力: `exportId`, `downloadUrl`, `expiresAt`

### 3.12 `POST /push-subscriptions`
- 目的: iPhone PWA のPush購読を登録/更新
- 入力: `deviceId`, `platform="iphone"`, `subscriptionJson`, `enabled`
- 出力: `subscriptionId`, `enabled`, `updatedAt`

### 3.13 `DELETE /push-subscriptions/{subscriptionId}`
- 目的: iPhone PWA のPush購読を無効化
- 出力: `subscriptionId`, `deleted=true`

### 3.14 `POST /notification-tests/daily`
- 目的: 当日30秒テスト通知を実行
- 入力: `dateLocal`, `deviceId`, `requestedAt`
- 出力: `testId`, `scheduled=true`, `resultStatus`（`scheduled` / `failed`）

## 4. セッション整合ルール
- 同一セッションは作成端末のみ更新可能です。
- 別端末から進行中セッションを閲覧/再開することはできません（v1対象外）。
- セッション完了後に別端末のホームへ差分反映します。
- セッション開始後の表示ロジックは開始時スナップショットに固定し、テンプレート再取り込みによる差し替えを行いません。
- スロット開始順は左から右の順序を強制し、左側未完了スロットがある場合は右側開始を拒否します。
- スロット状態のUI表示マッピング:
  - `empty` -> 未登録（`+` のみ）
  - `planned` + `activeSessionId=null` -> 未実施
  - `planned` + `activeSessionId!=null` -> 実施中
  - `completed` -> 実施済み
- スロット状態遷移:
  - `empty` -> `planned`: スロット登録 (`PUT /daily-procedure-slots/{slotNo}`)
  - `planned` + `activeSessionId=null` -> `planned` + `activeSessionId!=null`: セッション開始 (`POST /sessions`)
  - `planned` -> `completed`: 対応セッションが `completed`
  - `planned` + `activeSessionId!=null` -> `planned` + `activeSessionId=null`: 対応セッションが `aborted`（`POST /sessions/{id}/abort`、同一スロットで再開始可）
  - 予期せぬ離脱時は `activeSessionId` を維持し、スロット選択で `GET /sessions/{id}` 再開
  - `completed` は不変（編集/削除不可）
- セッション進行の監査ログは append-only で保持します。
- ステップ到達副作用（`timer_event=start/end` / 通知ジョブ生成）は `POST /sessions/{id}/steps/{stepId}/enter` で1回だけ確定し、戻る/再表示/再開で再発火しません。
- 通知対象は `timer_event=end` かつ `timer_segment=dwell/drain` に限定し、通知ジョブは `(sessionId, alarmId)` 一意で重複を防止します。

## 5. 永続化モデル（DB）
- `daily_procedure_plans`
  - 主キー: `date_local (DATE)`
  - 列: `revision (INT)`, `created_at`, `updated_at`
- `daily_procedure_slots`
  - 主キー: `(date_local, slot_no)`
  - 外部キー: `date_local -> daily_procedure_plans.date_local`
  - 列: `status (empty|planned|completed)`, `protocol_id NULL`, `recommended_at_local NULL`, `active_session_id NULL`, `updated_at`
  - 制約:
    - `slot_no` は `1..4`
    - `status=empty` の場合は `protocol_id IS NULL AND recommended_at_local IS NULL AND active_session_id IS NULL`
    - `status=completed` の場合は `active_session_id IS NULL`
    - `status=planned` の場合は `protocol_id IS NOT NULL AND recommended_at_local IS NOT NULL`
- `sessions` 拡張列:
  - `scheduled_date_local (DATE)`, `slot_no (SMALLINT 1..4)`
  - インデックス: `(scheduled_date_local, slot_no, status)`
- `session_protocol_snapshots`
  - 主キー: `session_id (FK -> sessions.session_id, ON DELETE CASCADE)`
  - 列:
    - `snapshot_schema_version (SMALLINT)`（v1は `1` 固定）
    - `source_protocol_id (TEXT)`
    - `source_protocol_version (TEXT)`
    - `source_protocol_imported_at (TIMESTAMPTZ)`
    - `steps_json (JSONB)`（実行時に必要なstep定義の固定コピー）
    - `asset_manifest_json (JSONB)`（`assetKey` と `sourceRelativePath` の対応）
    - `snapshot_hash (TEXT)`（`sha256:<hex>`）
    - `created_at (TIMESTAMPTZ)`
  - 制約:
    - `session_id` ごとに1件のみ
    - `snapshot_schema_version=1` のとき `steps_json` / `asset_manifest_json` / `snapshot_hash` は `NOT NULL`
- `session_step_enters`
  - 主キー: `(session_id, step_id)`
  - 列: `entered_at`, `client_transition_id`, `created_at`
  - 制約:
    - `client_transition_id` はセッション内で一意
- `session_alarm_dispatches`
  - 主キー: `(session_id, alarm_id)`
  - 列: `segment (dwell|drain)`, `due_at`, `acked_at NULL`, `attempt_no`, `status (pending|notified|acknowledged|missed)`, `last_notified_at NULL`, `updated_at`
  - 制約:
    - `status=acknowledged` の場合 `acked_at IS NOT NULL`
    - 同一 `alarm_id` の多重作成を禁止
- `push_subscriptions`
  - 主キー: `subscription_id`
  - 列: `device_id`, `platform (iphone)`, `subscription_json`, `enabled`, `updated_at`
  - 制約:
    - `device_id` ごとに1件（upsert）
- `daily_notification_tests`
  - 主キー: `test_id`
  - 列: `date_local`, `device_id`, `requested_at`, `scheduled_at NULL`, `result_status (scheduled|failed)`, `updated_at`
  - 制約:
    - `(date_local, device_id)` ごとに1件

スロット更新トランザクション:
1. `daily_procedure_plans.revision` の一致確認
2. スロット更新（登録/削除）
3. 推奨実施時間の左->右厳密昇順を再検証
4. `revision` を `+1`

セッション開始トランザクション:
1. activeセッション有無とスロット開始条件を検証
2. 対象テンプレート版を取得し、実行用スナップショットを構築
3. `sessions` を `active` で作成
4. `session_protocol_snapshots` を作成（`snapshot_hash` 保存）
5. 対象 `daily_procedure_slots.active_session_id` を設定
6. 失敗時はロールバックし、`SESSION_SNAPSHOT_CREATE_FAILED` を返却

ステップ到達トランザクション（`POST /sessions/{id}/steps/{stepId}/enter`）:
1. `session_step_enters` に `(session_id, step_id)` を挿入（既存時は副作用スキップ）
2. `timer_event=start/end` があれば未記録時のみ保存
3. `timer_event=end` + `timer_segment=dwell/drain` + `alarm_id` がある場合 `session_alarm_dispatches` を `due_at=entered_at` で作成（既存時は既存値返却）
4. コミット後に通知ディスパッチャへ引き渡し、`attempt_no/status/last_notified_at` を更新しながら `T0/T+2分/T+5分以降3分` の段階通知を実行
5. `due_at+30分` 未ACK時は `status=missed` を永続化し、ACKまで再通知継続

## 6. 写真保存ポリシー
- 画像はJPEG再圧縮（長辺1600px / quality 85）
- 合計使用量が1GBを超えた場合、古い順に削除して0.95GB以下へ戻します。

## 7. エラーレスポンス共通形式
```json
{
  "error": {
    "code": "CONFLICT_ERROR",
    "message": "record revision mismatch",
    "details": [
      {
        "field": "baseRevision",
        "reason": "stale"
      }
    ]
  }
}
```
