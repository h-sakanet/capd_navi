# CAP-ALARM-001

## 1. メタ情報
- CAP ID: `CAP-ALARM-001`
- 名称: CSV駆動アラームディスパッチ
- 対象Phase: Phase1
- 関連SCR: `SCR-006-SESSION.md`

## 2. 目的
- CSV定義に従って、`timer_end` 起点と `step_enter` 起点のアラームを永続化し、ACKまでの状態遷移を管理します。

## 3. 非目的
- 手技開始時刻通知（時計アプリ等の外部アラーム運用）。

## 4. 入力契約
- `SessionProtocolSnapshot.steps[*].alarmSpec`
  - `alarmId`
  - `alarmTrigger`: `timer_end` | `step_enter`
  - `alarmDurationMin`
  - `alarmRelatedTimerId`

## 5. 出力契約
- 保存先: `alarm_dispatch_jobs`
- 状態: `pending -> notified -> acknowledged`, `notified -> missed -> acknowledged`
- ACK時は `ackedAtIso` を必須記録

## 6. 不変条件
1. `alarm_trigger=timer_end` は、対応stepで `timer_event=end` が記録された時だけ生成する。
2. `alarm_trigger=step_enter` は、対応stepの初回表示時だけ生成する。
3. dedupeキーにより同一ジョブの重複生成を禁止する。
4. ACK済みジョブは再通知しない。

## 7. 受入対応
- `AT-ALARM-001`: アラーム表示開始
- `AT-ALARM-002`: 未ACK時の段階通知
- `AT-ALARM-003`: ACKで停止 + `ackedAtIso`
- `AT-ALARM-004`: missed遷移 + ACKで終了
