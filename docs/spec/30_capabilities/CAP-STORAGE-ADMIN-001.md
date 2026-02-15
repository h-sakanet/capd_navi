# CAP-STORAGE-ADMIN-001

## 1. メタ情報（CAP ID, 名称, Owner, 対象Phase）
- CAP ID: CAP-STORAGE-ADMIN-001
- 名称: ストレージ管理（開発/検証専用）
- Owner: App Core / Dev Tooling
- 対象Phase: Phase1

## 2. 目的 / 非目的
- 目的: テスト反復時に、localStorage と IndexedDB を安全に可視化・削除する。
- 非目的: 本番ユーザー向け機能として提供すること。

## 3. 境界（対象画面あり/なし、責務分割）
- 対象画面あり: `../20_screens/SCR-013-STORAGE-ADMIN.md`
- 画面責務: 一覧表示、選択、確認、実行。
- CAP責務: ストレージ列挙、削除、全削除、エクスポートデータ生成。

## 4. ドメインモデルと不変条件
- 入力モデル: `StoragePreviewItem`, `DeleteTarget`
- 出力モデル: `StorageSnapshot`
- 不変条件:
  - `ENV=true` 以外で画面到達不可（404）。
  - 削除は指定ターゲットに限定。
  - 全削除は `DELETE` 確認必須。
  - IndexedDB 非対応時でも localStorage 操作を継続可能。

## 5. 入出力I/F（Service, API, Event）
- Service:
  - `listStoragePreview(): Promise<StoragePreviewItem[]>`
  - `deleteStorageTargets(targets: DeleteTarget[]): Promise<void>`
  - `clearAllStorage(): Promise<void>`
- API: 追加なし。
- Event: 追加なし。

## 6. 状態遷移（正常 / 禁止 / 再試行 / 復旧）
- 正常: `loading -> ready -> deleting -> ready`
- 全削除: `ready -> clearing_all -> ready`
- 禁止: 未選択削除、`DELETE` 不一致での全削除
- 再試行: 失敗後 `Refresh` で再読込

## 7. 失敗モードと回復方針
- IndexedDB 列挙失敗: 警告表示して localStorage のみ継続。
- 削除失敗: エラーバナー表示。再試行可能。

## 8. セキュリティ・監査・保持
- `NEXT_PUBLIC_ENABLE_STORAGE_ADMIN=true` でのみ有効化。
- 本番導線からリンクしない。
- 開発専用機能のため監査ログ要件は設けない。

## 9. 受入条件（GWT）
- Given ENV有効
- When 管理画面へアクセスする
- Then ストレージを可視化できる
- Given 対象選択済み
- When 削除確定する
- Then 対象データのみ削除できる

## 10. トレーサビリティ（FR, AT, SCR, JRN）
- Local FR: `CAP-STORAGE-ADMIN-001-FR-01` 〜 `CAP-STORAGE-ADMIN-001-FR-07`
- AT: AT-DEV-STORAGE-001, AT-DEV-STORAGE-002, AT-DEV-STORAGE-003, AT-DEV-STORAGE-004
- SCR: SCR-STORAGE-ADMIN-001
- JRN: JRN-010-STORAGE-ADMIN

## 11. 機能要件（ローカルID）
- CAP-STORAGE-ADMIN-001-FR-01: localStorage 一覧を取得します。
- CAP-STORAGE-ADMIN-001-FR-02: IndexedDB DB/store 一覧を取得します。
- CAP-STORAGE-ADMIN-001-FR-03: 単体削除（local/db/store）を提供します。
- CAP-STORAGE-ADMIN-001-FR-04: 複数選択削除を提供します。
- CAP-STORAGE-ADMIN-001-FR-05: 全削除（local + IndexedDB）を提供します。
- CAP-STORAGE-ADMIN-001-FR-06: スナップショットJSONのエクスポートを提供します。
- CAP-STORAGE-ADMIN-001-FR-07: `ENV=true` 以外で機能を無効化します。
