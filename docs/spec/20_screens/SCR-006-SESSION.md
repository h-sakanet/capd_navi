# SCR-006-SESSION

## 1. メタ情報
- SCR ID: `SCR-SESSION-001`
- 画面名: Session
- Route: `/capd/session`
- 対象Phase: Phase1
- 関連JRN: `JRN-003-SESSION`, `JRN-004-ABORT`, `JRN-007-ALARM`

## 2. 目的
- CSV取込済みテンプレートから開始時に固定した `SessionProtocolSnapshot` を描画し、手順進行・記録・アラームACKを実行します。
- 画面表示中の仕様ソースは常に `session_protocol_snapshots` であり、現行 `protocol_packages` へフォールバックしません。

## 3. 画面責務
- 実施すること:
  - ステップ表示（タイトル/本文/警告/必須チェック）
  - `record_event` 入力完了までの遷移ゲート
  - `ACT-001`（次へ）による進行更新
  - アラーム表示・ACK
  - 非常中断
- 実施しないこと:
  - CSV取込
  - テンプレート編集
  - 同期競合解決

## 4. UI要素
| UI ID | 要素 | 表示条件 | セレクタ方針 |
|---|---|---|---|
| UI-001-SESSION | ステップタイトル/本文 | 常時 | role/heading, text |
| UI-002-SESSION | 必須チェック | `requiredChecks` があるとき | role/checkbox |
| UI-003-SESSION | 記録入力ボタン | `recordSpec` があるとき | role/button |
| UI-004-SESSION | アラームバナー | 未ACKアラームがあるとき | `data-testid=alarm-*` |
| UI-005-SESSION | 次へ/戻る | 常時 | role/button |
| UI-006-SESSION | 非常中断メニュー | runtime時のみ | role/menuitem |

## 5. 操作契約
| ACT ID | Guard | Side Effect | 成功時 |
|---|---|---|---|
| ACT-001-SESSION（次へ） | 必須チェック完了かつ記録完了 | `sessions.currentStepId` を更新 | 次ステップへ遷移 |
| ACT-002-SESSION（戻る） | 先頭以外 | 表示位置のみ更新（永続副作用なし） | 前ステップ表示 |
| ACT-004-SESSION（終了） | 最終ステップ | `sessions.status=completed` + スロット `実施済み` | Homeへ戻る |
| ACT-006-SESSION（非常中断） | 確認ダイアログOK | `sessions.status=aborted` + スロット `未実施` | Homeへ戻る |
| ACT-001-ALARM（ACK） | 未ACKジョブあり | `alarm_dispatch_jobs.status=acknowledged` + `ackedAtIso` | バナー停止 |

## 6. 実行時データ契約
- 読み取り:
  - `sessions`
  - `session_protocol_snapshots`
  - `records`
  - `timer_events`
  - `alarm_dispatch_jobs`
- 書き込み:
  - `sessions`
  - `records`
  - `timer_events`
  - `alarm_dispatch_jobs`

## 7. タイマー/アラーム契約（Phase1確定）
1. `timer_event(start/end)` は `ACT-001` 成功時に「現在step」へ1回だけ記録します。
2. 戻る/再表示/再開では再発火しません（dedupeキーで保証）。
3. `alarm_trigger=timer_end` は、対象stepで `timer_event=end` が記録された時点でジョブ生成します。
4. `alarm_trigger=step_enter` は、step初回表示時にジョブ生成します。
5. いずれのアラームも重複生成を禁止します。

## 8. バリデーション
- 必須チェック未完了: 次へ不可。
- `record_event` 未保存: 次へ不可。
- `next_step_id` 不整合: セッション読込時エラー。
- snapshot欠落/ハッシュ不整合: セッション停止エラー。

## 9. エラー/空状態
- スナップショット欠落: `セッションのスナップショットが見つかりません。CSVを再取り込み後に再開してください。`
- ハッシュ不整合: `スナップショット整合性エラーが発生しました。`
- 開始失敗（保存失敗含む）: Home側で開始を中止しエラー表示。

## 10. 受入条件（抜粋）
- Given CSV取込済みテンプレートでセッションを開始
- When セッション画面を開く
- Then 取込CSVのstep内容で動的表示される

- Given `alarm_trigger=step_enter` step
- When そのstepへ初回到達
- Then アラームジョブが1件だけ生成される

- Given `timer_event=end` + `alarm_trigger=timer_end` step
- When ACT-001で次へ確定
- Then timer_event記録とアラームジョブ生成が重複なく行われる
