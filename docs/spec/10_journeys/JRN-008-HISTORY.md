# JRN-008-HISTORY

## 1. メタ情報
- JRN ID: JRN-008-HISTORY
- 名称: 記録一覧閲覧と編集
- Phase: Phase1
- 主端末: Mac/iPhone
- 版: v1

## 2. 目的 / 非目的
- 目的: 直近30日の記録閲覧と必要編集を可能にする。
- 非目的: 出口部写真更新（別ジャーニー）。

## 3. スコープ（含む / 含まない）
- 含む: 一覧表示、写真詳細遷移、詳細編集。
- 含まない: セッション進行制御。

## 4. 事前条件 / 事後条件
- 事前条件: Homeから一覧遷移可能。
- 事後条件: 編集はLWWメタ付きで保存。

## 5. 主フロー
1. `ACT-010-HOME` で一覧遷移。
2. 30日範囲の一覧確認。
3. 写真リンクで詳細表示。
4. 詳細編集保存。

## 6. 例外フロー
- 写真未登録: 未登録文言を表示。

## 7. 状態遷移
- 参照: `../40_contracts/state-machine.md` Record/Sync関連状態。

## 8. 参照画面（レビュー順）
1. `../20_screens/SCR-008-HISTORY.md`
2. `../20_screens/SCR-010-HISTORY-PHOTO.md`
3. `../20_screens/SCR-009-HISTORY-DETAIL.md`

## 9. 受入条件（GWT）
- Given 写真リンクのある記録
- When 写真詳細を開く
- Then 対応写真が表示される

## 10. ログ/監査/計測
- 一覧表示範囲、編集保存結果、競合解決メタを記録。

## 11. トレーサビリティ
- FR: FR-010〜FR-019, FR-014A, FR-015A〜FR-015C
- AT: AT-UI-HOME-001
- CAP: CAP-SNAPSHOT-001
- SCR: SCR-HISTORY-001, SCR-HISTORY-PHOTO-001, SCR-HISTORY-DETAIL-001
- ACT: ACT-010-HOME, ACT-001-HISTORY
