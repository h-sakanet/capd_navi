# SCR-012-MAC-IMPORT

## 1. メタ情報
- SCR ID: SCR-MAC-IMPORT-001
- 画面名: CSV取込I/F
- Route/I/F: `ProtocolImportService.importFromDirectory`
- 主JRN: JRN-001-CSV
- Phase: Phase1

## 2. 目的と責務境界
- この画面で決めること: ディレクトリ選択、検証実行、結果表示（成功/警告/エラー）、再試行導線。
- この画面で決めないこと: CSV仕様そのもの（列定義、バリデーション規則の意味）。

## 3. UIワイヤー・レイアウト制約
- 画面構成（固定）:
  1. 取込対象ディレクトリ表示領域
  2. 実行ボタン（取込実行）
  3. 実行中インジケータ
  4. 結果サマリ（stepCount/timerCount/alarmCount/recordEventCount）
  5. エラー一覧（行/列/メッセージ）
  6. 警告一覧（行/列/メッセージ）
  7. Homeへ戻る
- 状態: `idle` / `validating` / `failed` / `succeeded_with_warnings` / `succeeded`

## 4. UI要素一覧
| UI ID | 要素 | 表示条件 | 入力制約 | セレクタ方針 |
|---|---|---|---|---|
| UI-001-IMPORT | ディレクトリ選択ボタン | 常時 | Macのみ有効 | role/button + name |
| UI-002-IMPORT | 取込実行ボタン | `basePath` あり | 実行中はdisabled | role/button + name |
| UI-003-IMPORT | 実行中表示 | `validating` | なし | role/status |
| UI-004-IMPORT | 結果サマリ | 実行後 | 数値のみ | data-testid |
| UI-005-IMPORT | エラー一覧 | `errors.length > 0` | 1件以上でfailed | role/table |
| UI-006-IMPORT | 警告一覧 | `warnings.length > 0` | success継続可 | role/table |

## 5. 操作契約
| ACT ID | Guard | Side Effect | Success遷移 | Failure表示 |
|---|---|---|---|---|
| ACT-007-HOME | `platform=mac` | `ProtocolPackage` 保存 + outbox追記 | SCR-012-MAC-IMPORT -> SCR-001-HOME | 検証エラー一覧 |

## 6. データバインディング
| 区分 | Read | Write | Outbox | 反映タイミング |
|---|---|---|---|---|
| 実行前 | `platform` | - | - | on load |
| 実行時 | `protocol.csv`, 画像群 | `ProtocolPackage` | `protocol` 追記 | on import success |
| 失敗時 | `errors[]`, `warnings[]` | - | - | on import failed |

## 7. バリデーション / エラー文言 / 空状態
- バリデーション: `format_version=3`, `step_id` 重複禁止, `next_step_id` 整合, 画像存在。
- エラー文言（例）:
  - `CSV v3の必須列 row_type がありません。`
  - `step_id が重複しています。`
  - `画像ファイルが存在しません。`
- 空状態:
  - `ディレクトリを選択してください。`

## 8. 権限・端末差分・フォールバック
- Mac以外では更新不可。iPhoneは「Macのみ対応」を表示。
- ネイティブI/F失敗時は再試行導線を表示。

## 9. アクセシビリティ / キーボード
- Enterで取込実行可能。
- 実行中は `aria-busy=true` を設定。
- エラー一覧はスクリーンリーダーで読めるテーブル構造にする。

## 10. 受入条件（GWT）
- Given 正常CSV v3 + 画像群がある
- When 取込実行する
- Then 成功しテンプレート登録される
- Given `step_id` 重複CSV
- When 取込実行する
- Then エラーで中止し一覧を表示する

## 11. 参照リンク
- FR: FR-020, FR-021, FR-022, FR-023, FR-024, FR-082A
- AT: AT-CSV-001, AT-CSV-002, AT-CSV-003, AT-CSV-004, AT-API-003
- E2E: E2E-CSV-001, E2E-CSV-002, E2E-CSV-003, E2E-CSV-004
- CAP: `../30_capabilities/CAP-CSV-IMPORT-001.md`
