# SCR-011-SYNC-STATUS

## 1. メタ情報
- SCR ID: SCR-SYNC-STATUS-001
- 画面名: 同期状態表示
- Route/I/F: Header/バナー
- 主JRN: JRN-005-SYNC, JRN-006-RECOVERY
- Phase: Phase1

## 2. 目的と責務境界
- この画面で決めること: 同期状態表示、失敗時の再試行導線、復旧状態表示。
- この画面で決めないこと: push/pullの内部処理、LWW比較実装。

## 3. UIワイヤー・レイアウト制約
```text
+------------------------------------------------+
| 同期状態: 成功（2026-02-10 21:04）              |
| outbox: 0 pending                               |
+------------------------------------------------+
| 同期状態: 失敗                                   |
| reason: timeout                                  |
| [再試行]                                         |
+------------------------------------------------+
| 復旧中: cloudState=missing -> full_reseed実行中 |
+------------------------------------------------+
```

- 状態は `success/failed` を明示表示。
- 失敗時は再試行ボタンを必ず表示。

## 4. UI要素一覧
| UI ID | 要素 | 表示条件 | 入力制約 | セレクタ方針 |
|---|---|---|---|---|
| UI-001-SYNC | 同期状態表示 | 常時 | 読み取り専用 | role/status |
| UI-002-SYNC | 手動再試行ボタン | `lastSyncStatus=failed` | 連打抑止 | role/button + name |
| UI-003-SYNC | 復旧進行表示 | `cloudState=missing` または `full_reseeding` | 読み取り専用 | role/alert |

## 5. 操作契約
| ACT ID | Guard | Side Effect | Success遷移 | Failure表示 |
|---|---|---|---|---|
| ACT-001-SYNC | `startup/resume/session_complete/manual` 契機 | push->pull。必要時 `full_reseed` | 現在画面維持 | 同期失敗表示 |

## 6. データバインディング
| 区分 | Read | Write | Outbox | 反映タイミング |
|---|---|---|---|---|
| 状態表示 | `SyncState.lastSyncStatus`, `lastError`, `lastSyncedAt` | - | - | on load / after sync |
| 自動同期 | `outbox`, `cloudRevision`, `dayRefs` | `SyncState` | push成功分を消し込み | on trigger |
| 再シード | `cloudState` | `SyncState.lastSyncStatus` | `full_reseed` mutation | on missing detect |

## 7. バリデーション / エラー文言 / 空状態
- バリデーション:
  - `cloudState=missing` 時は `full_reseed` を必須実行。
  - 再シード失敗時はローカルデータを変更しない。
- エラー文言:
  - `同期に失敗しました。再試行してください。`
  - `クラウド欠損を検知しました。再構築を実行します。`
- 空状態: `まだ同期されていません。`

## 8. 権限・端末差分・フォールバック
- Mac/iPhone共通表示。
- 通信断時はローカル利用を継続し再試行導線のみ提供。

## 9. アクセシビリティ / キーボード
- 状態変化を `aria-live` で通知。
- 再試行ボタンをキーボード操作可能にします。

## 10. 受入条件（GWT）
- Given `cloudState=missing`
- When 同期を実行する
- Then `full_reseed` 実行後に `cloudState=ok` 確認まで進む

## 11. 参照リンク
- Local FR: `SCR-011-SYNC-STATUS-FR-01` 〜 `SCR-011-SYNC-STATUS-FR-16`
- 旧FR対応: FR-080〜FR-089A
- AT: AT-SYNC-001〜AT-SYNC-006, AT-RECOVERY-001〜AT-RECOVERY-003
- E2E/UT/VR: E2E-SYNC-001〜E2E-SYNC-006, E2E-RECOVERY-001〜E2E-RECOVERY-003（`../50_quality/test-link-index.md` 参照）
- CAP: `../30_capabilities/CAP-SYNC-001.md`, `../30_capabilities/CAP-RECOVERY-001.md`

## 12. 画面機能要件（ローカルID）

- 採番規則: `<文書ID>-FR-yy`（yyはこの文書内連番）
- 旧FR IDは括弧内に残し、移行トレーサビリティを保持します。

- SCR-011-SYNC-STATUS-FR-01: (旧: FR-080) 同期は `startup` / `resume` / `session_complete` / `manual` の4契機で実行します。
- SCR-011-SYNC-STATUS-FR-02: (旧: FR-081) すべてのローカル更新は `outbox` に追記し、push成功時に消し込みます。
- SCR-011-SYNC-STATUS-FR-03: (旧: FR-082) 差分取得は `cloudRevision` と `dayRefs` に基づき実行します。
- SCR-011-SYNC-STATUS-FR-04: (旧: FR-082A) 公開HTTP APIは `POST /sync/push` と `POST /sync/pull` のみとし、CSV取り込みはローカルI/F（`ProtocolImportService.importFromDirectory`）で実行します。
- SCR-011-SYNC-STATUS-FR-05: (旧: FR-083) 競合解決はエンティティ単位LWW（`updatedAt`, `updatedByDeviceId`, `mutationId` 降順）で固定します。
- SCR-011-SYNC-STATUS-FR-06: (旧: FR-084) tombstone（削除）もLWW同一ルールで解決します。
- SCR-011-SYNC-STATUS-FR-07: (旧: FR-085) 競合解決は内部適用のみとし、競合件数バナーや詳細一覧は提供しません。
- SCR-011-SYNC-STATUS-FR-08: (旧: FR-086) 手動同期ボタンを提供し、失敗時は再試行導線を表示します。
- SCR-011-SYNC-STATUS-FR-09: (旧: FR-087) IndexedDB消失検知時はクラウドからフルリストアを実行します。
- SCR-011-SYNC-STATUS-FR-10: (旧: FR-087A) `POST /sync/pull` が `cloudState=missing` を返した場合、クラウド欠損と判定します。
- SCR-011-SYNC-STATUS-FR-11: (旧: FR-087B) クラウド欠損判定時はローカルデータを正本として `syncMode=full_reseed` で全量再シードを実行し、ローカルデータは削除/初期化しません。
- SCR-011-SYNC-STATUS-FR-12: (旧: FR-087C) 全量再シード成功後は再度 `POST /sync/pull` を実行し、`cloudState=ok` と `cloudRevision` 更新を確認して同期完了とします。
- SCR-011-SYNC-STATUS-FR-13: (旧: FR-087D) 全量再シード失敗時はローカルデータを不変のまま保持し、`lastSyncStatus=failed` と再試行導線を表示します。
- SCR-011-SYNC-STATUS-FR-14: (旧: FR-088) 同期失敗時は直近同期状態（成功/失敗）を更新し、再試行導線を表示します。
- SCR-011-SYNC-STATUS-FR-15: (旧: FR-089) `120秒ポーリング` は実装しません。
- SCR-011-SYNC-STATUS-FR-16: (旧: FR-089A) `session_summary.payload.exit_site_photo` の更新は部分パッチ（`patch_path=payload.exit_site_photo`）で同期し、同一record内の他フィールドを上書きしません。
