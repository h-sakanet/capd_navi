# SCR-010-HISTORY-PHOTO

## 1. メタ情報
- SCR ID: SCR-HISTORY-PHOTO-001
- 画面名: 写真詳細
- Route/I/F: `/capd/history-photo/:photoId`
- 主JRN: JRN-008-HISTORY
- Phase: Phase1

## 2. 目的と責務境界
- この画面で決めること: 写真単体の閲覧、撮影/登録情報の表示。
- この画面で決めないこと: 写真更新操作、削除操作、同期処理。

## 3. UIワイヤー・レイアウト制約
```text
+-----------------------------------------------+
| 写真詳細                                         |
| [写真本体]                                      |
| 種別: drain_photo / exit_site_photo             |
| 撮影時刻: 2026-02-10T20:35:00+09:00            |
|                    [記録一覧へ戻る]             |
+-----------------------------------------------+
```

- 写真本体を主表示とし、メタ情報（photo kind, capturedAt）を補助表示。

## 4. UI要素一覧
| UI ID | 要素 | 表示条件 | 入力制約 | セレクタ方針 |
|---|---|---|---|---|
| UI-001-HISTORY-PHOTO | 写真表示領域 | `photoId` 有効 | 読み取り専用 | role/img |
| UI-002-HISTORY-PHOTO | 写真メタ情報 | 写真あり | 読み取り専用 | role/status |
| UI-003-HISTORY-PHOTO | 戻るリンク | 常時 | なし | role/link + name |

## 5. 操作契約
| ACT ID | Guard | Side Effect | Success遷移 | Failure表示 |
|---|---|---|---|---|
| （なし） | - | - | - | - |

- 本画面への遷移起点は `SCR-008-HISTORY.md` の `ACT-001-HISTORY` を一次仕様とします。

## 6. データバインディング
| 区分 | Read | Write | Outbox | 反映タイミング |
|---|---|---|---|---|
| 写真本体 | `photoRefs`, `photos/{photoId}.jpg` | - | - | on load |
| 付随情報 | `photo_kind`, `captured_at` | - | - | on load |

## 7. バリデーション / エラー文言 / 空状態
- バリデーション: `photoId` 必須。
- エラー文言: `写真が見つかりません。`
- 空状態: `表示できる写真がありません。`

## 8. 権限・端末差分・フォールバック
- Mac/iPhoneともに閲覧可。
- オフラインで写真本体が未取得の場合は取得失敗表示。

## 9. アクセシビリティ / キーボード
- 画像に代替テキストを設定。
- 戻るリンクを先頭フォーカス可能にします。

## 10. 受入条件（GWT）
- Given 一覧に写真リンクがある
- When 詳細画面を開く
- Then 対応写真を表示する

## 11. 参照リンク
- Local FR: `SCR-010-HISTORY-PHOTO-FR-01` 〜 `SCR-010-HISTORY-PHOTO-FR-03`
- 旧FR対応: FR-014, FR-014A, FR-090A
- AT: AT-EXIT-008
- E2E/UT/VR: E2E-EXIT-004, VR-HISTORY-001, VR-HISTORY-002（`../50_quality/test-link-index.md` 参照）
- CAP: `../30_capabilities/CAP-PHOTO-BACKUP-001.md`

## 12. 画面機能要件（ローカルID）

- 採番規則: `<文書ID>-FR-yy`（yyはこの文書内連番）
- 旧FR IDは括弧内に残し、移行トレーサビリティを保持します。

- SCR-010-HISTORY-PHOTO-FR-01: (旧: FR-014) 写真はサムネイル固定表示ではなく、リンク押下で写真詳細画面へ遷移します。
- SCR-010-HISTORY-PHOTO-FR-02: (旧: FR-014A) 記録一覧には既存写真列とは別に `出口部写真` 列を追加し、`未登録` / `表示` を切り替えます。
- SCR-010-HISTORY-PHOTO-FR-03: (旧: FR-090A) 写真参照メタには `photo_kind`（`drain` / `exit_site`）を保持します。
