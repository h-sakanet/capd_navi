# CAP-CSV-IMPORT-001

## 1. メタ情報（CAP ID, 名称, Owner, 対象Phase）
- CAP ID: CAP-CSV-IMPORT-001
- 名称: CSV取込
- Owner: App Core / Import
- 対象Phase: Phase1

## 2. 目的 / 非目的
- 目的: `protocol.csv` と関連画像を検証し、テンプレート版（ProtocolPackage）として保存します。
- 非目的: セッション進行、記録編集、公開HTTP API経由の取込。

## 3. 境界（対象画面あり/なし、責務分割）
- 対象画面あり: `../20_screens/SCR-012-MAC-IMPORT.md`
- 画面責務: ディレクトリ選択、実行トリガー、結果表示。
- CAP責務: CSVフォーマット検証、画像存在検証、正規化JSON化、保存、outbox追記。

## 4. ドメインモデルと不変条件
- 入力モデル: CSV + 画像ファイル群。
- 出力モデル: `ProtocolPackage`。
- 不変条件:
  - `format_version` はサポート対象値であること。
  - `step_id` 一意。
  - `next_step_id` 整合。
  - 画像パスは `protocol.csv` 基準で解決。
  - エラー1件以上で保存中止。

## 5. 入出力I/F（Service, API, Event）
- Service: `ProtocolImportService.importFromDirectory(input: { basePath: string })`
- 入力: `basePath`
- 出力: `{ status, errors[], warnings[], summary }`
- Event: `protocol.imported`, `protocol.import_failed`

## 6. 状態遷移（正常 / 禁止 / 再試行 / 復旧）
- 正常: `idle -> validating -> succeeded`
- 警告成功: `idle -> validating -> succeeded_with_warnings`
- 失敗: `idle -> validating -> failed`
- 禁止: `basePath` 未選択で実行
- 再試行: `failed -> validating`

## 7. 失敗モードと回復方針
- 形式不正/参照不整合/画像欠損: 保存せずエラー一覧返却。
- 警告のみ: 保存実施 + 警告表示。
- I/F失敗: 画面側で再試行導線を表示。

## 8. セキュリティ・監査・保持
- 取込元の任意コード実行を禁止。
- 監査: 実行端末、実行時刻、errors/warnings件数。
- 直近有効テンプレート版をローカル保持。

## 9. 受入条件（GWT）
- Given 正常CSVと画像群がある
- When 取込実行する
- Then テンプレート版が保存される
- Given `step_id` 重複CSV
- When 取込実行する
- Then エラーで中止し保存しない

## 10. トレーサビリティ（FR, AT, SCR, JRN）
- Local FR: `CAP-CSV-IMPORT-001-FR-01` 〜 `CAP-CSV-IMPORT-001-FR-07`
- 旧FR対応: FR-020, FR-021, FR-022, FR-023, FR-024, FR-070, FR-082A
- AT: AT-CSV-001, AT-CSV-002, AT-CSV-003, AT-CSV-004, AT-API-003
- SCR: SCR-HOME-001, SCR-MAC-IMPORT-001
- JRN: JRN-001-CSV

## 11. 機能要件（ローカルID）

- 採番規則: `<文書ID>-FR-yy`（yyはこの文書内連番）
- 旧FR IDは括弧内に残し、移行トレーサビリティを保持します。

- CAP-CSV-IMPORT-001-FR-01: (旧: FR-020) MacネイティブシェルでCSV+画像ディレクトリを選択できます。
- CAP-CSV-IMPORT-001-FR-02: (旧: FR-021) CSVフォーマットがサポート対象である場合のみ受け付けます。
- CAP-CSV-IMPORT-001-FR-03: (旧: FR-022) 検証エラー1件以上で取り込みを中止します。
- CAP-CSV-IMPORT-001-FR-04: (旧: FR-023) 警告は取り込み結果画面で一覧表示します。
- CAP-CSV-IMPORT-001-FR-05: (旧: FR-024) 画像相対パスを `protocol.csv` ディレクトリ基準で解決します。
- CAP-CSV-IMPORT-001-FR-06: (旧: FR-070) 新版取り込み後、テンプレート版として保存します。
- CAP-CSV-IMPORT-001-FR-07: (旧: FR-082A) 公開HTTP APIは `POST /sync/push` と `POST /sync/pull` のみとし、CSV取り込みはローカルI/F（`ProtocolImportService.importFromDirectory`）で実行します。
