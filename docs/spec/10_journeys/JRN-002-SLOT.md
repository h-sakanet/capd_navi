# JRN-002-SLOT

## 1. メタ情報
- JRN ID: JRN-002-SLOT
- 名称: 当日スロット登録と開始
- Phase: Phase1
- 主端末: Mac/iPhone
- 版: v1

## 2. 目的 / 非目的
- 目的: 当日4スロットを登録し、対象スロットを実施中へ遷移する。
- 非目的: セッション完了処理。

## 3. スコープ（含む / 含まない）
- 含む: スロット登録、開始確認、開始確定。
- 含まない: セッション内記録入力。

## 4. 事前条件 / 事後条件
- 事前条件: Home表示、対象日スロット表示。
- 事後条件: 対象スロットが `実施中`。

## 5. 主フロー
1. `ACT-001-HOME` で設定モーダルを開く。
2. `FC-SLOT-SETUP-001` を満たして保存。
3. `ACT-005-HOME` で開始確認へ遷移。
4. `ACT-008-HOME` で開始/再開を確定。

## 6. 例外フロー
- 左側未完了: 開始不可理由を表示。
- 進行中セッションあり: 編集不可。

## 7. 状態遷移
- 参照: `../40_contracts/state-machine.md` の Slot/Session状態。

## 8. 参照画面（レビュー順）
1. `../20_screens/SCR-001-HOME.md`
2. `../20_screens/SCR-002-HOME-SETUP.md`
3. `../20_screens/SCR-003-HOME-START-CONFIRM.md`
4. `../20_screens/SCR-004-HOME-VIEW-CONFIRM.md`

## 9. 受入条件（GWT）
- Given #1未実施、#2登録済み
- When #2を開始する
- Then 開始不可が表示される

## 10. ログ/監査/計測
- slot登録更新イベント、開始可否判定結果を記録。

## 11. トレーサビリティ
- FR: FR-007, FR-008, FR-009, FR-009A〜FR-009H, FR-036
- AT: AT-FLOW-004, AT-FLOW-005
- CAP: （なし）
- SCR: SCR-HOME-001, SCR-HOME-SETUP-001, SCR-HOME-START-CONFIRM-001, SCR-HOME-VIEW-CONFIRM-001
- ACT: ACT-001-HOME, ACT-002-HOME, ACT-005-HOME, ACT-008-HOME
