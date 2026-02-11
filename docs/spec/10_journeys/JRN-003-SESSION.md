# JRN-003-SESSION

## 1. メタ情報
- JRN ID: JRN-003-SESSION
- 名称: セッション進行と記録
- Phase: Phase1
- 主端末: Mac/iPhone
- 版: v1

## 2. 目的 / 非目的
- 目的: 手順を進め、必要記録を保存し、最終ステップを完了する。
- 非目的: 非常中断運用。

## 3. スコープ（含む / 含まない）
- 含む: 次へ/戻る、記録保存、完了。
- 含まない: 同期復旧アルゴリズム。

## 4. 事前条件 / 事後条件
- 事前条件: 実施中セッションあり。
- 事後条件: `Session.status=completed`。

## 5. 主フロー
1. `SCR-SESSION-001` 表示。
2. 必須チェック完了。
3. 必要時 `ACT-003-SESSION` 記録保存。
4. 必要時 `ACT-002-SESSION` で前ステップ表示（再発火なし）。
5. `ACT-001-SESSION` で次へ遷移。
6. 最終到達で `ACT-004-SESSION` 実行。

## 6. 例外フロー
- 必須チェック未完了: 遷移拒否。
- `record_event` 未完了: 遷移拒否。

## 7. 状態遷移
- 参照: `../40_contracts/state-machine.md` の Session状態機械。

## 8. 参照画面（レビュー順）
1. `../20_screens/SCR-006-SESSION.md`
2. `../20_screens/SCR-007-SESSION-RECORD.md`

## 9. 受入条件（GWT）
- Given `record_event` が必要なステップ
- When 未保存で次へを押す
- Then 遷移しない

## 10. ログ/監査/計測
- step遷移、ブロック理由、記録保存結果を記録。

## 11. トレーサビリティ
- FR: FR-030〜FR-034, FR-039, FR-039A〜FR-039C, FR-040〜FR-044D, FR-071〜FR-075
- AT: AT-FLOW-001, AT-FLOW-002, AT-FLOW-003
- CAP: CAP-SNAPSHOT-001
- SCR: SCR-SESSION-001, SCR-SESSION-RECORD-001
- ACT: ACT-001-SESSION, ACT-002-SESSION, ACT-003-SESSION, ACT-004-SESSION
