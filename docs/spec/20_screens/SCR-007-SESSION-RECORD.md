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
- 参照: `../../../requirements/11_form_contracts.md` 4章。
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
| ACT-003-SESSION | `FC-*` 必須条件充足 | `Record` 保存 + outbox追記 | SCR-006-SESSION | 入力不備エラー |

## 6. データバインディング
| 区分 | Read | Write | Outbox | 反映タイミング |
|---|---|---|---|---|
| フォーム表示 | `FC-*` 定義, `summaryScope` | - | - | on dialog open |
| 保存 | 入力値 | `Record(record_event, payload)` | `record` 追記 | on save |

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
- FR: FR-040〜FR-044D, FR-042A〜FR-042H
- AT: AT-FLOW-002
- E2E/UT/VR: E2E-FLOW-006, VR-SESSION-003（`../50_quality/test-link-index.md` 参照）
- CAP: `../30_capabilities/CAP-SNAPSHOT-001.md`
