# CAP-PHOTO-BACKUP-001

## 1. メタ情報（CAP ID, 名称, Owner, 対象Phase）
- CAP ID: CAP-PHOTO-BACKUP-001
- 名称: 写真同期/保持
- Owner: Media Storage
- 対象Phase: Phase2

## 2. 目的 / 非目的
- 目的: `drain` / `exit_site` 写真の保存・同期・容量制御・バックアップを統一します。
- 非目的: セッション進行制御、CSV取込。

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

## 9. 受入条件（GWT）
- Given 写真総量が1GBを超える
- When 新規写真を保存する
- Then 古い順削除で0.95GB以下へ収束する

## 10. トレーサビリティ（FR, AT, SCR, JRN）
- FR: FR-042A, FR-042B, FR-042C, FR-042D, FR-042E, FR-042F, FR-042G, FR-042H, FR-089A, FR-090, FR-090A, FR-091, FR-092
- AT: AT-EXIT-001〜AT-EXIT-012, AT-PHOTO-001, AT-BACKUP-001
- SCR: SCR-HOME-SUMMARY-001, SCR-HISTORY-DETAIL-001, SCR-HISTORY-PHOTO-001
- JRN: JRN-009-EXITPHOTO
