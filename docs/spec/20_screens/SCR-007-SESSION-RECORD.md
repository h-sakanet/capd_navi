# SCR-007-SESSION-RECORD

## 1. メタ情報
- SCR ID: SCR-SESSION-RECORD-001
- 画面名: 記録モーダル
- Route/I/F: Session内Dialog
- 主JRN: JRN-003-SESSION
- Phase: Phase1

## 2. 目的と責務境界
- この画面で決めること: `record_event` ごとのフォーム表示、入力検証、保存。
- この画面で決めないこと: ステップ遷移順序、通知再送、同期アルゴリズム。

## 3. UIワイヤー・レイアウト制約
```text
+------------------------------------------------+
| 記録入力（record_event=*）                      |
| フォーム本体: FC-* に従って動的表示             |
| 例) 排液確認 / 排液量 / 注液量 / サマリ         |
|                          [キャンセル] [保存]    |
+------------------------------------------------+
```

- `FC-*` 定義の表示順を変更しません。
- `summaryScope=both` の11項目は固定順で表示します。

## 4. UI要素一覧
| UI ID | 要素 | 表示条件 | 入力制約 | セレクタ方針 |
|---|---|---|---|---|
| UI-001-RECORD | 排液の確認フォーム（FC-DRAIN-APPEARANCE-001） | `record_event=drain_appearance` | 見た目分類必須 | role/form |
| UI-002-RECORD | 排液量フォーム（FC-DRAIN-WEIGHT-001） | `record_event=drain_weight_g` | 正の数値必須 | role/form |
| UI-003-RECORD | 注液量フォーム（FC-BAG-WEIGHT-001） | `record_event=bag_weight_g` | 正の数値必須 | role/form |
| UI-004-RECORD | サマリフォーム（FC-SUMMARY-001〜003） | `record_event=session_summary` | `summaryScope` ごと必須項目 | role/form |
| UI-005-RECORD | 保存ボタン | 常時 | 必須未充足時disabled | role/button + name |

## 5. 操作契約
| ACT ID | Guard | Side Effect | Success遷移 | Failure表示 |
|---|---|---|---|---|
| ACT-003-SESSION | `FC-*` 必須条件充足 | `Record` 保存 + outbox追記 | SCR-007-SESSION-RECORD -> SCR-006-SESSION | 入力不備エラー |

## 6. データバインディング
| 区分 | Read | Write | Outbox | 反映タイミング |
|---|---|---|---|---|
| フォーム表示 | `FC-*` 定義, `summaryScope` | - | - | on dialog open |
| 保存 | 入力値 | `Record(record_event, payload)` | `record` 追記 | on save |

### 6.1 フォーム契約（FC）詳細
- 本画面で使用する `FC-*` の一次仕様はこの節を正とします。

| FC ID | 主画面 | 条件 | 保存先 | 対応AT |
|---|---|---|---|---|
| FC-DRAIN-APPEARANCE-001 | SCR-007-SESSION-RECORD | `record_event=drain_appearance` | `Record(record_event=drain_appearance)` | AT-FLOW-002 |
| FC-DRAIN-WEIGHT-001 | SCR-007-SESSION-RECORD | `record_event=drain_weight_g` | `Record(record_event=drain_weight_g)` | AT-FLOW-002 |
| FC-BAG-WEIGHT-001 | SCR-007-SESSION-RECORD | `record_event=bag_weight_g` | `Record(record_event=bag_weight_g)` | AT-FLOW-002 |
| FC-SUMMARY-001 | SCR-007-SESSION-RECORD | `summaryScope=first_of_day` | `Record(record_event=session_summary)` | AT-EXIT-002 |
| FC-SUMMARY-002 | SCR-007-SESSION-RECORD | `summaryScope=last_of_day` | `Record(record_event=session_summary)` | AT-EXIT-001 |
| FC-SUMMARY-003 | SCR-007-SESSION-RECORD | `summaryScope=both` | `Record(record_event=session_summary)` | AT-EXIT-011 |

#### FC-SUMMARY-001 `summaryScope=first_of_day`
- 必須項目:
  - 血圧上
  - 血圧下
  - 体重
  - 脈拍
  - 体温
  - 出口部状態（複数選択）
- 表示順:
  1. 血圧上（mmHg）
  2. 血圧下（mmHg）
  3. 体重（kg）
  4. 脈拍（回/分）
  5. 体温（℃）
  6. 出口部状態（`正常/赤み/痛み/はれ/かさぶた/じゅくじゅく/出血/膿`）
  7. 症状メモ（任意）
  8. 備考（任意）

#### FC-SUMMARY-002 `summaryScope=last_of_day`
- 必須項目:
  - 飲水量
  - 尿量
  - 排便回数
- 表示順:
  1. 飲水量（ml）
  2. 尿量（ml）
  3. 排便回数（回）
  4. 症状メモ（任意）
  5. 備考（任意）

#### FC-SUMMARY-003 `summaryScope=both`
- 必須項目: FC-SUMMARY-001 と FC-SUMMARY-002 の必須項目をすべて満たします。
- 表示順（固定）:
  1. 血圧上（mmHg）【必須】
  2. 血圧下（mmHg）【必須】
  3. 体重（kg）【必須】
  4. 脈拍（回/分）【必須】
  5. 体温（℃）【必須】
  6. 出口部状態（複数選択）【必須】
  7. 飲水量（ml）【必須】
  8. 尿量（ml）【必須】
  9. 排便回数（回）【必須】
  10. 症状メモ（任意）
  11. 備考（任意）

