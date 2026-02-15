# CAP-CSV-IMPORT-001

## 1. メタ情報（CAP ID, 名称, Owner, 対象Phase）
- CAP ID: CAP-CSV-IMPORT-001
- 名称: CSV取込
- Owner: App Core / Import
- 対象Phase: Phase1

## 2. 目的 / 非目的
- 目的: `protocol.csv` と関連画像を検証し、テンプレート（ProtocolTemplate）と画像資産をIndexedDBへ保存します。
- 非目的: セッション進行、記録編集、公開HTTP API経由の取込。

## 3. 境界（対象画面あり/なし、責務分割）
- 対象画面あり: `../20_screens/SCR-012-MAC-IMPORT.md`
- 画面責務: CSVファイル選択、選択時検証、保存トリガー、結果表示。
- CAP責務: CSVフォーマット検証、画像存在検証（フォルダ直下照合）、正規化JSON化、`protocol_packages + photo_meta` 保存、outbox追記。

## 4. ドメインモデルと不変条件
- 入力モデル: CSV + 画像フォルダ。
- 出力モデル: `ProtocolTemplate`。
- 不変条件:
  - ヘッダーは固定順・固定列で一致すること。
  - `step_id` 一意。
  - `next_step_id` 整合。
  - 画像参照一覧に不足がないこと（不足時は警告表示し保存不可）。
  - エラー1件以上で保存中止。
  - `protocolName` はCSVファイル名（拡張子なし）を使用。

## 5. 入出力I/F（Service, API, Event）
- Service: `ProtocolImportService.importFromDirectory(input: { basePath: string })`
- 入力: `basePath`（Native） / `csvText + selectedDirectory + selectedFileName`（Web画面）
- 出力: `{ status, errors[], warnings[], summary }`
- Event: `protocol.imported`, `protocol.import_failed`

## 6. 状態遷移（正常 / 禁止 / 再試行 / 復旧）
- 正常: `idle -> validating -> succeeded`
- 失敗: `idle -> validating -> failed`
- 禁止: CSV未選択で保存実行
- 再試行: `failed -> validating`

## 7. 失敗モードと回復方針
- 形式不正/参照不整合: 保存せずエラー返却。
- 画像欠損: 不足一覧を警告表示し、保存操作を禁止。
- I/F失敗: 画面側で再試行導線を表示。

## 8. セキュリティ・監査・保持
- 取込元の任意コード実行を禁止。
- 監査: 実行端末、実行時刻、errors/warnings件数。
- 直近有効テンプレート版をローカル保持。

## 9. 受入条件（GWT）
- Given 正常CSVと画像フォルダがある
- When CSVと画像フォルダを選択し保存する
- Then テンプレート版と画像資産が保存される
- Given `step_id` 重複CSV
- When CSVを選択する
- Then エラーで中止し保存しない

## 10. トレーサビリティ（FR, AT, SCR, JRN）
- Local FR: `CAP-CSV-IMPORT-001-FR-01` 〜 `CAP-CSV-IMPORT-001-FR-07`
- 旧FR対応: FR-020, FR-021, FR-022, FR-023, FR-024, FR-070, FR-082A
- AT: AT-CSV-001, AT-CSV-002, AT-CSV-003, AT-CSV-004, AT-API-003
- SCR: SCR-HOME-001, SCR-MAC-IMPORT-001
- JRN: JRN-001-CSV

## 11. 機能要件（ローカルID）
- CAP-CSV-IMPORT-001-FR-01: (旧: FR-020) CSV取込画面でCSVを1ファイル選択できます。
- CAP-CSV-IMPORT-001-FR-02: (旧: FR-021) CSVヘッダーが固定仕様に一致する場合のみ受け付けます。
- CAP-CSV-IMPORT-001-FR-03: (旧: FR-022) 検証エラー1件以上で取り込みを中止します。
- CAP-CSV-IMPORT-001-FR-04: (旧: FR-023) 警告は取り込み結果画面で一覧表示します。
- CAP-CSV-IMPORT-001-FR-05: (旧: FR-024) CSVの画像参照一覧を、選択フォルダ直下ファイルに対して照合し、不足時は警告表示かつ保存不可にします。
- CAP-CSV-IMPORT-001-FR-06: (旧: FR-070) 新版取り込み後、テンプレート版として保存します。
- CAP-CSV-IMPORT-001-FR-07: (旧: FR-082A) 公開HTTP APIは `POST /sync/push` と `POST /sync/pull` のみとし、CSV取り込みはローカルI/F（`ProtocolImportService.importFromDirectory`）で実行します。
