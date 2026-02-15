# SCR-012-MAC-IMPORT

## 1. メタ情報
- SCR ID: SCR-MAC-IMPORT-001
- 画面名: 手技テンプレート取り込み
- Route/I/F: `/capd/import`（Web） / `ProtocolImportService.importFromDirectory`（Native）
- 主JRN: JRN-001-CSV
- Phase: Phase1

## 2. 目的と責務境界
- この画面で決めること: 単一CSVファイル選択、画像フォルダ選択、選択直後の自動検証、取込内容表示、保存実行、再試行導線。
- この画面で決めないこと: CSV仕様そのもの（列定義、バリデーション規則の意味）。

## 3. UIワイヤー・レイアウト制約
```text
+------------------------------------------------+
| 手技テンプレート取り込み                          |
| 初期: [CSVファイルを選択]                        |
+------------------------------------------------+
| （CSV選択後）                                   |
| 選択ファイル: sample.csv                         |
| 実行状態: idle / validating / failed / succeeded |
+------------------------------------------------+
| protocol.csv 内容                                |
| [画像の格納先を選ぶ] 不足画像警告                |
| 結果サマリ: step=42                              |
|                        [保存] [Homeへ戻る]       |
+------------------------------------------------+
```

- 画面構成（固定）:
  1. CSVファイル選択ボタン（1ファイル固定）
  2. 選択ファイル名表示
  3. 実行中インジケータ
  4. `protocol.csv` 内容表示（CSV選択後のみ）
  5. 画像格納先選択ボタン（CSV選択後のみ）
  6. 画像照合結果（一致数/不足一覧）
  7. 結果サマリ（stepCount）
  8. 保存ボタン（CSV選択後のみ、不足画像あり時はdisabled）
  9. Homeへ戻る
- 状態: `idle` / `validating` / `failed` / `succeeded`

## 4. UI要素一覧
| UI ID | 要素 | 表示条件 | 入力制約 | セレクタ方針 |
|---|---|---|---|---|
| UI-001-IMPORT | CSVファイル選択ボタン | 常時 | `.csv` を1件のみ選択可 | role/button + name |
| UI-002-IMPORT | ファイル入力（非表示） | 常時 | `accept=.csv` / `multiple=false` | label + input[file] |
| UI-003-IMPORT | 実行中表示 | `validating` | なし | role/status |
| UI-004-IMPORT | `protocol.csv` 内容表示 | CSV選択後 | 読み取り専用 | role/textarea + label |
| UI-005-IMPORT | 画像の格納先を選ぶボタン | CSV選択後 | フォルダ選択（`webkitdirectory`） | role/button + name |
| UI-007-IMPORT | 不足画像警告一覧 | 画像不足時 | 読み取り専用 | data-testid |
| UI-006-IMPORT | 結果サマリ | 検証後 | 数値のみ | data-testid |
| UI-009-IMPORT | 保存ボタン | CSV選択後 | 実行中はdisabled | role/button + name |

## 5. 操作契約
| ACT ID | Guard | Side Effect | Success遷移 | Failure表示 |
|---|---|---|---|---|
| ACT-007-HOME | `platform=mac` | `ProtocolTemplate` 保存 + outbox追記 | SCR-012-MAC-IMPORT に成功表示を維持 | 検証エラー表示 |

## 6. データバインディング
| 区分 | Read | Write | Outbox | 反映タイミング |
|---|---|---|---|---|
| 実行前 | `platform` | - | - | on load |
| 選択時 | `protocol.csv`（1ファイル） | `csvPreview`, `referencedImages` | - | on file selected |
| 実行時 | `protocol.csv`, `selectedImageDirectory`, `selectedFileName` | `ProtocolTemplate`, `photo_meta` | `protocol` 追記 | on save success |
| 失敗時 | `errors[]` | - | - | on import failed |

## 7. バリデーション / エラー文言 / 空状態
- バリデーション: 固定ヘッダー一致、`step_id` 重複禁止、`next_step_id` 整合、画像参照一覧不足の検出（フォルダ直下照合）。
- エラー文言（例）:
  - `CSVヘッダーが不正です。`
  - `step_id が重複しています。`
  - `不足している画像があります。画像の格納先を再指定してください。`
- 空状態:
  - `CSVファイルを選択してください。`

## 8. 権限・端末差分・フォールバック
- Mac以外では更新不可。iPhoneは「Macのみ対応」を表示。
- ネイティブI/F失敗時は再試行導線を表示。

## 9. アクセシビリティ / キーボード
- Enterで保存実行可能（保存可能状態のみ）。
- 実行中は `aria-busy=true` を設定。

## 10. 受入条件（GWT）
- Given 正常CSVがある
- When CSVファイルを選択し、保存する
- Then 成功しテンプレート登録される
- Given `step_id` 重複CSV
- When CSVファイルを選択する
- Then エラーで中止する

## 11. 参照リンク
- Local FR: `SCR-012-MAC-IMPORT-FR-01` 〜 `SCR-012-MAC-IMPORT-FR-06`
- 旧FR対応: FR-020, FR-021, FR-022, FR-023, FR-024, FR-082A
- AT: AT-CSV-001, AT-CSV-002, AT-CSV-003, AT-CSV-004, AT-API-003
- E2E: E2E-CSV-001, E2E-CSV-002, E2E-CSV-003, E2E-CSV-004
- CAP: `../30_capabilities/CAP-CSV-IMPORT-001.md`

## 12. 画面機能要件（ローカルID）
- SCR-012-MAC-IMPORT-FR-01: (旧: FR-020) MacでCSVを1ファイル選択できます。
- SCR-012-MAC-IMPORT-FR-02: (旧: FR-021) CSVヘッダーが固定仕様に一致する場合のみ受け付けます。
- SCR-012-MAC-IMPORT-FR-03: (旧: FR-022) 検証エラー1件以上で取り込みを中止します。
- SCR-012-MAC-IMPORT-FR-04: (旧: FR-023) 警告は取り込み結果画面で一覧表示します。
- SCR-012-MAC-IMPORT-FR-05: (旧: FR-024) CSVに含まれる画像参照一覧を、選択フォルダ直下ファイルに対して照合し、不足時は警告表示かつ保存不可にします。
- SCR-012-MAC-IMPORT-FR-06: (旧: FR-082A) 公開HTTP APIは `POST /sync/push` と `POST /sync/pull` のみとし、CSV取り込みはローカルI/F（`ProtocolImportService.importFromDirectory`）で実行します。
