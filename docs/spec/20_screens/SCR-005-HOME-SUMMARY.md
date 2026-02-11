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
```text
+-----------------------------------------------+
| 全体サマリ（record_event=session_summary）     |
| 1日の総除水量: +850 g（#1〜#5の除水量合計）      |
| 尿量: 900 ml  飲水量: 1200 ml                  |
| 体重: 54.2 kg  排便回数: 1回                   |
| 体温: 36.5℃  血圧: 120 / 80 mmHg               |
| 脈拍: 68回/分                                   |
| 出口部状態: 正常                                |
| 症状メモ: なし                                  |
| 備考: -                                         |
+-----------------------------------------------+
| 出口部写真（記録写真）                          |
| 未登録: [登録]                                  |
| 登録済み: [変更] [削除]                         |
+-----------------------------------------------+
```

- `summaryScope=both` のときは表示順を次で固定します。  
  1日の総除水量 -> 尿量 -> 飲水量 -> 体重 -> 排便回数 -> 体温 -> 血圧上 -> 血圧下 -> 脈拍 -> 出口部状態 -> 症状メモ -> 備考
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
| UI-006-HOME-SUMMARY | 1日の総除水量 | 当日記録あり | #1〜#5交換の除水量合計を自動計算 | role/status |

## 5. 操作契約
| ACT ID | Guard | Side Effect | Success遷移 | Failure表示 |
|---|---|---|---|---|
| ACT-001-EXIT | iPhoneかつ対象`summaryScope`完了 | `payload.exit_site_photo` 部分更新 + photo保存 | SCR-005-HOME-SUMMARY | 端末制約/入力エラー |
| ACT-002-EXIT | iPhoneかつ既存写真あり | 既存1枚を置換 | SCR-005-HOME-SUMMARY | 保存エラー |
| ACT-003-EXIT | iPhoneかつ既存写真あり | `exit_site_photo=null` 保存 + tombstone | SCR-005-HOME-SUMMARY | 削除エラー |

## 6. データバインディング
| 区分 | Read | Write | Outbox | 反映タイミング |
|---|---|---|---|---|
| 1日の総除水量 | `Record(drain_weight_g, bag_weight_g, *_exchange_no)` | - | - | on load / after save |
| サマリ表示 | `Record(record_event=session_summary)` | - | - | on load |
| 出口部写真表示 | `payload.exit_site_photo` | - | - | on load / after sync |
| 登録/変更/削除 | `summaryScope`, `exit_site_photo` | `payload.exit_site_photo` patch | `record` patch 追記 | on submit |

## 7. バリデーション / エラー文言 / 空状態
- バリデーション:
  - 1日の総除水量は #1〜#5 交換を走査し、`除水量=排液量-前回注液量` の計算可能な交換を合算して表示。
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
- Local FR: `SCR-005-HOME-SUMMARY-FR-01` 〜 `SCR-005-HOME-SUMMARY-FR-15`
- 旧FR対応: FR-014A, FR-015, FR-015A, FR-015B, FR-042A〜FR-042H, FR-044C, FR-089A, FR-090A
- AT: AT-EXIT-001, AT-EXIT-002, AT-EXIT-004〜AT-EXIT-011
- E2E/UT/VR: E2E-EXIT-001〜E2E-EXIT-006（`../50_quality/test-link-index.md` 参照）
- CAP: `../30_capabilities/CAP-PHOTO-BACKUP-001.md`, `../30_capabilities/CAP-SNAPSHOT-001.md`

## 12. 画面機能要件（ローカルID）

- 採番規則: `<文書ID>-FR-yy`（yyはこの文書内連番）
- 旧FR IDは括弧内に残し、移行トレーサビリティを保持します。

- SCR-005-HOME-SUMMARY-FR-01: (旧: FR-014A) 記録一覧には既存写真列とは別に `出口部写真` 列を追加し、`未登録` / `表示` を切り替えます。
- SCR-005-HOME-SUMMARY-FR-02: (旧: FR-015) 交換ごとの除水量と1日の総除水量は、`排液量 - 前回注液量` の差し引きで自動計算表示します。
- SCR-005-HOME-SUMMARY-FR-03: (旧: FR-015A) 初回交換（#1列）は前回注液量が存在しないため、除水量は `未計算` 表示とします。
- SCR-005-HOME-SUMMARY-FR-04: (旧: FR-015B) 1日の総除水量は、計算可能な交換（#2列以降で前回注液量が存在する交換）のみを合算します。
- SCR-005-HOME-SUMMARY-FR-05: (旧: FR-042A) 出口部の記録写真（`exit_site`）は `session_summary.payload.exit_site_photo` に保存します（`record_event` は追加しません）。
- SCR-005-HOME-SUMMARY-FR-06: (旧: FR-042B) 出口部写真の対象レコードは当日 `summaryScope=both` を最優先し、次に `summaryScope=first_of_day` を採用します。同値時は `completedAt` 昇順、さらに同値時は `recordId` 昇順で決定します。
- SCR-005-HOME-SUMMARY-FR-07: (旧: FR-042C) 出口部写真の登録導線は、対象 `session_summary` の入力完了後に表示します。
- SCR-005-HOME-SUMMARY-FR-08: (旧: FR-042D) 出口部写真の操作導線は `iPhoneホーム全体サマリ` と `iPhone記録詳細` の両方に表示します。Macは閲覧リンクのみ表示し、登録/変更/削除操作は許可しません。
- SCR-005-HOME-SUMMARY-FR-09: (旧: FR-042E) 出口部写真は1レコード1枚固定とし、登録後は `変更` と `削除` を許可します。
- SCR-005-HOME-SUMMARY-FR-10: (旧: FR-042F) 出口部写真の入力手段は iPhone の `カメラ撮影` と `ファイル選択` の両方を許可します。
- SCR-005-HOME-SUMMARY-FR-11: (旧: FR-042G) 出口部写真は任意入力であり、未登録でも手技完了を阻害しません。
- SCR-005-HOME-SUMMARY-FR-12: (旧: FR-042H) 出口部写真の削除時は `session_summary.payload.exit_site_photo=null` を保存し、対応画像は tombstone 化します。
- SCR-005-HOME-SUMMARY-FR-13: (旧: FR-044C) `session_summary.summaryScope`（`first_of_day` / `last_of_day` / `both`）は最終ステップ完了時にローカルで算出し、同期時に共有します。
- SCR-005-HOME-SUMMARY-FR-14: (旧: FR-089A) `session_summary.payload.exit_site_photo` の更新は部分パッチ（`patch_path=payload.exit_site_photo`）で同期し、同一record内の他フィールドを上書きしません。
- SCR-005-HOME-SUMMARY-FR-15: (旧: FR-090A) 写真参照メタには `photo_kind`（`drain` / `exit_site`）を保持します。
