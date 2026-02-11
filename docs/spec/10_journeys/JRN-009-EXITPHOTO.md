# JRN-009-EXITPHOTO

## 1. メタ情報
- JRN ID: JRN-009-EXITPHOTO
- 名称: 出口部写真登録/変更/削除
- Phase: Phase2
- 主端末: iPhone更新 / Mac閲覧
- 版: v1

## 2. 目的 / 非目的
- 目的: `payload.exit_site_photo` の登録/変更/削除を一貫運用する。
- 非目的: drain写真仕様の変更。

## 3. スコープ（含む / 含まない）
- 含む: 表示条件判定、登録/変更/削除、部分パッチ同期。
- 含まない: Mac側更新操作。

## 4. 事前条件 / 事後条件
- 事前条件: `summaryScope` 対象レコードが完了。
- 事後条件: `payload.exit_site_photo` が同期反映される。

## 5. 主フロー
1. 対象画面に操作導線表示。
2. `ACT-001-EXIT/002/003` 実行。
3. `patch_path=payload.exit_site_photo` で同期。

## 6. 例外フロー
- 対象レコード未成立: 操作を非表示。
- Mac端末: 閲覧のみ。

## 7. 状態遷移
- 参照: `../40_contracts/state-machine.md` Photo関連状態。

## 8. 参照画面（レビュー順）
1. `../20_screens/SCR-005-HOME-SUMMARY.md`
2. `../20_screens/SCR-009-HISTORY-DETAIL.md`
3. `../20_screens/SCR-010-HISTORY-PHOTO.md`

## 9. 受入条件（GWT）
- Given iPhoneで対象レコードが成立
- When 写真を登録する
- Then `exit_site_photo` が保存される

## 10. ログ/監査/計測
- 登録/変更/削除イベント、対象recordId、patch_pathを記録。

## 11. トレーサビリティ
- FR: FR-042A〜FR-042H, FR-044C, FR-089A, FR-090, FR-090A, FR-091, FR-092
- AT: AT-EXIT-001〜AT-EXIT-012, AT-PHOTO-001, AT-BACKUP-001
- CAP: CAP-PHOTO-BACKUP-001
- SCR: SCR-HOME-SUMMARY-001, SCR-HISTORY-DETAIL-001, SCR-HISTORY-PHOTO-001
- ACT: ACT-001-EXIT, ACT-002-EXIT, ACT-003-EXIT
