# CAP-PHOTO-BACKUP-001

## 1. メタ情報（CAP ID, 名称, Owner, 対象Phase）
- CAP ID: CAP-PHOTO-BACKUP-001
- 名称: 写真同期/保持
- Owner: Media Storage
- 対象Phase: Phase2

## 2. 目的 / 非目的
- 目的: `drain` / `exit_site` 写真の保存・同期・容量制御・バックアップを統一します。
- 非目的: セッション進行制御、CSV取込、手動エクスポート機能（FR-093）。

## 3. 境界（対象画面あり/なし、責務分割）
- 対象画面あり: `../20_screens/SCR-005-HOME-SUMMARY.md`, `../20_screens/SCR-009-HISTORY-DETAIL.md`, `../20_screens/SCR-010-HISTORY-PHOTO.md`
- 画面責務: 画像選択、操作導線、表示。
- CAP責務: JPEG再圧縮、blob保存、photoRefs管理、容量制御、バックアップ。

## 4. ドメインモデルと不変条件
- モデル: `photoRefs(photo_kind)`, `exit_site_photo`, `tombstone`。
- 不変条件:
  - 出口部写真は1レコード1枚固定。
  - 更新は `patch_path=payload.exit_site_photo` の部分パッチ。
  - 削除は `exit_site_photo=null` + 写真tombstone。
  - 容量上限1GB、超過時は古い順削除で0.95GB以下へ。

## 5. 入出力I/F（Service, API, Event）
- Service: `PhotoService.put/remove`, `RecordService.updateRecord`
- Storage: `photos/{photoId}.jpg`, `index.json.photoRefs[]`
- Event: `photo.updated`, `photo.deleted`, `photo.gc_applied`

## 6. 状態遷移（正常 / 禁止 / 再試行 / 復旧）
- 正常: `idle -> uploading -> synced`
- 削除: `synced -> deleting -> synced`
- 失敗: `uploading|deleting -> failed`
- 再試行: `failed -> uploading|deleting`

## 7. 失敗モードと回復方針
- 保存失敗: 記録保存継続、写真のみ再試行導線。
- 同期失敗: outbox再送。
- バックアップ失敗: 次回ジョブで再実行、直近失敗状態を表示。

## 8. セキュリティ・監査・保持
- JPEG再圧縮（長辺1600px/quality85）。
- 監査: 操作種別、端末、対象photoId。
- バックアップは日次1回、30日保持。
- バックアップ対象は `index.json`, `days/*.json`, `photos/*` の世代データとします。

## 9. 受入条件（GWT）
- Given 写真総量が1GBを超える
- When 新規写真を保存する
- Then 古い順削除で0.95GB以下へ収束する

## 10. トレーサビリティ（FR, AT, SCR, JRN）
- Local FR: `CAP-PHOTO-BACKUP-001-FR-01` 〜 `CAP-PHOTO-BACKUP-001-FR-14`
- 旧FR対応: FR-042A, FR-042B, FR-042C, FR-042D, FR-042E, FR-042F, FR-042G, FR-042H, FR-089A, FR-090, FR-090A, FR-091, FR-092, FR-093
- AT: AT-EXIT-001〜AT-EXIT-012, AT-PHOTO-001, AT-BACKUP-001
- SCR: SCR-HOME-SUMMARY-001, SCR-HISTORY-DETAIL-001, SCR-HISTORY-PHOTO-001
- JRN: JRN-009-EXITPHOTO

## 11. 機能要件（ローカルID）

- 採番規則: `<文書ID>-FR-yy`（yyはこの文書内連番）
- 旧FR IDは括弧内に残し、移行トレーサビリティを保持します。

- CAP-PHOTO-BACKUP-001-FR-01: (旧: FR-042A) 出口部の記録写真（`exit_site`）は `session_summary.payload.exit_site_photo` に保存します（`record_event` は追加しません）。
- CAP-PHOTO-BACKUP-001-FR-02: (旧: FR-042B) 出口部写真の対象レコードは当日 `summaryScope=both` を最優先し、次に `summaryScope=first_of_day` を採用します。同値時は `completedAt` 昇順、さらに同値時は `recordId` 昇順で決定します。
- CAP-PHOTO-BACKUP-001-FR-03: (旧: FR-042C) 出口部写真の登録導線は、対象 `session_summary` の入力完了後に表示します。
- CAP-PHOTO-BACKUP-001-FR-04: (旧: FR-042D) 出口部写真の操作導線は `iPhoneホーム全体サマリ` と `iPhone記録詳細` の両方に表示します。Macは閲覧リンクのみ表示し、登録/変更/削除操作は許可しません。
- CAP-PHOTO-BACKUP-001-FR-05: (旧: FR-042E) 出口部写真は1レコード1枚固定とし、登録後は `変更` と `削除` を許可します。
- CAP-PHOTO-BACKUP-001-FR-06: (旧: FR-042F) 出口部写真の入力手段は iPhone の `カメラ撮影` と `ファイル選択` の両方を許可します。
- CAP-PHOTO-BACKUP-001-FR-07: (旧: FR-042G) 出口部写真は任意入力であり、未登録でも手技完了を阻害しません。
- CAP-PHOTO-BACKUP-001-FR-08: (旧: FR-042H) 出口部写真の削除時は `session_summary.payload.exit_site_photo=null` を保存し、対応画像は tombstone 化します。
- CAP-PHOTO-BACKUP-001-FR-09: (旧: FR-089A) `session_summary.payload.exit_site_photo` の更新は部分パッチ（`patch_path=payload.exit_site_photo`）で同期し、同一record内の他フィールドを上書きしません。
- CAP-PHOTO-BACKUP-001-FR-10: (旧: FR-090) 記録写真（`drain` / `exit_site`）はJPEG再圧縮して保存します（長辺1600px/quality 85）。
- CAP-PHOTO-BACKUP-001-FR-11: (旧: FR-090A) 写真参照メタには `photo_kind`（`drain` / `exit_site`）を保持します。
- CAP-PHOTO-BACKUP-001-FR-12: (旧: FR-091) 写真総量は1GB上限とし、超過時は古い順削除します。
- CAP-PHOTO-BACKUP-001-FR-13: (旧: FR-092) 日次バックアップを1日1回実行し、30日保持します。
- CAP-PHOTO-BACKUP-001-FR-14: (旧: FR-093) 手動エクスポート機能は v1 対象外とします。
