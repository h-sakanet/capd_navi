# E2E Test Specification (Playwright)

## 1. 目的
本書は、受入要件（`AT-*`）をE2Eで成立させるための仕様書です。  
`playwright-e2e-case-authoring` の方針に従い、挙動テストと見た目テストを分離します。

## 2. スコープ
- 対象導線:
  - Home（`/capd/home`）
  - Session（`/capd/session`）
  - History（`/capd/history-list`）
  - History Photo（`/capd/history-photo/:photoId`）
- 対象要件群:
  - `AT-CSV-*`
  - `AT-FLOW-*`
  - `AT-SYNC-*`
  - `AT-RECOVERY-*`
  - `AT-ALARM-*`
  - `AT-API-*`
  - `AT-PLAT-*`
  - `AT-SLEEP-*`
  - `AT-EXIT-*`

## 3. 共通実装ポリシー
- テストIDは `E2E-*` を使用し、`AT-*` と1:1または1:Nで紐付けます。
- セレクタは `getByRole` / `getByLabel` / `getByText` を優先します。
- 同名ボタン等で曖昧な箇所のみ `data-testid` を許可します。
- テストデータは deterministic fixture を使用し、ランダム依存を禁止します。
- 待機は `expect(...).toBeVisible()` 等の状態待機を使い、固定sleepを禁止します。
- fixture の基準ディレクトリは `/Users/sakanet/capd_navi/test/fixtures` に固定します。

### 3.1 状態定義
- `Planned`: ケース定義済み、テストコード未作成
- `Executable`: 現行実装/環境で実行可能
- `Implemented`: テストコード作成済み・定常実行対象
- `Deferred`: 依存I/Fや実行環境が未整備のため保留

### 3.2 実行ルール
- `Executable` / `Implemented` は `test:e2e` 実行対象とし、`skip/disable` を禁止します。
- `Deferred` は仕様とトレーサビリティで管理し、通常スイートには含めません。

### 3.3 初回実装必須ゲート（Deferred禁止）
初回実装では、以下のE2Eケースを必須対象とし `Deferred` を禁止します。
- `E2E-CSV-001`〜`E2E-CSV-004`
- `E2E-API-001`, `E2E-API-004`
- `E2E-API-002`
- `E2E-SYNC-001`〜`E2E-SYNC-006`
- `E2E-RECOVERY-001`〜`E2E-RECOVERY-003`
- `E2E-ALARM-001`〜`E2E-ALARM-004`

運用:
- 着手時は `Planned` で管理し、依存I/F実装後に `Executable` 化します。
- 初回実装完了時点で、上記はすべて `Implemented` である必要があります。

### 3.4 Phase2対象（初回対象外）
以下はPhase2対象とし、初回実装では `Deferred` を許可します。
- `E2E-CSV-005`
- `E2E-PLAT-001`, `E2E-PLAT-002`, `E2E-SLEEP-001`
- `E2E-EXIT-001`〜`E2E-EXIT-007`
- `E2E-PHOTO-001`, `E2E-BACKUP-001`

## 4. シナリオ定義（初版）

### 4.1 CSV取込（Mac）
| E2E ID | 対応AT | 前提 | 操作 | 期待結果 | 優先度 | 状態 |
|---|---|---|---|---|---|---|
| E2E-CSV-001 | AT-CSV-001 | 正常CSV v3 + 画像 | 取込実行 | 成功しテンプレート登録 | P0 | Planned |
| E2E-CSV-002 | AT-CSV-002 | `step_id` 重複CSV | 取込実行 | エラーで中止 | P0 | Planned |
| E2E-CSV-003 | AT-CSV-003 | `next_step_id` 不整合CSV | 取込実行 | エラーで中止 | P0 | Planned |
| E2E-CSV-004 | AT-CSV-004 | 画像不足CSV | 取込実行 | エラーで中止 | P0 | Planned |
| E2E-CSV-005 | AT-CSV-005 | `xx分` を含むCSV | 取込実行 | 取込成功 + 警告表示 | P1 | Deferred |

