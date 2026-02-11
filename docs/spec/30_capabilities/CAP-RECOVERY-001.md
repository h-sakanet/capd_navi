# CAP-RECOVERY-001

## 1. メタ情報（CAP ID, 名称, Owner, 対象Phase）
- CAP ID: CAP-RECOVERY-001
- 名称: 復旧
- Owner: Sync Engine
- 対象Phase: Phase1

## 2. 目的 / 非目的
- 目的: DB消失および `cloudState=missing` で、ローカル正本を保持したまま復旧を完了させます。
- 非目的: 通常時の差分同期（CAP-SYNC側）。

## 3. 境界（対象画面あり/なし、責務分割）
- 対象画面あり: `../20_screens/SCR-011-SYNC-STATUS.md`
- 画面責務: 欠損状態と再試行導線の表示。
- CAP責務: 欠損判定、`full_reseed` 実行、再pull確認。

## 4. ドメインモデルと不変条件
- モデル: `SyncState`, `SyncManifest`, `OutboxMutation(syncMode=full_reseed)`。
- 不変条件:
  - `cloudState=missing` 判定時はローカル初期化を禁止。
  - `full_reseed` 成功後に再pullで `cloudState=ok` を確認。
  - 失敗時はローカルデータを不変で保持。

## 5. 入出力I/F（Service, API, Event）
- Service: `SyncService.restoreFromCloud()`, `SyncService.sync(trigger)`
- API: `POST /sync/pull`（missing判定）, `POST /sync/push`（full_reseed）
- Event: `recovery.started`, `recovery.completed`, `recovery.failed`

## 6. 状態遷移（正常 / 禁止 / 再試行 / 復旧）
- 正常: `missing_detected -> full_reseeding -> validating -> recovered`
- 失敗: `full_reseeding|validating -> recovery_failed`
- 再試行: `recovery_failed -> full_reseeding`
- 禁止: 欠損未確認でのreseed

## 7. 失敗モードと回復方針
- reseed失敗: `lastSyncStatus=failed` + 再試行導線。
- 再pull失敗: ローカル保持のまま復旧未完了表示。

## 8. セキュリティ・監査・保持
- 監査: 欠損判定理由、再シード件数、復旧成否。
- 復旧ログは運用監査期間保持。

## 9. 受入条件（GWT）
- Given `POST /sync/pull` が `cloudState=missing`
- When 復旧処理を実行する
- Then ローカルを失わず `cloudState=ok` まで回復する

## 10. トレーサビリティ（FR, AT, SCR, JRN）
- Local FR: `CAP-RECOVERY-001-FR-01` 〜 `CAP-RECOVERY-001-FR-06`
- 旧FR対応: FR-087, FR-087A, FR-087B, FR-087C, FR-087D, FR-088
- AT: AT-RECOVERY-001, AT-RECOVERY-002, AT-RECOVERY-003
- SCR: SCR-SYNC-STATUS-001
- JRN: JRN-006-RECOVERY

## 11. 機能要件（ローカルID）

- 採番規則: `<文書ID>-FR-yy`（yyはこの文書内連番）
- 旧FR IDは括弧内に残し、移行トレーサビリティを保持します。

- CAP-RECOVERY-001-FR-01: (旧: FR-087) IndexedDB消失検知時はクラウドからフルリストアを実行します。
- CAP-RECOVERY-001-FR-02: (旧: FR-087A) `POST /sync/pull` が `cloudState=missing` を返した場合、クラウド欠損と判定します。
- CAP-RECOVERY-001-FR-03: (旧: FR-087B) クラウド欠損判定時はローカルデータを正本として `syncMode=full_reseed` で全量再シードを実行し、ローカルデータは削除/初期化しません。
- CAP-RECOVERY-001-FR-04: (旧: FR-087C) 全量再シード成功後は再度 `POST /sync/pull` を実行し、`cloudState=ok` と `cloudRevision` 更新を確認して同期完了とします。
- CAP-RECOVERY-001-FR-05: (旧: FR-087D) 全量再シード失敗時はローカルデータを不変のまま保持し、`lastSyncStatus=failed` と再試行導線を表示します。
- CAP-RECOVERY-001-FR-06: (旧: FR-088) 同期失敗時は直近同期状態（成功/失敗）を更新し、再試行導線を表示します。
