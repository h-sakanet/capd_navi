# JRN-001-CSV

## 1. メタ情報
- JRN ID: JRN-001-CSV
- 名称: CSV取込（Mac）
- Phase: Phase1
- 主端末: Mac
- 版: v1

## 2. 目的 / 非目的
- 目的: `protocol.csv` と画像群を取り込み、テンプレート版を保存する。
- 非目的: セッション開始、履歴編集、通知運用。

## 3. スコープ（含む / 含まない）
- 含む: ディレクトリ選択、CSV検証、画像検証、保存、outbox追記。
- 含まない: API公開経由の取込。

## 4. 事前条件 / 事後条件
- 事前条件: Home表示済み、Mac利用可、取込ディレクトリあり。
- 事後条件: 成功時はテンプレート版が保存される。失敗時は保存しない。

## 5. 主フロー
1. `SCR-HOME-001` で `ACT-007-HOME` を実行。
2. `SCR-MAC-IMPORT-001` でディレクトリ選択。
3. CSV/画像を検証。
4. 正規化JSON保存 + outbox追記。

## 6. 例外フロー
- 検証エラーあり: 取込中止、エラー一覧表示。
- 警告のみ: 取込は継続し、警告一覧を表示。

## 7. 状態遷移
- 参照: `../40_contracts/state-machine.md` の Import状態機械（後続で確定）。

## 8. 参照画面（レビュー順）
1. `../20_screens/SCR-001-HOME.md`
2. `../20_screens/SCR-012-MAC-IMPORT.md`

## 9. 受入条件（GWT）
- Given 正常CSVと画像がある
- When 取込を実行する
- Then テンプレート版が保存される

## 10. ログ/監査/計測
- import開始/終了、エラー件数、警告件数、保存結果を記録。

## 11. トレーサビリティ
- FR: FR-020, FR-021, FR-022, FR-023, FR-024, FR-070, FR-082A
- AT: AT-CSV-001, AT-CSV-002, AT-CSV-003, AT-CSV-004, AT-API-003
- CAP: CAP-CSV-IMPORT-001
- SCR: SCR-HOME-001, SCR-MAC-IMPORT-001
- ACT: ACT-007-HOME