### 4.2 Home / Flow
| E2E ID | 対応AT | 前提 | 操作 | 期待結果 | 優先度 | 状態 |
|---|---|---|---|---|---|---|
| E2E-FLOW-001 | AT-FLOW-005 | #1未実施、#2登録済み | #2開始操作 | 開始不可メッセージ表示 | P0 | Executable |
| E2E-FLOW-002 | AT-FLOW-004 | 実施中セッションあり | 別スロット開始 | 開始不可 | P0 | Executable |
| E2E-FLOW-003 | AT-FLOW-006 | 実施中セッション保存済み | ホーム再表示 -> 該当スロット選択 | セッション再開 | P0 | Executable |
| E2E-FLOW-004 | AT-FLOW-007 | セッション進行中 | `•••` -> 中断 -> 確認 | ホーム復帰 + `未実施` | P0 | Executable |
| E2E-FLOW-005 | AT-FLOW-001 | 必須チェックあり | 未チェックで次へ | 遷移不可 | P0 | Executable |
| E2E-FLOW-006 | AT-FLOW-002 | `record_event` ステップ | 未入力で次へ | 遷移不可 | P0 | Executable |
| E2E-FLOW-007 | AT-FLOW-003 | 直列遷移可能なステップ構成 | 次へ | `next_step_id` のステップへ遷移 | P0 | Executable |

### 4.3 API境界
| E2E ID | 対応AT | 前提 | 操作 | 期待結果 | 優先度 | 状態 |
|---|---|---|---|---|---|---|
| E2E-API-001 | AT-API-001 | ルート一覧取得可能 | ルーティング確認 | 公開APIが `sync/push`, `sync/pull` のみ | P0 | Planned |
| E2E-API-002 | AT-API-003 | CSV取込導線あり | 取込実行 | `POST /protocols/import-package` を呼ばない | P0 | Planned |
| E2E-API-003 | AT-API-002 | Home表示可能 | UI確認 | 手動エクスポート導線が表示されない | P0 | Executable |
| E2E-API-004 | AT-API-004 | 同期済みデータあり | Blobキー確認 | `.enc` なしで保存 | P0 | Planned |

### 4.4 同期契約
| E2E ID | 対応AT | 前提 | 操作 | 期待結果 | 優先度 | 状態 |
|---|---|---|---|---|---|---|
| E2E-SYNC-001 | AT-SYNC-001 | 端末Aに未同期データ | 端末B起動 | pull復元成立 | P0 | Planned |
| E2E-SYNC-002 | AT-SYNC-005 | outbox pendingあり | 手動同期 | outbox消し込み | P0 | Planned |
| E2E-SYNC-003 | AT-SYNC-002 | 端末Aでセッション完了 | 同期後に端末B復帰 | 完了記録が端末Bへ反映 | P0 | Planned |
| E2E-SYNC-004 | AT-SYNC-003 | 同一エンティティを2端末更新 | 双方同期 | LWW勝者に一意収束 | P0 | Planned |
| E2E-SYNC-005 | AT-SYNC-004 | 同日同スロットを2端末更新 | 双方同期 | 重複セッション保持 + スロット収束 | P0 | Planned |
| E2E-SYNC-006 | AT-SYNC-006 | ネットワーク失敗注入 | アプリ復帰で同期実行 | 失敗バナー + 再試行導線表示 | P0 | Planned |

### 4.5 復旧
| E2E ID | 対応AT | 前提 | 操作 | 期待結果 | 優先度 | 状態 |
|---|---|---|---|---|---|---|
| E2E-RECOVERY-001 | AT-RECOVERY-001 | DB消去済み | 起動 | クラウドからフル復元 | P0 | Planned |
| E2E-RECOVERY-002 | AT-RECOVERY-002 | Blobs欠損 | 手動同期 | `cloudState=missing` -> `full_reseed` 成功 | P0 | Planned |
| E2E-RECOVERY-003 | AT-RECOVERY-003 | `full_reseed` 失敗注入 | 手動同期 | `failed` 状態表示 + ローカル保全 | P0 | Planned |

### 4.6 タイマー / アラーム
| E2E ID | 対応AT | 前提 | 操作 | 期待結果 | 優先度 | 状態 |
|---|---|---|---|---|---|---|
| E2E-ALARM-001 | AT-ALARM-001 | タイマー終了時刻到達 | 待機 | Mac通知 + アプリ内アラート | P0 | Planned |
| E2E-ALARM-002 | AT-ALARM-002 | 終了後未確認 | T+2分 / T+5分以降経過 | 段階再通知が仕様どおり動作 | P0 | Planned |
| E2E-ALARM-003 | AT-ALARM-003 | 通知中 | ACK実行 | 通知停止 + `acked_at` 記録 | P0 | Planned |
| E2E-ALARM-004 | AT-ALARM-004 | 終了後30分未ACK | 状態確認 | `status=missed` 永続化 + 警告継続 | P0 | Planned |

