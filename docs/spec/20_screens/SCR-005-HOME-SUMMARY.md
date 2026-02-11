# SCR-005-HOME-SUMMARY

## 1. メタ情報
- SCR ID: SCR-HOME-SUMMARY-001
- 画面名: Home全体サマリ
- Route/I/F: Home内Section
- 主JRN: JRN-009-EXITPHOTO
- Phase: Phase2

## 2. 目的と責務境界
- この画面で決めること: `session_summary` の要約表示と出口部写真の `登録/変更/削除` 導線。
- この画面で決めないこと: 写真圧縮アルゴリズム、同期競合解決ロジック。

## 3. UIワイヤー・レイアウト制約
- 参照: `../../../requirements/06_ui_wireframes_ab.md` 5.5。
- 出口部写真操作行は `未登録: 登録`、登録済み: `変更/削除` の表示切替を固定。
- 操作行は対象 `session_summary` 入力完了後のみ表示。

## 4. UI要素一覧
| UI ID | 要素 | 表示条件 | 入力制約 | セレクタ方針 |
|---|---|---|---|---|
| UI-001-HOME-SUMMARY | 全体サマリ表示 | 当日記録あり | 読み取り専用 | role/region |
| UI-002-HOME-SUMMARY | 出口部写真操作行 | `summaryScope=both` または `first_of_day` 完了 | iPhoneのみ更新可 | role/group |
| UI-003-HOME-SUMMARY | 写真登録ボタン | `exit_site_photo=null` | 1枚固定 | role/button + name |
| UI-004-HOME-SUMMARY | 写真変更ボタン | 既存写真あり | 置換のみ | role/button + name |
| UI-005-HOME-SUMMARY | 写真削除ボタン | 既存写真あり | `null` 保存 | role/button + name |

## 5. 操作契約
| ACT ID | Guard | Side Effect | Success遷移 | Failure表示 |
|---|---|---|---|---|
| ACT-001-EXIT | iPhoneかつ対象`summaryScope`完了 | `payload.exit_site_photo` 部分更新 + photo保存 | 同一画面維持 | 端末制約/入力エラー |
| ACT-002-EXIT | iPhoneかつ既存写真あり | 既存1枚を置換 | 同一画面維持 | 保存エラー |
| ACT-003-EXIT | iPhoneかつ既存写真あり | `exit_site_photo=null` 保存 + tombstone | 同一画面維持 | 削除エラー |

## 6. データバインディング
| 区分 | Read | Write | Outbox | 反映タイミング |
|---|---|---|---|---|
| サマリ表示 | `Record(record_event=session_summary)` | - | - | on load |
| 出口部写真表示 | `payload.exit_site_photo` | - | - | on load / after sync |
| 登録/変更/削除 | `summaryScope`, `exit_site_photo` | `payload.exit_site_photo` patch | `record` patch 追記 | on submit |

## 7. バリデーション / エラー文言 / 空状態
- バリデーション:
  - 対象レコード選択は `both` 優先、次に `first_of_day`。
  - 同値時は `completedAt` 昇順、次に `recordId` 昇順で決定。
  - 出口部写真は1レコード1枚固定。
- エラー文言:
  - `この端末では写真を更新できません。`
  - `写真の保存に失敗しました。再度お試しください。`
- 空状態: `出口部写真は未登録です。`

## 8. 権限・端末差分・フォールバック
- iPhone: `登録/変更/削除` を表示。
- Mac: 閲覧リンクのみ表示し更新操作は非表示。
- 同期失敗時はローカル表示を維持し、再同期後に反映。

## 9. アクセシビリティ / キーボード
- 操作ボタンに `aria-label` を設定（登録/変更/削除）。
- 写真未登録/登録済みの状態を文言でも明示。

## 10. 受入条件（GWT）
- Given `summaryScope` が未完了
- When Home全体サマリを表示
- Then 出口部写真の操作行を表示しない
- Given iPhoneで写真登録済み
- When 削除を実行する
- Then `exit_site_photo=null` が保存され未登録表示へ戻る

## 11. 参照リンク
- FR: FR-014A, FR-042A〜FR-042H, FR-044C, FR-089A, FR-090A
- AT: AT-EXIT-001, AT-EXIT-002, AT-EXIT-004〜AT-EXIT-011
- E2E/UT/VR: E2E-EXIT-001〜E2E-EXIT-006（`../50_quality/test-link-index.md` 参照）
- CAP: `../30_capabilities/CAP-PHOTO-BACKUP-001.md`, `../30_capabilities/CAP-SNAPSHOT-001.md`