## 7. バリデーション / エラー文言 / 空状態
- バリデーション:
  - `drain_weight_g`, `bag_weight_g` は正の数値。
  - `summaryScope` ごとの必須項目を強制。
  - `summaryScope` 不正値は保存拒否せず、scopeのみ破棄して他値を保存。
- エラー文言:
  - `必須項目が未入力です。`
  - `出口部状態を1つ以上選択してください。`
- 空状態: 記録対象がないステップでは本モーダルを表示しません。

## 8. 権限・端末差分・フォールバック
- Mac/iPhoneともに記録入力可。

## 9. アクセシビリティ / キーボード
- 入力順は `FC-*` 表示順に合わせて固定。
- 数値フィールドは単位を明示（mmHg/g/ml/kg）。

## 10. 受入条件（GWT）
- Given `record_event` ステップで記録未保存
- When 次へを実行する
- Then ブロックされ本モーダル保存が必要になる

## 11. 参照リンク
- Local FR: `SCR-007-SESSION-RECORD-FR-01` 〜 `SCR-007-SESSION-RECORD-FR-17`
- 旧FR対応: FR-040〜FR-044D（FR-041, FR-043, FR-044A, FR-044B を含む）, FR-042A〜FR-042H
- AT: AT-FLOW-002
- E2E/UT/VR: E2E-FLOW-006, VR-SESSION-003（`../50_quality/test-link-index.md` 参照）
- CAP: `../30_capabilities/CAP-SNAPSHOT-001.md`

## 12. 画面機能要件（ローカルID）

- 採番規則: `<文書ID>-FR-yy`（yyはこの文書内連番）
- 旧FR IDは括弧内に残し、移行トレーサビリティを保持します。

- SCR-007-SESSION-RECORD-FR-01: (旧: FR-040) `drain_appearance` 入力モーダルを提供します。
- SCR-007-SESSION-RECORD-FR-02: (旧: FR-041) 見た目分類は `透明/やや混濁/混濁/血性/その他` を提供します。
- SCR-007-SESSION-RECORD-FR-03: (旧: FR-042) 廃液の記録写真（`drain`）は任意入力です。
- SCR-007-SESSION-RECORD-FR-04: (旧: FR-042A) 出口部の記録写真（`exit_site`）は `session_summary.payload.exit_site_photo` に保存します（`record_event` は追加しません）。
- SCR-007-SESSION-RECORD-FR-05: (旧: FR-042B) 出口部写真の対象レコードは当日 `summaryScope=both` を最優先し、次に `summaryScope=first_of_day` を採用します。同値時は `completedAt` 昇順、さらに同値時は `recordId` 昇順で決定します。
- SCR-007-SESSION-RECORD-FR-06: (旧: FR-042C) 出口部写真の登録導線は、対象 `session_summary` の入力完了後に表示します。
- SCR-007-SESSION-RECORD-FR-07: (旧: FR-042D) 出口部写真の操作導線は `iPhoneホーム全体サマリ` と `iPhone記録詳細` の両方に表示します。Macは閲覧リンクのみ表示し、登録/変更/削除操作は許可しません。
- SCR-007-SESSION-RECORD-FR-08: (旧: FR-042E) 出口部写真は1レコード1枚固定とし、登録後は `変更` と `削除` を許可します。
- SCR-007-SESSION-RECORD-FR-09: (旧: FR-042F) 出口部写真の入力手段は iPhone の `カメラ撮影` と `ファイル選択` の両方を許可します。
- SCR-007-SESSION-RECORD-FR-10: (旧: FR-042G) 出口部写真は任意入力であり、未登録でも手技完了を阻害しません。
- SCR-007-SESSION-RECORD-FR-11: (旧: FR-042H) 出口部写真の削除時は `session_summary.payload.exit_site_photo=null` を保存し、対応画像は tombstone 化します。
- SCR-007-SESSION-RECORD-FR-12: (旧: FR-043) `drain_weight_g` と `bag_weight_g` を g単位で保存します。
- SCR-007-SESSION-RECORD-FR-13: (旧: FR-044) `session_summary` で以下を収集します。
- SCR-007-SESSION-RECORD-FR-14: (旧: FR-044A) 同一日に1セッションのみ完了した場合は、最初/最後の両条件を同時適用し、必須項目をすべて満たす必要があります。
- SCR-007-SESSION-RECORD-FR-15: (旧: FR-044B) 出口部状態は複数選択チェックボックスで入力し、語彙は `正常/赤み/痛み/はれ/かさぶた/じゅくじゅく/出血/膿` とします。追加の自由記述は備考欄に入力します。
- SCR-007-SESSION-RECORD-FR-16: (旧: FR-044C) `session_summary.summaryScope`（`first_of_day` / `last_of_day` / `both`）は最終ステップ完了時にローカルで算出し、同期時に共有します。
- SCR-007-SESSION-RECORD-FR-17: (旧: FR-044D) `summaryScope` が未指定または不正値でも保存拒否せず、`summaryScope` のみ破棄して他の妥当な入力値を保存します。
