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
- Local FR: `CAP-ALARM-001-FR-01` 〜 `CAP-ALARM-001-FR-20`
- 旧FR対応: FR-050, FR-050A, FR-050B, FR-050C, FR-050D, FR-051, FR-052, FR-052A, FR-052B, FR-053, FR-054, FR-055, FR-055A, FR-055B, FR-056, FR-057, FR-057A, FR-058, FR-058A, FR-058B
- AT: AT-ALARM-001, AT-ALARM-002, AT-ALARM-003, AT-ALARM-004
- SCR: SCR-SESSION-001
- JRN: JRN-007-ALARM

## 11. 機能要件（ローカルID）

- 採番規則: `<文書ID>-FR-yy`（yyはこの文書内連番）
- 旧FR IDは括弧内に残し、移行トレーサビリティを保持します。

- CAP-ALARM-001-FR-01: (旧: FR-050) `timer_event` と `timer_segment` から、CSV設定に従ってタイマー終了通知ジョブを生成します。
- CAP-ALARM-001-FR-02: (旧: FR-050A) 通知対象は `timer_event=end` の終了イベントとし、`timer_segment=dwell/drain` を同一ルールで扱います。
- CAP-ALARM-001-FR-03: (旧: FR-050B) 同一セッション内の通知ジョブは `alarm_id` 単位で独立管理します。
- CAP-ALARM-001-FR-04: (旧: FR-050C) 通知ジョブは最低限 `alarm_id / segment / due_at / acked_at / attempt_no / status` を保持します。
- CAP-ALARM-001-FR-05: (旧: FR-050D) `pendingAlarm` は未ACKジョブ（`pending/notified/missed`）から `due_at` 最小を優先して1件選択し、同値時は `alarm_id` 昇順を採用します。
- CAP-ALARM-001-FR-06: (旧: FR-051) 終了時刻 `T0` で Mac ローカル通知（音+バナー）を発火し、同時にアプリ内未確認アラートを固定表示します。
- CAP-ALARM-001-FR-07: (旧: FR-052) 未確認時は段階再通知を行います。
- CAP-ALARM-001-FR-08: (旧: FR-052A) 再通知間隔は `T+2分`（iPhone補助通知1回 + Mac再通知）、`T+5分以降`（3分間隔でMac+iPhone再通知）とします。
- CAP-ALARM-001-FR-09: (旧: FR-052B) 段階再通知の対象は「貯留終了（`dwell`）」「廃液終了（`drain`）」に限定します。
- CAP-ALARM-001-FR-10: (旧: FR-053) ACK時は Mac/iPhone の通知ジョブをすべて停止し、`acked_at` を記録します。
- CAP-ALARM-001-FR-11: (旧: FR-054) アプリ内アラートは ACK まで継続表示し、通知再送も ACK まで継続します。
- CAP-ALARM-001-FR-12: (旧: FR-055) 通知チャネルは `Mac主チャネル固定 + iPhone補助` とします。
- CAP-ALARM-001-FR-13: (旧: FR-055A) iPhone未利用かつ離席想定時は「見逃し高リスク」警告を必須表示します。
- CAP-ALARM-001-FR-14: (旧: FR-055B) iPhone補助通知の利用可否は Push購読状態（登録/無効化）で管理します。
- CAP-ALARM-001-FR-15: (旧: FR-056) 「戻る」操作、過去ステップ再表示、アプリ再開、通信リトライでは、`timer_event(start/end)`・`record_event`・通知ジョブ生成を再発火しません。
- CAP-ALARM-001-FR-16: (旧: FR-057) 30秒テスト通知は手動実行とし、通知設定変更時・OS更新後・通知不調時に実施できること。
- CAP-ALARM-001-FR-17: (旧: FR-057A) 手動30秒テストに失敗した場合は、当日を「iPhone補助なし（Mac主導）」として扱います。
- CAP-ALARM-001-FR-18: (旧: FR-058) `T+30分` 未確認時は `status=missed` を永続化し、「見逃し状態」を表示します。
- CAP-ALARM-001-FR-19: (旧: FR-058A) `status=missed` になった後も、ACKまで3分間隔の再通知を継続します。
- CAP-ALARM-001-FR-20: (旧: FR-058B) `status=missed` は ACK 成功時に `acknowledged` へ遷移し、通知停止と `acked_at` 記録を行います。
