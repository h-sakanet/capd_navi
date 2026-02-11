# SCR-008-HISTORY

## 1. メタ情報
- SCR ID: SCR-HISTORY-001
- 画面名: 記録一覧
- Route/I/F: `/capd/history-list`
- 主JRN: JRN-008-HISTORY
- Phase: Phase1

## 2. 目的と責務境界
- この画面で決めること: 直近30日一覧表示、写真詳細/記録詳細への導線、一覧列の表示規則。
- この画面で決めないこと: 写真保存処理、記録保存処理、同期競合解決。

## 3. UIワイヤー・レイアウト制約
```text
+------------------------------------------------+
| 記録一覧                                         |
| 期間: [直近30日 v]  [検索]                      |
+------------------------------------------------+
| 日付 | 透析液濃度(#1-#5) | 貯留時間(#1-#5)      |
| 排液量(#1-#5) | 注液量(#1-#5) | 排液確認(#1-#5) |
| 除水量(#1は未計算、#2以降は排液量-前回注液量)   |
| 総除水量 | 尿量/飲水量 | 体重 | 血圧 | 写真     |
| 2026-02-09 | レギニュール1.5 | ... | ...        |
+------------------------------------------------+
| [ホームへ戻る]                                   |
+------------------------------------------------+
```

- 表示列は `#1〜#5` 固定。
- 写真はサムネイル固定表示ではなくリンク遷移。

## 4. UI要素一覧
| UI ID | 要素 | 表示条件 | 入力制約 | セレクタ方針 |
|---|---|---|---|---|
| UI-001-HISTORY | 記録一覧テーブル | 記録あり | 直近30日固定 | role/table |
| UI-002-HISTORY | 写真詳細リンク | `photoId` あり | 対象photo必須 | role/link |
| UI-003-HISTORY | 出口部写真列 | 常時 | `未登録/表示` 切替 | role/cell |

## 5. 操作契約
| ACT ID | Guard | Side Effect | Success遷移 | Failure表示 |
|---|---|---|---|---|
| ACT-001-HISTORY | 対象`photoId`が存在 | なし | SCR-010-HISTORY-PHOTO | 写真未登録文言 |

## 6. データバインディング
| 区分 | Read | Write | Outbox | 反映タイミング |
|---|---|---|---|---|
| 一覧表示 | `DayBundle.records`, `sessions`, `dailyProcedurePlan` | - | - | on load |
| 列表示 | `record_exchange_no`, `timer_exchange_no`, `summary` | - | - | on load |
| 写真リンク | `photoRefs`, `payload.exit_site_photo` | - | - | on click |

## 7. バリデーション / エラー文言 / 空状態
- バリデーション:
  - `record_event` と `*_exchange_no` で列マッピング。
  - 除水量は `排液量 - 前回注液量`、#1は`未計算`。
- エラー文言: `写真が登録されていません。`
- 空状態: `表示できる記録がありません。`

## 8. 権限・端末差分・フォールバック
- Mac/iPhoneともに閲覧可。
- 編集導線は詳細画面で提供。

## 9. アクセシビリティ / キーボード
- テーブルヘッダを明示し列意味を読み上げ可能にします。
- 写真リンクはリンクテキストに状態（表示/未登録）を含めます。

## 10. 受入条件（GWT）
- Given 写真リンク付き記録がある
- When 写真詳細リンクを押下する
- Then 写真詳細画面へ遷移する

## 11. 参照リンク
- Local FR: `SCR-008-HISTORY-FR-01` 〜 `SCR-008-HISTORY-FR-14`
- 旧FR対応: FR-010〜FR-019, FR-014A, FR-015A〜FR-015C, FR-016
- AT: （JRN-008-HISTORYで一括管理）
- E2E/UT/VR: E2E-EXIT-002, VR-HISTORY-001, VR-HISTORY-002（`../50_quality/test-link-index.md` 参照）
- CAP: `../30_capabilities/CAP-SNAPSHOT-001.md`

## 12. 画面機能要件（ローカルID）

- 採番規則: `<文書ID>-FR-yy`（yyはこの文書内連番）
- 旧FR IDは括弧内に残し、移行トレーサビリティを保持します。

- SCR-008-HISTORY-FR-01: (旧: FR-010) 記録一覧画面で日々の手技記録を一覧表示します。
- SCR-008-HISTORY-FR-02: (旧: FR-011) 記録一覧画面で詳細表示と編集導線を提供します。
- SCR-008-HISTORY-FR-03: (旧: FR-012) 記録編集はLWWメタ（`updatedAt`, `updatedByDeviceId`, `mutationId`）を保持して競合解決可能な状態にします。
- SCR-008-HISTORY-FR-04: (旧: FR-013) 記録一覧にはCAPDノート準拠項目（貯留時間、透析液濃度、排液量、注液量、排液時間、排液の確認、除水量、尿量、飲水量、体重、排便、血圧、出口部状態、備考）を表示します。
- SCR-008-HISTORY-FR-05: (旧: FR-014) 写真はサムネイル固定表示ではなく、リンク押下で写真詳細画面へ遷移します。
- SCR-008-HISTORY-FR-06: (旧: FR-014A) 記録一覧には既存写真列とは別に `出口部写真` 列を追加し、`未登録` / `表示` を切り替えます。
- SCR-008-HISTORY-FR-07: (旧: FR-015) 交換ごとの除水量と1日の総除水量は、`排液量 - 前回注液量` の差し引きで自動計算表示します。
- SCR-008-HISTORY-FR-08: (旧: FR-015A) 初回交換（#1列）は前回注液量が存在しないため、除水量は `未計算` 表示とします。
- SCR-008-HISTORY-FR-09: (旧: FR-015B) 1日の総除水量は、計算可能な交換（#2列以降で前回注液量が存在する交換）のみを合算します。
- SCR-008-HISTORY-FR-10: (旧: FR-015C) `opening_infuse_weight_g`（初期注液量）は v1 では空欄許容とし、除水量計算に使用しません。
- SCR-008-HISTORY-FR-11: (旧: FR-016) 当日ノート表と記録一覧の交換列は `#1〜#5` の5列固定とし、列位置は `*_exchange_no` で決定します。
- SCR-008-HISTORY-FR-12: (旧: FR-017) 透析液濃度欄は、取り込みCSVのタイトル（例: `レギニュール1.5`）を表示します。
- SCR-008-HISTORY-FR-13: (旧: FR-018) `record_event` の値は `record_exchange_no` で列マッピングし、`drain_weight_g` は排液量、`bag_weight_g` は注液量、`drain_appearance` は排液の確認に表示します。
- SCR-008-HISTORY-FR-14: (旧: FR-019) `timer_event` の値は `timer_exchange_no` で列マッピングし、`timer_segment=dwell` の `start/end` は貯留時間、`timer_segment=drain` の `start/end` は排液時間に表示します。