### 4.7 プラットフォーム / スリープ
| E2E ID | 対応AT | 前提 | 操作 | 期待結果 | 優先度 | 状態 |
|---|---|---|---|---|---|---|
| E2E-PLAT-001 | AT-PLAT-001 | iPhone Safari/PWA | ホームからセッション開始 | Webアプリとして利用可能 | P1 | Deferred |
| E2E-PLAT-002 | AT-PLAT-002 | Macネイティブシェル | ホーム表示 | ネイティブシェルで利用可能 | P1 | Deferred |
| E2E-SLEEP-001 | AT-SLEEP-001 | セッション中 | ステップ表示 | スリープ抑止状態を表示 | P1 | Deferred |

### 4.8 出口部写真
| E2E ID | 対応AT | 前提 | 操作 | 期待結果 | 優先度 | 状態 |
|---|---|---|---|---|---|---|
| E2E-EXIT-001 | AT-EXIT-001, AT-EXIT-002 | `summaryScope` 未完了/完了 | ホーム表示 | 操作行の表示条件が成立 | P0 | Deferred |
| E2E-EXIT-002 | AT-EXIT-003 | 対象レコードあり | ホームと詳細を表示 | 同一状態表示 | P1 | Deferred |
| E2E-EXIT-003 | AT-EXIT-004 | Mac表示 | ホーム/詳細表示 | 閲覧のみ（更新UIなし） | P0 | Deferred |
| E2E-EXIT-004 | AT-EXIT-005, AT-EXIT-006, AT-EXIT-007, AT-EXIT-008 | iPhone表示 | 登録 -> 変更 -> 削除 -> 再表示 | 1枚固定の状態遷移が成立 | P0 | Deferred |
| E2E-EXIT-005 | AT-EXIT-009, AT-EXIT-010 | 2端末更新 | 同期 | 部分パッチ保全 | P0 | Deferred |
| E2E-EXIT-006 | AT-EXIT-011 | `summaryScope=both` | iPhoneで写真登録 | `first_of_day` 同等に登録可能 | P1 | Deferred |
| E2E-EXIT-007 | AT-EXIT-012 | 写真総量上限超過 | 追加写真保存 | 容量制御ポリシーが適用 | P1 | Deferred |

### 4.9 写真容量 / バックアップ
| E2E ID | 対応AT | 前提 | 操作 | 期待結果 | 優先度 | 状態 |
|---|---|---|---|---|---|---|
| E2E-PHOTO-001 | AT-PHOTO-001 | 写真総量 > 1GB | 写真保存処理 | 古い順削除で0.95GB以下 | P1 | Deferred |
| E2E-BACKUP-001 | AT-BACKUP-001 | バックアップスケジュール有効 | 31日分経過 | 30日保持ポリシー成立 | P1 | Deferred |

## 5. データ準備方針
- `fixtures/e2e/home/`:
  - 左未実施、右登録済み、実施中、実施済みの固定データ
- `fixtures/e2e/session/`:
  - 必須チェックあり、`record_event` ありのステップ構成
- `fixtures/e2e/sync/`:
  - `cloudState=ok` / `missing` / `full_reseed` 失敗の固定レスポンス
- `fixtures/e2e/api/`:
  - ルーティング一覧、ネットワーク呼び出し検証用固定レスポンス

fixture の可変更新は禁止し、ケース単位で読み取り専用にします。

## 6. 実行順序（推奨）
1. 初回実装必須ゲート（3.3）の `Planned` ケースを依存I/F実装と合わせて `Executable` 化
2. `状態=Executable` の `E2E-FLOW-*` と `E2E-API-003` を実装
3. 初回実装必須ゲート（3.3）を `Implemented` まで完了
4. Phase2対象（3.4）はフェーズ開始時に `Deferred -> Planned -> Executable` へ変更して着手

## 7. 証跡
- 失敗時:
  - `test-results/<case>/error-context.md`
  - `test-results/<case>/test-failed-*.png`
  - `playwright-report`
- 成功時:
  - 実行ログ（実行ケースID、所要時間、Pass数）

## 8. 注意事項
- 3.3 の初回実装必須ゲートは `Deferred` 禁止です。
- 3.4 のPhase2対象は「雛形の skip テスト」を作成せず、仕様書と `traceability-matrix` のみで管理します。
- 依存I/F（同期API、MacネイティブI/F、通知I/F、バックアップI/F）実装後に `Executable` 化して着手します。
