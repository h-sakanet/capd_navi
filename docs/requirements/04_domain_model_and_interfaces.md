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
  "sourceCsvPath": "/abs/path/protocol.csv",
  "importedAt": "2026-02-09T13:00:00+09:00",
  "validationReport": {
    "errors": [],
    "warnings": []
  }
}
```

### 1.2 Step
```json
{
  "stepId": "step_021",
  "nextStepId": "step_022",
  "phase": "廃液",
  "state": "お腹→廃液バッグ",
  "title": "お腹のチューブのクランプを開ける",
  "imagePathRel": "v3/お腹のチューブのクランプ_開ける.png",
  "displayText": null,
  "warningText": null,
  "requiredChecks": [
    "クランプを開けた"
  ],
  "timer": {
    "timerId": "1_drain",
    "event": "start",
    "exchangeNo": 1,
    "segment": "drain"
  },
  "alarm": null,
  "record": null
}
```

### 1.3 RecordPayload
```json
{
  "recordEvent": "session_summary",
  "payload": {
    "bp_sys": 120,
    "bp_dia": 78,
    "pulse": 66,
    "body_weight_kg": 54.2,
    "body_temp_c": 36.6,
    "urine_ml": 800,
    "stool_count_per_day": 1,
    "symptom_memo": "軽い違和感あり",
    "notes": "就寝前に実施"
  }
}
```

## 2. 型定義（TypeScript想定）
```ts
export type TimerEvent = "start" | "end";
export type AlarmTrigger = "step_enter";
export type RecordEvent = "drain_appearance" | "drain_weight_g" | "bag_weight_g" | "session_summary";
export type DrainAppearanceCategory = "透明" | "やや混濁" | "混濁" | "血性" | "その他";

export interface ProtocolMeta {
  formatVersion: 3;
  protocolId: string;
  protocolName: string;
  protocolVersion: string;
  effectiveFromLocal: string;
}

export interface Step {
  stepId: string;
  nextStepId: string | null;
  phase: string;
  state: string;
  title: string;
  imagePathRel: string | null;
  displayText: string | null;
  warningText: string | null;
  requiredChecks: string[];
  timer?: {
    timerId: string;
    event: TimerEvent;
    exchangeNo?: number;
    segment?: string;
  };
  alarm?: {
    alarmId: string;
    trigger: AlarmTrigger;
    durationMin: number;
    relatedTimerId: string;
  };
  record?: {
    event: RecordEvent;
    exchangeNo?: number;
    unit?: string;
  };
}
```

## 3. サーバーAPI（固定）

### 3.1 `POST /protocols/import`
- 目的: CSVアップロードと検証
- 入力: `multipart/form-data` (`file`)
- 出力: 検証結果（`success/failed`、`errors[]`、`warnings[]`）

### 3.2 `GET /protocols`
- 目的: ホーム表示用テンプレート一覧取得
- 出力: `protocolId`, `protocolName`, `protocolVersion`, `effectiveFromLocal`, `isActive`

### 3.3 `POST /sessions`
- 目的: 手技テンプレート選択でセッション開始
- 入力: `protocolId`
- サーバー処理: 対象版スナップショットを保存
- 出力: `sessionId`, `currentStepId`

### 3.4 `POST /sessions/{id}/steps/{stepId}/complete`
- 目的: チェック完了後のステップ完了登録
- 入力: `checkedItems[]`, `completedAt`
- エラー: 必須未完了なら `409`

### 3.5 `POST /sessions/{id}/records`
- 目的: `record_event` 入力保存
- 入力: `recordEvent`, `payload`, `recordedAt`
- エラー: 必須項目不足なら `422`

### 3.6 `GET /sessions/{id}`
- 目的: セッション復元
- 出力: 進行状態、記録済みデータ、タイマー状態、アラーム状態

## 4. セッションと履歴保持
- セッション開始時に `protocol_snapshot` を保存します。
- 後日、プロトコルが改訂されても既存セッション表示はスナップショットを優先します。
- 後編集はUI上は最新値表示、内部は履歴保持します。

## 5. エラーレスポンス共通形式
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "必須項目が不足しています",
    "details": [
      {
        "field": "payload.bp_sys",
        "reason": "required"
      }
    ]
  }
}
```
