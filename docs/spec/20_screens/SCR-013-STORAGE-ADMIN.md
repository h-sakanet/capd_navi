# SCR-013-STORAGE-ADMIN

## 1. メタ情報
- SCR ID: SCR-STORAGE-ADMIN-001
- 画面名: ストレージ管理（開発/検証専用）
- Route/I/F: `/capd/dev/storage-admin`
- 主JRN: JRN-010-STORAGE-ADMIN
- Phase: Phase1

## 2. 目的と責務境界
- この画面で決めること: ストレージ可視化、対象削除、全削除、エクスポート。
- この画面で決めないこと: 本番導線、公開API、業務ロジック。

## 3. UIワイヤー・レイアウト制約
```text
+----------------------------------------------------------------------------------+
| Storage Admin (Dev/Test)                                                         |
| URL: /capd/dev/storage-admin                                                     |
| [Refresh] [Export JSON]                                         ENV: ENABLED     |
+----------------------------------------------------------------------------------+
| Filter: [All v]  Search: [________________________]                              |
+--------------------------------------+-------------------------------------------+
| 一覧（左）                            | 詳細プレビュー（右）                      |
|--------------------------------------|-------------------------------------------|
| [ ] local  capd-support:home:slots:v1| 対象: capd-support:home:slots:v1          |
|     size: 1,240 bytes                | Type: JSON / localStorage                 |
| [ ] local  capd-support:templates:v1 | ----------------------------------------- |
|     size: 860 bytes                  | { ... }                                   |
| [ ] idbdb capd-support-db            |                                           |
|     stores: 8                        |                                           |
| [ ] idb   capd-support-db/sessions   |                                           |
|     count: 3                         |                                           |
+--------------------------------------+-------------------------------------------+
| [Delete Selected] [Clear ALL Storage]                                            |
+----------------------------------------------------------------------------------+
```

- 2ペイン固定（左: 一覧、右: 詳細）。
- 下部に削除操作を固定表示。

## 4. UI要素一覧
| UI ID | 要素 | 表示条件 | 入力制約 | セレクタ方針 |
|---|---|---|---|---|
| UI-001-STORAGE | Refreshボタン | 常時 | 実行中disabled | role/button + name |
| UI-002-STORAGE | Export JSONボタン | データあり | 実行中disabled | role/button + name |
| UI-003-STORAGE | Filter | 常時 | `all/local/indexeddb` | role/combobox |
| UI-004-STORAGE | Search入力 | 常時 | 部分一致 | role/textbox |
| UI-005-STORAGE | 一覧行選択 | データあり | 複数選択可 | data-testid |
| UI-006-STORAGE | 詳細プレビュー | 対象選択時 | 読み取り専用 | role/region |
| UI-007-STORAGE | Delete Selected | 選択時 | 確認モーダル必須 | role/button + name |
| UI-008-STORAGE | Clear ALL Storage | データあり | `DELETE` 入力必須 | role/button + name |

## 5. 操作契約
| ACT ID | Guard | Side Effect | Success遷移 | Failure表示 |
|---|---|---|---|---|
| ACT-001-STORAGE | `ENV=true` | `DeleteTarget[]` を削除 | 同画面で再読み込み | エラーバナー表示 |
| ACT-002-STORAGE | `ENV=true` | localStorage + IndexedDB 全削除 | 同画面で空状態 | エラーバナー表示 |

## 6. データバインディング
| 区分 | Read | Write | Outbox | 反映タイミング |
|---|---|---|---|---|
| 一覧表示 | localStorage keys, IndexedDB db/store | - | - | on load / refresh |
| 削除 | 選択アイテム | localStorage remove / store clear / db delete | - | on confirm |
| 全削除 | localStorage + IndexedDB names | localStorage clear / db delete all | - | on confirm |

## 7. バリデーション / エラー文言 / 空状態
- バリデーション:
  - 全削除は `DELETE` 入力一致でのみ実行可能。
  - 未選択時 `Delete Selected` は実行不可。
- エラー文言:
  - `ストレージ情報の読み込みに失敗しました。`
  - `削除処理に失敗しました。`
  - `全削除に失敗しました。`
- 空状態:
  - `削除対象データはありません。`

## 8. 権限・端末差分・フォールバック
- `NEXT_PUBLIC_ENABLE_STORAGE_ADMIN=true` のときのみ表示。
- 上記以外は404。
- IndexedDB 非対応/列挙不可時は警告表示し localStorage 操作のみ提供。

## 9. アクセシビリティ / キーボード
- すべての操作ボタンをキーボード操作可能にする。
- エラー/警告は `role=alert` で通知する。

## 10. 受入条件（GWT）
- Given ストレージにデータがある
- When 管理画面を表示する
- Then 一覧と詳細プレビューを確認できる
- Given 対象を選択済み
- When 削除を確定する
- Then 指定データのみ削除される
- Given 全削除確認モーダルを開いた
- When `DELETE` を入力して確定する
- Then すべてのストレージが削除される

## 11. 参照リンク
- Local FR: `SCR-013-STORAGE-ADMIN-FR-01` 〜 `SCR-013-STORAGE-ADMIN-FR-09`
- AT: AT-DEV-STORAGE-001, AT-DEV-STORAGE-002, AT-DEV-STORAGE-003, AT-DEV-STORAGE-004
- E2E: E2E-STORAGE-001, E2E-STORAGE-002, E2E-STORAGE-003, E2E-STORAGE-004, E2E-STORAGE-005
- CAP: `../30_capabilities/CAP-STORAGE-ADMIN-001.md`

## 12. 画面機能要件（ローカルID）
- SCR-013-STORAGE-ADMIN-FR-01: localStorage と IndexedDB の一覧を表示します。
- SCR-013-STORAGE-ADMIN-FR-02: 一覧から選択した対象の詳細プレビューを表示します。
- SCR-013-STORAGE-ADMIN-FR-03: Filter（all/local/indexeddb）を提供します。
- SCR-013-STORAGE-ADMIN-FR-04: Search（key/db/store）を提供します。
- SCR-013-STORAGE-ADMIN-FR-05: 複数選択削除（Delete Selected）を提供します。
- SCR-013-STORAGE-ADMIN-FR-06: 単体削除時は確認モーダルを必須とします。
- SCR-013-STORAGE-ADMIN-FR-07: 全削除は `DELETE` 入力一致時のみ実行可能とします。
- SCR-013-STORAGE-ADMIN-FR-08: `NEXT_PUBLIC_ENABLE_STORAGE_ADMIN=true` 以外では404を返します。
- SCR-013-STORAGE-ADMIN-FR-09: IndexedDB 列挙不可時は警告表示し localStorage の操作を継続可能にします。
