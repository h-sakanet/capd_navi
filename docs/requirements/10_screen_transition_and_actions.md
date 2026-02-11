# 10. 画面遷移と操作契約（SCR/ACT）

## 1. 目的
本書は、本番導線 `/capd/*` における画面遷移と操作副作用を固定する実装契約です。  
画面レイアウトは `06_ui_wireframes_ab.md` を参照し、動作仕様は本書を正とします。

## 2. ID規約
- 画面ID: `SCR-*`
- 操作ID: `ACT-*`
- 本書は `09_user_journeys.md` の `JRN-*` に必ず接続します。

## 3. 画面一覧
| SCR ID | 画面名 | Route / I/F | 主目的 | 関連JRN |
|---|---|---|---|---|
| SCR-HOME-001 | Home | `/capd/home` | 当日スロット、当日ノート、主要導線 | JRN-CSV-001, JRN-SLOT-001, JRN-ABORT-001, JRN-SYNC-001, JRN-HISTORY-001 |
| SCR-HOME-SETUP-001 | 手技設定モーダル | Home内Dialog | スロット登録/編集 | JRN-SLOT-001 |
| SCR-HOME-START-CONFIRM-001 | 開始確認モーダル | Home内Dialog | 開始/再開の最終確認 | JRN-SLOT-001 |
| SCR-HOME-VIEW-CONFIRM-001 | 手技内容確認モーダル | Home内Dialog | 閲覧専用確認モード | JRN-SLOT-001 |
| SCR-HOME-SUMMARY-001 | Home全体サマリ | Home内セクション | `session_summary`/出口部写真操作 | JRN-EXITPHOTO-001 |
| SCR-SESSION-001 | Session | `/capd/session` | ステップ進行、記録、アラーム | JRN-SESSION-001, JRN-ABORT-001, JRN-ALARM-001 |
| SCR-SESSION-RECORD-001 | 記録モーダル | Session内Dialog | `record_event` 入力 | JRN-SESSION-001 |
| SCR-HISTORY-001 | 記録一覧 | `/capd/history-list` | 記録参照と編集導線 | JRN-HISTORY-001 |
| SCR-HISTORY-DETAIL-001 | 記録詳細 | 履歴詳細画面（実装対象） | `session_summary` 詳細と出口部写真操作 | JRN-HISTORY-001, JRN-EXITPHOTO-001 |
| SCR-HISTORY-PHOTO-001 | 写真詳細 | `/capd/history-photo/:photoId` | 写真閲覧 | JRN-HISTORY-001 |
| SCR-SYNC-STATUS-001 | 同期状態表示 | Header/バナー | 同期成功/失敗と再試行 | JRN-SYNC-001, JRN-RECOVERY-001 |
| SCR-MAC-IMPORT-001 | CSV取込I/F | `ProtocolImportService.importFromDirectory` | Macディレクトリ取込 | JRN-CSV-001 |

