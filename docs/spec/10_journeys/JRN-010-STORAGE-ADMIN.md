# JRN-010-STORAGE-ADMIN

## 1. メタ情報
- JRN ID: JRN-010-STORAGE-ADMIN
- 名称: ストレージ管理（開発/検証専用）
- Phase: Phase1
- 主端末: Mac
- 版: v1

## 2. 目的 / 非目的
- 目的: テスト反復のため、ストレージ内容を可視化し不要データを削除する。
- 非目的: 本番運用導線として提供すること。

## 3. スコープ（含む / 含まない）
- 含む: localStorage/IndexedDB プレビュー、キー単位削除、全削除、エクスポート。
- 含まない: 既存本番画面からの導線追加、公開API追加。

## 4. 事前条件 / 事後条件
- 事前条件: `NEXT_PUBLIC_ENABLE_STORAGE_ADMIN=true`。
- 事後条件: 指定対象のみ削除、または全ストレージ削除が完了する。

## 5. 主フロー
1. `/capd/dev/storage-admin` を直アクセスする。
2. localStorage/IndexedDB の一覧を確認する。
3. 不要データを選択し削除を実行する。
4. 必要に応じて全削除を実行する（`DELETE` 確認付き）。

## 6. 例外フロー
- `NEXT_PUBLIC_ENABLE_STORAGE_ADMIN != true`: 404 を返す。
- IndexedDB 非対応/権限エラー: 警告表示し localStorage 操作のみ継続。

## 7. 状態遷移
- `idle -> loading -> ready`
- `ready -> deleting -> ready`
- `ready -> clearing_all -> ready`

## 8. 参照画面（レビュー順）
1. `../20_screens/SCR-013-STORAGE-ADMIN.md`

## 9. 受入条件（GWT）
- Given localStorage/IndexedDB にデータがある
- When 管理画面を表示する
- Then 一覧と詳細プレビューを確認できる
- Given 削除対象を選択済み
- When 削除を確定する
- Then 指定データのみ削除される

## 10. ログ/監査/計測
- 開発検証専用のため必須監査ログは要求しない。

## 11. トレーサビリティ
- Local FR: SCR-013-STORAGE-ADMIN-FR-01〜09, CAP-STORAGE-ADMIN-001-FR-01〜07
- AT: AT-DEV-STORAGE-001〜004
- CAP: CAP-STORAGE-ADMIN-001
- SCR: SCR-STORAGE-ADMIN-001
