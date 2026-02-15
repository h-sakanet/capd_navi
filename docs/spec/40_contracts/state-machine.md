# State Machine Contract

## 1. 状態
- Slot: `未実施 | 実施中 | 実施済み`
- Session: `active | completed | aborted`
- AlarmDispatchJob: `pending | notified | missed | acknowledged`

## 2. セッション遷移
- `startSession`: `none -> active`
- `advanceStep`（ACT-001成功）: `active` のまま `currentStepId` 更新
- `completeSession`: `active -> completed`
- `abortSession`: `active -> aborted`

禁止:
- `completed|aborted -> active`

## 3. タイマーイベント遷移
- 発火契機: `advanceStep` 成功時のみ
- 対象: 「現在step」の `timerSpec`
- 重複防止: `dedupeKey` 一意

## 4. アラーム遷移
- 生成契機:
  - `alarm_trigger=timer_end`: `timer_event=end` 記録時
  - `alarm_trigger=step_enter`: step初回表示時
- 状態遷移:
  - `pending -> notified -> acknowledged`
  - `notified -> missed -> acknowledged`

禁止:
- `acknowledged` から再通知
- 同一dedupeの再生成

## 5. 復帰ルール
- セッション再開時は snapshot を参照。
- 戻る/再表示/再開では `timer_event` / `alarm` を再発火しない。
