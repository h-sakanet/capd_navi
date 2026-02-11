# JRN-007-ALARM

## 1. メタ情報
- JRN ID: JRN-007-ALARM
- 名称: タイマー通知とACK
- Phase: Phase1
- 主端末: Mac/iPhone
- 版: v1

## 2. 目的 / 非目的
- 目的: `timer_event=end` 到達時の通知とACK停止を固定する。
- 非目的: 手技開始通知。

## 3. スコープ（含む / 含まない）
- 含む: T0通知、段階再通知、ACK停止。
- 含まない: Push基盤の運用管理。

## 4. 事前条件 / 事後条件
- 事前条件: 対象タイマー終了。
- 事後条件: ACKで通知停止、`acked_at` 記録。

## 5. 主フロー
1. 通知ジョブ生成。
2. T0通知。
3. T+2分、T+5分以降3分で再通知。
4. ACKで停止。

## 6. 例外フロー
- ACKなし30分: `missed` へ遷移し再通知継続。

## 7. 状態遷移
- 参照: `../40_contracts/state-machine.md` Alarm状態。

## 8. 参照画面（レビュー順）
1. `../20_screens/SCR-006-SESSION.md`

## 9. 受入条件（GWT）
- Given 通知中
- When ACK実行
- Then 通知停止し `acked_at` が保存される

## 10. ログ/監査/計測
- 通知試行回数、状態遷移、ACK時刻を記録。

## 11. トレーサビリティ
- FR: FR-050, FR-050A〜FR-050D, FR-051, FR-052, FR-052A, FR-052B, FR-053, FR-054, FR-055, FR-055A, FR-055B, FR-056, FR-057, FR-057A, FR-058, FR-058A, FR-058B
- AT: AT-ALARM-001〜AT-ALARM-004
- CAP: CAP-ALARM-001
- SCR: SCR-SESSION-001
- ACT: ACT-001-ALARM
