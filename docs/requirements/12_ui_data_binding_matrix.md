# 12. UIデータバインディング対応表

## 1. 目的
本書は「画面の各表示・操作が、どのデータを読む/書くか」を1行単位で固定する契約です。  
モック表示で動いて見える実装を防ぐため、`/capd/*` 本番ルートのデータ入出力を明示します。

## 2. 記法
- Read: 画面表示時に参照する正本データ
- Write: 操作確定時に更新する正本データ
- Outbox: 同期対象として追記する更新

## 3. 対応表
| UI ID | 画面（SCR） | UI要素 | Read | Write | Outbox | 関連ACT |
|---|---|---|---|---|---|---|
| UI-HOME-001 | SCR-HOME-001 | 日付ヘッダ | `DailyProcedurePlan.dateLocal` | - | - | - |
| UI-HOME-002 | SCR-HOME-001 | #1〜#4スロット状態 | `DailyProcedurePlan.slots[*].displayStatus` | - | - | - |
| UI-HOME-003 | SCR-HOME-001 | スロットカード本文 | `slots[*].protocolTitle`, `recommendedAtLocal` | - | - | - |
| UI-HOME-003A | SCR-HOME-001 | スロットカード本体タップ | `slots[n].displayStatus` | なし（確認モーダル表示のみ） | なし | ACT-HOME-005 |
| UI-HOME-004 | SCR-HOME-SETUP-001 | 手技設定フォーム | `slots[n]`（編集時） | `slots[n]` upsert | `daily_plan` 追記 | ACT-HOME-002 |
| UI-HOME-005 | SCR-HOME-START-CONFIRM-001 | 開始確認内容 | `slots[n]`, `activeSession` | `Session`, `activeSession` | `session` 追記 | ACT-HOME-008 |
| UI-HOME-006 | SCR-HOME-VIEW-CONFIRM-001 | 確認モード開始 | `slots[n]` | なし（副作用禁止） | なし | ACT-HOME-006 |
| UI-HOME-007 | SCR-HOME-001 | CSV取り込みボタン | `platform` | `ProtocolPackage` 保存 | `protocol` 追記 | ACT-HOME-007 |
| UI-HOME-008 | SCR-HOME-001 | 当日ノート `貯留時間` | `Record(timer_event, timer_exchange_no)` | - | - | - |
| UI-HOME-009 | SCR-HOME-001 | 当日ノート `排液量/注液量/排液確認` | `Record(record_event, record_exchange_no)` | - | - | - |
| UI-HOME-010 | SCR-HOME-SUMMARY-001 | 総除水量 | `Record` 群（#2以降） | - | - | - |
| UI-HOME-011 | SCR-HOME-SUMMARY-001 | 出口部写真操作 | `Record(session_summary.payload.exit_site_photo)` | `payload.exit_site_photo` patch | `record` patch 追記 | ACT-EXIT-001〜003 |
| UI-SESSION-001 | SCR-SESSION-001 | ステップタイトル/本文 | `SessionProtocolSnapshot.steps[*]` | - | - | - |
| UI-SESSION-002 | SCR-SESSION-001 | 必須チェック一覧 | `steps[*].requiredChecks` | UIローカル状態 | - | ACT-SESSION-001 |
| UI-SESSION-003 | SCR-SESSION-001 | 次へ | `requiredChecks達成状態`, `record完了状態` | `Session.currentStepId` | `session_progress` 追記 | ACT-SESSION-001 |
| UI-SESSION-004 | SCR-SESSION-RECORD-001 | 記録フォーム | `FC-*` 定義 | `Record` upsert | `record` 追記 | ACT-SESSION-003 |
| UI-SESSION-005 | SCR-SESSION-001 | 非常中断 | `Session.status=active` | `Session.status=aborted`, `slot.status=pending` | `session`, `daily_plan` 追記 | ACT-SESSION-006 |
| UI-SESSION-006 | SCR-SESSION-001 | アラームバナー | `AlarmDispatchJob.pendingAlarm` | `acked_at` | `alarm_ack` 追記 | ACT-ALARM-001 |
| UI-HISTORY-001 | SCR-HISTORY-001 | 記録一覧テーブル | `DayBundle.records`, `sessions`, `dailyProcedurePlan` | 編集時 `Record` | `record` 追記 | ACT-HOME-010 |
| UI-HISTORY-002 | SCR-HISTORY-PHOTO-001 | 写真表示 | `photoRefs` + `photos/*` | - | - | ACT-HISTORY-001 |
| UI-SYNC-001 | SCR-SYNC-STATUS-001 | 同期ステータス | `SyncState.lastSyncStatus`, `lastError`, `lastSyncedAt` | `SyncState` 更新 | - | ACT-SYNC-001 |
| UI-SYNC-002 | SCR-SYNC-STATUS-001 | 手動再試行ボタン | `SyncState.lastSyncStatus` | 同期実行 | push/pull結果に応じ更新 | ACT-HOME-011 |

## 4. 禁止事項
- `/capd/*` 画面で `mock-data.ts` を Read 正本にしてはいけません。
- Readソースが未実装のまま、固定値をUIに埋め込んではいけません。
- Write後に outbox を追記しない更新を許可してはいけません（同期対象外を除く）。

## 5. レビュー観点
1. 追加UIごとに本表へ1行追加します。
2. `Read` と `Write` が同じエンティティでも、操作副作用は必ず分離して記載します。
3. `ACT-*` が未定義のUI更新は差し戻します。
