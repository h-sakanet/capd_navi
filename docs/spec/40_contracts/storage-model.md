# Storage Model Contract

## 1. 正本方針
- データ正本は IndexedDB。
- `localStorage` はUI復元の補助キャッシュのみ。

## 2. IndexedDB（`capd-support-db`, version=1）
- `protocol_packages`
- `daily_procedure_plans`
- `sessions`
- `session_protocol_snapshots`
- `records`
- `timer_events`
- `alarm_dispatch_jobs`
- `outbox_mutations`
- `sync_state`
- `photo_meta`

## 3. `protocol_packages` 保存形（CSVメタ列なし）
```json
{
  "protocolId": "sample-protocol",
  "protocolName": "sample-protocol",
  "importedAt": "2026-02-12T10:00:00.000+09:00",
  "stepCount": 2,
  "steps": [
    {
      "sequenceNo": 1,
      "stepId": "step_001",
      "nextStepId": "step_002",
      "phase": "準備",
      "state": "お腹-独立",
      "title": "開始",
      "image": "img-1.png",
      "displayText": "...",
      "warningText": "",
      "requiredChecks": ["チェックA"],
      "timerId": "timer_1",
      "timerEvent": "start",
      "timerExchangeNo": "1",
      "timerSegment": "dwell",
      "alarmId": "alarm_1",
      "alarmTrigger": "step_enter",
      "alarmDurationMin": 10,
      "alarmRelatedTimerId": "timer_1",
      "recordEvent": "",
      "recordExchangeNo": "",
      "recordUnit": ""
    }
  ],
  "validationReport": {
    "errors": [],
    "warnings": []
  }
}
```

## 3.1 `photo_meta`（CSVテンプレ画像）保存形
```json
{
  "photoId": "protasset::sample-protocol::img-1.png",
  "protocolId": "sample-protocol",
  "assetKey": "img-1.png",
  "mimeType": "image/png",
  "sizeBytes": 12456,
  "blob": "<binary>",
  "importedAt": "2026-02-12T10:00:00.000+09:00",
  "sourceFileName": "img-1.png"
}
```
- `photoId` は `protasset::<protocolId>::<assetKey>` を使用します。
- `assetKey` は CSV `画像` 列のファイル名と一致させます。

## 4. セッション開始保存ルール
1. `sessions` と `session_protocol_snapshots` を同一トランザクションで保存する。
2. 保存失敗時は開始失敗とし、部分保存を残さない。
3. セッション表示/再開は snapshot のみを参照する。

## 5. `localStorage` 補助キャッシュ
- `capd-support:home:slots:v1`
- `capd-support:home:active-session:v1`
  - `{ sessionId, slotIndex, currentStepId, protocolId, snapshotHash, mode, updatedAtIso }`

補足:
- 旧 `capd-support:templates:v1` は移行しません。存在時は「CSV再取込必要」として扱います。
- 開発用 `Clear ALL` は `protocol_packages` と `photo_meta`（`protasset::`）を保持します。

## 6. Homeノート生成
- `records + timer_events + session_protocol_snapshots` を読んで当日ノートを生成します。
- `record_exchange_no` / `timer_exchange_no` を #1〜#5 列にマッピングします。
