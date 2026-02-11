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
- 参照: `../../../requirements/12_ui_data_binding_matrix.md` の同期UI定義（本仕様では `UI-001-SYNC`, `UI-002-SYNC`）。
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
- FR: FR-080〜FR-089A
- AT: AT-SYNC-001〜AT-SYNC-006, AT-RECOVERY-001〜AT-RECOVERY-003
- E2E/UT/VR: E2E-SYNC-001〜E2E-SYNC-006, E2E-RECOVERY-001〜E2E-RECOVERY-003（`../50_quality/test-link-index.md` 参照）
- CAP: `../30_capabilities/CAP-SYNC-001.md`, `../30_capabilities/CAP-RECOVERY-001.md`
