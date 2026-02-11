# JRN-004-ABORT

## 1. メタ情報
- JRN ID: JRN-004-ABORT
- 名称: 非常中断と再開
- Phase: Phase1
- 主端末: Mac/iPhone
- 版: v1

## 2. 目的 / 非目的
- 目的: 非常中断の安全動作と、離脱後再開動作を固定する。
- 非目的: 通常完了フロー。

## 3. スコープ（含む / 含まない）
- 含む: 明示中断、離脱後再開。
- 含まない: 中断履歴のホーム表示。

## 4. 事前条件 / 事後条件
- 事前条件: セッション進行中。
- 事後条件: 明示中断時は `aborted` かつ対象スロットを `未実施`。

## 5. 主フロー
1. `ACT-006-SESSION` を確認付きで実行。
2. `aborted` へ遷移。
3. ホームへ戻る。

## 6. 例外フロー
- 予期せぬ離脱時: `active` を保持し再開。

## 7. 状態遷移
- 参照: `../40_contracts/state-machine.md` Session遷移。

## 8. 参照画面（レビュー順）
1. `../20_screens/SCR-006-SESSION.md`
2. `../20_screens/SCR-001-HOME.md`

## 9. 受入条件（GWT）
- Given セッション進行中
- When 非常中断を確認して実行
- Then セッションは `aborted` で終了しホームへ戻る

## 10. ログ/監査/計測
- 中断操作の実行者、時刻、対象セッションIDを記録。

## 11. トレーサビリティ
- FR: FR-009G, FR-039D, FR-039E, FR-039F, FR-039G
- AT: AT-FLOW-006, AT-FLOW-007
- CAP: CAP-SNAPSHOT-001
- SCR: SCR-SESSION-001, SCR-HOME-001
- ACT: ACT-006-SESSION
