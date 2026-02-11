# CAP-SYNC-001

## 1. メタ情報（CAP ID, 名称, Owner, 対象Phase）
- CAP ID: CAP-SYNC-001
- 名称: 同期
- Owner: Sync Engine
- 対象Phase: Phase1

## 2. 目的 / 非目的
- 目的: ローカル正本を維持しながら push/pull で端末間整合を成立させます。
- 非目的: 画面レイアウト、CSVパース。

## 3. 境界（対象画面あり/なし、責務分割）
- 対象画面あり: `../20_screens/SCR-011-SYNC-STATUS.md`, `../20_screens/SCR-001-HOME.md`
- 画面責務: 同期状態表示、手動再試行導線。
- CAP責務: outbox送信、差分取得、LWW適用、状態更新。

## 4. ドメインモデルと不変条件
- モデル: `OutboxMutation`, `SyncManifest`, `SyncState`。
- 不変条件:
  - 同期契機は `startup/resume/session_complete/manual` のみ。
  - push成功後にpullを実行。
  - outbox消し込みはpush受理後のみ。
  - 競合はLWW内部適用し競合UIを出さない。

## 5. 入出力I/F（Service, API, Event）
- Service: `SyncService.sync(trigger)`, `SyncService.getSyncState()`
- API: `POST /sync/push`, `POST /sync/pull`
- Event: `sync.started`, `sync.succeeded`, `sync.failed`

## 6. 状態遷移（正常 / 禁止 / 再試行 / 復旧）
- 正常: `idle -> syncing -> success -> idle`
- 失敗: `syncing -> failed -> idle`
- 再試行: `failed -> syncing`
- 禁止: 定期ポーリング実行（v1非対応）

## 7. 失敗モードと回復方針
- push/pull失敗: `lastSyncStatus=failed` と再試行導線表示。
- 競合: LWW適用後の最終状態のみ反映。
- 通信断: ローカル継続、次契機で再送。

## 8. セキュリティ・監査・保持
- HTTPS前提で通信。
- 監査: trigger、accepted/rejected mutation数、error code。

## 9. 受入条件（GWT）
- Given outboxにpendingがある
- When 手動同期を実行する
- Then push/pull成功後にoutboxが消し込まれる

## 10. トレーサビリティ（FR, AT, SCR, JRN）
- FR: FR-080, FR-081, FR-082, FR-082A, FR-083, FR-084, FR-085, FR-086, FR-088, FR-089, FR-089A
- AT: AT-SYNC-001, AT-SYNC-002, AT-SYNC-003, AT-SYNC-004, AT-SYNC-005, AT-SYNC-006, AT-API-001, AT-API-004
- SCR: SCR-SYNC-STATUS-001, SCR-HOME-001
- JRN: JRN-005-SYNC