## 4. 操作契約（ACT）
| ACT ID | 操作 | 発火画面 | ガード条件 | 副作用（保存・通知） | 成功遷移 | 失敗時表示 | 関連JRN/FR |
|---|---|---|---|---|---|---|---|
| ACT-HOME-001 | `+` で手技設定を開く | SCR-HOME-001 | 進行中セッションなし | なし | SCR-HOME-SETUP-001 | 「実施中セッションがあるため編集不可」 | JRN-SLOT-001 / FR-009F |
| ACT-HOME-002 | 手技設定を保存 | SCR-HOME-SETUP-001 | 推奨時刻が左から右で厳密昇順 | `DailyProcedurePlan.slots` 更新 + outbox追記 | SCR-HOME-001 | 順序違反エラー文言 | JRN-SLOT-001 / FR-009C, FR-009E |
| ACT-HOME-003 | `••• > 確認` | SCR-HOME-001 | 登録済みスロット | なし | SCR-HOME-VIEW-CONFIRM-001 | 該当なし | JRN-SLOT-001 / FR-009A, FR-009H |
| ACT-HOME-004 | `••• > 編集` | SCR-HOME-001 | `実施済み` ではない、進行中セッションなし | なし | SCR-HOME-SETUP-001 | 「実施済みは編集不可」 | JRN-SLOT-001 / FR-009F |
| ACT-HOME-005 | カード本体タップ | SCR-HOME-001 | 右側開始時は左側すべて `実施済み` | なし（確認モーダル表示のみ） | SCR-HOME-START-CONFIRM-001 | 開始不可理由文言 | JRN-SLOT-001 / FR-009D, FR-009G |
| ACT-HOME-008 | 開始/再開を確定 | SCR-HOME-START-CONFIRM-001 | 開始不可条件に該当しない | `Session` 開始または再開。`activeSession` 更新 | SCR-SESSION-001 | セッション開始失敗エラー | JRN-SLOT-001 / FR-009, FR-009G |
| ACT-HOME-006 | 確認モードで手順表示 | SCR-HOME-VIEW-CONFIRM-001 | 登録済みスロット | 永続化・通知・タイマー生成を禁止 | SCR-SESSION-001（preview） | 該当なし | JRN-SLOT-001 / FR-009A, FR-009H |
| ACT-HOME-007 | CSV取り込み | SCR-HOME-001 | Mac端末であること | `ProtocolPackage` 保存 + outbox追記 | SCR-MAC-IMPORT-001 -> SCR-HOME-001 | 検証エラー一覧 | JRN-CSV-001 / FR-020〜FR-024 |
| ACT-HOME-010 | 記録一覧を開く | SCR-HOME-001 | なし | なし | SCR-HISTORY-001 | 該当なし | JRN-HISTORY-001 / FR-006 |
| ACT-HOME-011 | 手動同期 | SCR-HOME-001 | なし | `sync(push,pull)` 実行 | SCR-HOME-001 | 同期失敗バナー + 再試行 | JRN-SYNC-001 / FR-086, FR-088 |
| ACT-HISTORY-001 | 写真詳細を開く | SCR-HISTORY-001 | 対象 `photoId` が存在する | なし | SCR-HISTORY-PHOTO-001 | 写真未登録文言 | JRN-HISTORY-001 / FR-014 |
| ACT-SESSION-001 | 次へ | SCR-SESSION-001 | 必須チェック完了かつ `record_event` 完了 | `currentStepId` 更新。必要時 `timer_event` 記録 | SCR-SESSION-001 | ブロック理由表示 | JRN-SESSION-001 / FR-031〜FR-033 |
| ACT-SESSION-002 | 戻る | SCR-SESSION-001 | 先頭ステップ以外 | 表示遷移のみ（再発火禁止） | SCR-SESSION-001 | 該当なし | JRN-SESSION-001 / FR-039, FR-056 |
| ACT-SESSION-003 | 記録保存 | SCR-SESSION-RECORD-001 | `FC-*` 必須条件を満たす | `Record` 保存 + outbox追記 | SCR-SESSION-001 | 入力不備エラー | JRN-SESSION-001 / FR-040〜FR-044D |
| ACT-SESSION-004 | 最終ステップ完了 | SCR-SESSION-001 | 最終ステップ到達 | `Session.completed` + スロット更新 + 同期契機発火 | SCR-HOME-001 | 完了失敗エラー | JRN-SESSION-001 / FR-034, FR-080 |
| ACT-SESSION-006 | 非常中断 | SCR-SESSION-001 | 確認ダイアログ承認 | `Session.aborted` + スロットを `未実施` へ戻す | SCR-HOME-001 | 中断失敗エラー | JRN-ABORT-001 / FR-039D〜FR-039F |
| ACT-SYNC-001 | 自動同期（起動/復帰/完了） | SCR-SYNC-STATUS-001 | 同期契機到達 | push->pull、失敗時状態更新 | 現在画面維持 | 同期失敗表示 | JRN-SYNC-001 / FR-080〜FR-088 |
| ACT-ALARM-001 | ACK | SCR-SESSION-001 | 未ACKジョブあり | 通知停止 + `acked_at` 記録 | SCR-SESSION-001 | ACK失敗表示 | JRN-ALARM-001 / FR-053, FR-054 |
| ACT-EXIT-001 | 出口部写真登録 | SCR-HOME-SUMMARY-001, SCR-HISTORY-DETAIL-001 | iPhoneかつ対象 `summaryScope` 完了 | `payload.exit_site_photo` 部分更新 + photo保存 | 同一画面 | 端末制約/入力エラー | JRN-EXITPHOTO-001 / FR-042A〜FR-042G |
| ACT-EXIT-002 | 出口部写真変更 | SCR-HOME-SUMMARY-001, SCR-HISTORY-DETAIL-001 | iPhone、既存写真あり | 既存1枚を置換（複数保持禁止） | 同一画面 | 保存エラー | JRN-EXITPHOTO-001 / FR-042E |
| ACT-EXIT-003 | 出口部写真削除 | SCR-HOME-SUMMARY-001, SCR-HISTORY-DETAIL-001 | iPhone、既存写真あり | `exit_site_photo=null` 保存 + tombstone | 同一画面 | 削除エラー | JRN-EXITPHOTO-001 / FR-042H |

## 5. 遷移ガード（固定）
1. `ACT-HOME-005` は右側開始時に左側完了チェックを必須とします。
2. `ACT-SESSION-001` はチェック未完了または記録未完了時に必ず拒否します。
3. `ACT-HOME-006` は閲覧専用であり、DB書き込みと通知ジョブ生成を禁止します。
4. `ACT-EXIT-*` はiPhoneのみ更新可能とし、Macは閲覧のみ許可します。

## 6. 実装禁止事項（本書由来）
- `/capd/*` 本番ルートで `mock-data.ts` を状態正本として使用してはいけません。
- `ACT-*` 未定義の画面操作を実装してはいけません。
- ガード条件をUIのみで実装し、保存層で未検証のまま通過させてはいけません。
