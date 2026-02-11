# SCR-009-HISTORY-DETAIL

## 1. メタ情報
- SCR ID: SCR-HISTORY-DETAIL-001
- 画面名: 記録詳細
- Route/I/F: `/capd/history/:recordId`
- 主JRN: JRN-008-HISTORY, JRN-009-EXITPHOTO
- Phase: Phase1

## 2. 目的と責務境界
- この画面で決めること: `session_summary` 詳細表示、出口部写真の更新導線、ホームサマリとの表示整合。
- この画面で決めないこと: 写真圧縮・バックアップ実装詳細、LWW内部比較ロジック。
- 出口部写真の更新導線は Phase2 で有効化します。

## 3. UIワイヤー・レイアウト制約
```text
+-----------------------------------------------+
| 記録詳細（record_event=session_summary）        |
| 血圧/体重/脈拍/体温                             |
| 出口部状態 / 飲水量 / 尿量 / 排便回数           |
| 症状メモ / 備考                                 |
+-----------------------------------------------+
| 出口部写真（記録写真）                          |
| 未登録: [登録]                                  |
| 登録済み: [変更] [削除]                         |
+-----------------------------------------------+
```

- ホーム全体サマリと同じ `登録/変更/削除` 行を表示。
- 両導線で同一レコード状態を表示し、文言差異を作らない。

## 4. UI要素一覧
| UI ID | 要素 | 表示条件 | 入力制約 | セレクタ方針 |
|---|---|---|---|---|
| UI-001-HISTORY-DETAIL | サマリ詳細 | `record_event=session_summary` | 読み取り専用 | role/region |
| UI-002-HISTORY-DETAIL | 出口部写真登録ボタン | iPhoneかつ未登録 | 1枚固定 | role/button + name |
| UI-003-HISTORY-DETAIL | 出口部写真変更ボタン | iPhoneかつ登録済み | 置換のみ | role/button + name |
| UI-004-HISTORY-DETAIL | 出口部写真削除ボタン | iPhoneかつ登録済み | `null` 保存 | role/button + name |

## 5. 操作契約
| ACT ID | Guard | Side Effect | Success遷移 | Failure表示 |
|---|---|---|---|---|
| ACT-001-EXIT | iPhoneかつ対象`summaryScope`完了 | `payload.exit_site_photo` 部分更新 + photo保存 | SCR-009-HISTORY-DETAIL | 端末制約/入力エラー |
| ACT-002-EXIT | iPhoneかつ既存写真あり | 既存1枚を置換 | SCR-009-HISTORY-DETAIL | 保存エラー |
| ACT-003-EXIT | iPhoneかつ既存写真あり | `exit_site_photo=null` 保存 + tombstone | SCR-009-HISTORY-DETAIL | 削除エラー |

## 6. データバインディング
| 区分 | Read | Write | Outbox | 反映タイミング |
|---|---|---|---|---|
| 詳細表示 | `Record(session_summary)` | - | - | on load |
| 写真表示 | `payload.exit_site_photo`, `photoRefs` | - | - | on load / after sync |
| 写真更新 | `payload.exit_site_photo` | `payload.exit_site_photo` patch | `record` patch 追記 | on submit |

## 7. バリデーション / エラー文言 / 空状態
- バリデーション:
  - 対象レコードは `both` 優先、次に `first_of_day`。
  - Macは更新不可（閲覧のみ）。
- エラー文言:
  - `この端末では更新できません。`
  - `写真の削除に失敗しました。`
- 空状態: `対象の記録が見つかりません。`

## 8. 権限・端末差分・フォールバック
- iPhone: 更新可。
- Mac: 閲覧のみ。
- 同期中は前回確定状態を保持し、完了後に再描画。

## 9. アクセシビリティ / キーボード
- 操作ボタンを明確なラベルで提供（登録/変更/削除）。
- 画像代替テキストに撮影日時を含めます。

## 10. 受入条件（GWT）
- Given iPhone詳細画面で写真未登録
- When 写真を登録する
- Then 表示が `変更/削除` に切り替わる

## 11. 参照リンク
- Local FR: `SCR-009-HISTORY-DETAIL-FR-01` 〜 `SCR-009-HISTORY-DETAIL-FR-13`
- 旧FR対応: FR-011, FR-012, FR-014A, FR-042A〜FR-042H, FR-044C, FR-089A
- AT: AT-EXIT-003〜AT-EXIT-010
- E2E/UT/VR: E2E-EXIT-002〜E2E-EXIT-005（`../50_quality/test-link-index.md` 参照）
- CAP: `../30_capabilities/CAP-PHOTO-BACKUP-001.md`, `../30_capabilities/CAP-SNAPSHOT-001.md`

## 12. 画面機能要件（ローカルID）

- 採番規則: `<文書ID>-FR-yy`（yyはこの文書内連番）
- 旧FR IDは括弧内に残し、移行トレーサビリティを保持します。

- SCR-009-HISTORY-DETAIL-FR-01: (旧: FR-011) 記録一覧画面で詳細表示と編集導線を提供します。
- SCR-009-HISTORY-DETAIL-FR-02: (旧: FR-012) 記録編集はLWWメタ（`updatedAt`, `updatedByDeviceId`, `mutationId`）を保持して競合解決可能な状態にします。
- SCR-009-HISTORY-DETAIL-FR-03: (旧: FR-014A) 記録一覧には既存写真列とは別に `出口部写真` 列を追加し、`未登録` / `表示` を切り替えます。
- SCR-009-HISTORY-DETAIL-FR-04: (旧: FR-042A) 出口部の記録写真（`exit_site`）は `session_summary.payload.exit_site_photo` に保存します（`record_event` は追加しません）。
- SCR-009-HISTORY-DETAIL-FR-05: (旧: FR-042B) 出口部写真の対象レコードは当日 `summaryScope=both` を最優先し、次に `summaryScope=first_of_day` を採用します。同値時は `completedAt` 昇順、さらに同値時は `recordId` 昇順で決定します。
- SCR-009-HISTORY-DETAIL-FR-06: (旧: FR-042C) 出口部写真の登録導線は、対象 `session_summary` の入力完了後に表示します。
- SCR-009-HISTORY-DETAIL-FR-07: (旧: FR-042D) 出口部写真の操作導線は `iPhoneホーム全体サマリ` と `iPhone記録詳細` の両方に表示します。Macは閲覧リンクのみ表示し、登録/変更/削除操作は許可しません。
- SCR-009-HISTORY-DETAIL-FR-08: (旧: FR-042E) 出口部写真は1レコード1枚固定とし、登録後は `変更` と `削除` を許可します。
- SCR-009-HISTORY-DETAIL-FR-09: (旧: FR-042F) 出口部写真の入力手段は iPhone の `カメラ撮影` と `ファイル選択` の両方を許可します。
- SCR-009-HISTORY-DETAIL-FR-10: (旧: FR-042G) 出口部写真は任意入力であり、未登録でも手技完了を阻害しません。
- SCR-009-HISTORY-DETAIL-FR-11: (旧: FR-042H) 出口部写真の削除時は `session_summary.payload.exit_site_photo=null` を保存し、対応画像は tombstone 化します。
- SCR-009-HISTORY-DETAIL-FR-12: (旧: FR-044C) `session_summary.summaryScope`（`first_of_day` / `last_of_day` / `both`）は最終ステップ完了時にローカルで算出し、同期時に共有します。
- SCR-009-HISTORY-DETAIL-FR-13: (旧: FR-089A) `session_summary.payload.exit_site_photo` の更新は部分パッチ（`patch_path=payload.exit_site_photo`）で同期し、同一record内の他フィールドを上書きしません。
