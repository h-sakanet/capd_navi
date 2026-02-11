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
- Local FR: `CAP-SYNC-001-FR-01` 〜 `CAP-SYNC-001-FR-11`
- 旧FR対応: FR-080, FR-081, FR-082, FR-082A, FR-083, FR-084, FR-085, FR-086, FR-088, FR-089, FR-089A
- AT: AT-SYNC-001, AT-SYNC-002, AT-SYNC-003, AT-SYNC-004, AT-SYNC-005, AT-SYNC-006, AT-API-001, AT-API-004
- SCR: SCR-SYNC-STATUS-001, SCR-HOME-001
- JRN: JRN-005-SYNC

## 11. 機能要件（ローカルID）

- 採番規則: `<文書ID>-FR-yy`（yyはこの文書内連番）
- 旧FR IDは括弧内に残し、移行トレーサビリティを保持します。

- CAP-SYNC-001-FR-01: (旧: FR-080) 同期は `startup` / `resume` / `session_complete` / `manual` の4契機で実行します。
- CAP-SYNC-001-FR-02: (旧: FR-081) すべてのローカル更新は `outbox` に追記し、push成功時に消し込みます。
- CAP-SYNC-001-FR-03: (旧: FR-082) 差分取得は `cloudRevision` と `dayRefs` に基づき実行します。
- CAP-SYNC-001-FR-04: (旧: FR-082A) 公開HTTP APIは `POST /sync/push` と `POST /sync/pull` のみとし、CSV取り込みはローカルI/F（`ProtocolImportService.importFromDirectory`）で実行します。
- CAP-SYNC-001-FR-05: (旧: FR-083) 競合解決はエンティティ単位LWW（`updatedAt`, `updatedByDeviceId`, `mutationId` 降順）で固定します。
- CAP-SYNC-001-FR-06: (旧: FR-084) tombstone（削除）もLWW同一ルールで解決します。
- CAP-SYNC-001-FR-07: (旧: FR-085) 競合解決は内部適用のみとし、競合件数バナーや詳細一覧は提供しません。
- CAP-SYNC-001-FR-08: (旧: FR-086) 手動同期ボタンを提供し、失敗時は再試行導線を表示します。
- CAP-SYNC-001-FR-09: (旧: FR-088) 同期失敗時は直近同期状態（成功/失敗）を更新し、再試行導線を表示します。
- CAP-SYNC-001-FR-10: (旧: FR-089) `120秒ポーリング` は実装しません。
- CAP-SYNC-001-FR-11: (旧: FR-089A) `session_summary.payload.exit_site_photo` の更新は部分パッチ（`patch_path=payload.exit_site_photo`）で同期し、同一record内の他フィールドを上書きしません。
