# CAP-ALARM-001

## 1. メタ情報（CAP ID, 名称, Owner, 対象Phase）
- CAP ID: CAP-ALARM-001
- 名称: タイマー通知/ACK
- Owner: Alarm Scheduler
- 対象Phase: Phase1

## 2. 目的 / 非目的
- 目的: `timer_event=end` 到達時の通知と、ACKまでの再通知制御を保証します。
- 非目的: 手技開始通知（外部アラーム運用）。

## 3. 境界（対象画面あり/なし、責務分割）
- 対象画面あり: `../20_screens/SCR-006-SESSION.md`
- 画面責務: アラート表示とACK操作。
- CAP責務: 通知ジョブ生成、段階再通知、missed判定、ACK停止。

## 4. ドメインモデルと不変条件
- モデル: `AlarmDispatchJob(alarm_id, segment, due_at, acked_at, attempt_no, status)`。
- 不変条件:
  - 対象は `timer_event=end` かつ `timer_segment=dwell/drain` のみ。
  - `pendingAlarm` は未ACK最古1件（同値時 `alarm_id` 昇順）。
  - `acknowledged` 遷移時に通知停止と`acked_at`記録を同時実行。

## 5. 入出力I/F（Service, API, Event）
- Service: `AlarmService.schedule`, `AlarmService.ack`
- Device Bridge: `scheduleLocalAlarm`, `cancelLocalAlarm`, `fireDailyNotificationTest`
- Event: `alarm.fired`, `alarm.acked`, `alarm.missed`

## 6. 状態遷移（正常 / 禁止 / 再試行 / 復旧）
- 正常: `pending -> notified -> acknowledged`
- 見逃し: `notified -> missed -> acknowledged`
- 再通知: `notified|missed -> notified`（ACKまで）
- 禁止: ACK済みジョブの再ACK

## 7. 失敗モードと回復方針
- 通知登録失敗: 次周期で再通知。
- ACK保存失敗: ローカル再試行キュー。
- 30秒テスト失敗: 当日を「iPhone補助なし」で運用。

## 8. セキュリティ・監査・保持
- 通知本文に機微データを含めない。
- 監査: fired/acked/missed時刻、端末、attempt_no。

## 9. 受入条件（GWT）
- Given タイマー終了後に未ACK
- When T+30分が経過する
- Then `status=missed` を永続化しACKまで再通知を継続する

## 10. トレーサビリティ（FR, AT, SCR, JRN）
- FR: FR-050, FR-050A, FR-050B, FR-050C, FR-050D, FR-051, FR-052, FR-052A, FR-052B, FR-053, FR-054, FR-055, FR-055A, FR-055B, FR-056, FR-057, FR-057A, FR-058, FR-058A, FR-058B
- AT: AT-ALARM-001, AT-ALARM-002, AT-ALARM-003, AT-ALARM-004
- SCR: SCR-SESSION-001
- JRN: JRN-007-ALARM
