# SCR-006-SESSION

## 1. メタ情報
- SCR ID: SCR-SESSION-001
- 画面名: Session
- Route/I/F: `/capd/session`
- 主JRN: JRN-003-SESSION, JRN-004-ABORT, JRN-007-ALARM
- Phase: Phase1

## 2. 目的と責務境界
- この画面で決めること: ステップ進行、必須チェックゲート、記録ゲート、アラームACK、非常中断導線。
- CSVから取り込まれたテンプレートをセッション開始時に固定した `SessionProtocolSnapshot` を基に、表示内容（タイトル/文言/チェック/タイマー/記録イベント）を動的生成します。
- この画面で決めないこと: CSV取込、一覧編集、クラウド同期競合解決。

## 3. UIワイヤー・レイアウト制約
```text
+------------------------------------------------+
| フェーズ: 廃液 / 状態: お腹->廃液バッグ         |
+----------------------+-------------------------+
| [正方形画像]          | #21 タイトル/表示テキスト |
|                      | ! 警告帯(固定表示)       |
|                      | 必須チェック              |
|                      | ! 待機アラーム            |
|                      | [••• > セッションを中断]   |
|                      | [戻る] [次へ]            |
+----------------------+-------------------------+
```

- 画像領域は常に1:1正方形。
- iPhoneは1カラム、Macは2カラム。
- `戻る/次へ` は横並び同幅。
- `••• > セッションを中断（非常用）` を右上固定配置。
- 画面の手順表示は固定文言を持たず、`SessionProtocolSnapshot.steps[*]` を逐次解釈して動的に描画します。

## 4. UI要素一覧
| UI ID | 要素 | 表示条件 | 入力制約 | セレクタ方針 |
|---|---|---|---|---|
| UI-001-SESSION | ステップタイトル/本文 | 常時 | `#通し番号` 付き表示 | role/heading |
| UI-002-SESSION | 必須チェック一覧 | `requiredChecks` あり | すべて完了で次へ有効化 | role/checkbox |
| UI-003-SESSION | 次へボタン | 常時 | ゲート未達時disabled | role/button + name |
| UI-004-SESSION | 記録入力導線 | `record_event` あり | `FC-*` 完了まで次へ不可 | role/button + name |
| UI-005-SESSION | 非常中断メニュー | 常時 | 確認ダイアログ必須 | role/menuitem |
| UI-006-SESSION | アラームバナー/ACK | 未ACKジョブあり | ACKまで継続表示 | role/alert |
| UI-007-SESSION | 戻るボタン | 先頭ステップ以外 | 前ステップ表示のみ（副作用なし） | role/button + name |

## 5. 操作契約
| ACT ID | Guard | Side Effect | Success遷移 | Failure表示 |
|---|---|---|---|---|
| ACT-001-SESSION | 必須チェック完了かつ`record_event`完了 | `currentStepId` 更新 | SCR-006-SESSION | ブロック理由表示 |
| ACT-002-SESSION | 先頭ステップ以外 | 表示遷移のみ（再発火禁止） | SCR-006-SESSION | 該当なし |
| ACT-004-SESSION | 最終ステップ到達 | `Session.completed` + スロット更新 + 同期契機 | SCR-001-HOME | 完了失敗エラー |
| ACT-006-SESSION | 確認ダイアログ承認 | `Session.aborted` + スロットを`未実施`へ戻す | SCR-001-HOME | 中断失敗エラー |
| ACT-001-ALARM | 未ACKジョブあり | 通知停止 + `acked_at` 記録 | SCR-006-SESSION | ACK失敗表示 |

## 6. データバインディング
| 区分 | Read | Write | Outbox | 反映タイミング |
|---|---|---|---|---|
| ステップ表示 | `SessionProtocolSnapshot.steps[*]` | - | - | on load / on step change |
| 進行更新 | `requiredChecks`, `record完了状態` | `Session.currentStepId`, `Session.status` | `session_progress`, `session` | on next/final |
| 非常中断 | `Session.status=active` | `Session.status=aborted`, `slot.status=pending` | `session`, `daily_plan` | on abort confirm |
| ACK | `AlarmDispatchJob.pendingAlarm` | `acked_at`, `status` | `alarm_ack` | on ack |

## 7. バリデーション / エラー文言 / 空状態
- バリデーション:
  - `requiredChecks` 未完了時は次へ禁止。
  - `record_event` 未保存時は次へ禁止。
  - `next_step_id` に従い直列遷移。
  - 先頭ステップでは `ACT-002-SESSION` を禁止。
- エラー文言:
  - `必須チェックが未完了です。`
  - `記録を保存してから次へ進んでください。`
- 空状態: スナップショット欠落時は表示停止し整合性エラーを表示。

## 8. 権限・端末差分・フォールバック
- 進行更新は開始端末のみ許可。
- iPhoneでWake Lock未対応時は `unsupported/failed` 表示と対処ガイダンスを出します。
- 通信断時もローカル進行は継続し、同期は後送。

## 9. アクセシビリティ / キーボード
- Enterで次へ遷移。
- アラームバナーは通常ステップより高視認（NFR-004）で表示。
- スライド遷移中でもフォーカスの喪失を防止。

## 10. 受入条件（GWT）
- Given 必須チェック未完了ステップ
- When 次へを実行する
- Then 遷移せずブロック理由を表示する
- Given セッション進行中
- When `••• > 中断 > 確認` を実行する
- Then `aborted` で終了しHomeへ戻る

## 11. 参照リンク
- Local FR: `SCR-006-SESSION-FR-01` 〜 `SCR-006-SESSION-FR-40`
- 旧FR対応: FR-030〜FR-039G, FR-050A〜FR-058B, FR-071〜FR-074（特に FR-035, FR-037, FR-038, FR-039B を含む）
- AT: AT-FLOW-001, AT-FLOW-002, AT-FLOW-003, AT-FLOW-007, AT-ALARM-001〜AT-ALARM-004
- E2E/UT/VR: E2E-FLOW-004〜E2E-FLOW-007, E2E-ALARM-001〜E2E-ALARM-004, VR-SESSION-001〜VR-SESSION-004（`../50_quality/test-link-index.md` 参照）
- CAP: `../30_capabilities/CAP-SNAPSHOT-001.md`, `../30_capabilities/CAP-ALARM-001.md`

## 12. 画面機能要件（ローカルID）

- 採番規則: `<文書ID>-FR-yy`（yyはこの文書内連番）
- 旧FR IDは括弧内に残し、移行トレーサビリティを保持します。

- SCR-006-SESSION-FR-01: (旧: FR-030) 現在ステップのフェーズと状態を常時表示し、タイトルは通し番号付き（例: `#21 お腹のチューブのクランプを開ける`）で表示します。
- SCR-006-SESSION-FR-02: (旧: FR-031) 必須チェック未完了時に次ステップ遷移を禁止します。
- SCR-006-SESSION-FR-03: (旧: FR-032) `record_event` 未完了時に次ステップ遷移を禁止します。
- SCR-006-SESSION-FR-04: (旧: FR-033) `next_step_id` に従い完全シリアルで遷移します。
- SCR-006-SESSION-FR-05: (旧: FR-034) 最終ステップ完了時にセッション完了状態へ遷移します。
- SCR-006-SESSION-FR-06: (旧: FR-035) セッション開始端末のみ進行更新できます。
- SCR-006-SESSION-FR-07: (旧: FR-036) 同時実行セッションを端末ごとに1件へ制限します。
- SCR-006-SESSION-FR-08: (旧: FR-037) セッション画面の手順画像は1:1正方形領域で表示します。
- SCR-006-SESSION-FR-09: (旧: FR-038) セッション画面は iPhoneで1カラム、Macで2カラム表示に切り替えます。
- SCR-006-SESSION-FR-10: (旧: FR-039) セッション画面に「戻る」操作を提供し、直前ステップへ表示遷移できます。
- SCR-006-SESSION-FR-11: (旧: FR-039A) セッション画面の「戻る」と「次へ」は、iPhone/Macの双方で横並び・同幅で表示します。
- SCR-006-SESSION-FR-12: (旧: FR-039B) 「次へ」「戻る」押下時、および Enter キーによる次ステップ遷移時は、メインパネルを左右スライドで遷移表示します。
- SCR-006-SESSION-FR-13: (旧: FR-039C) セッション画面のカルーセルは、左右ナビゲーションボタンを表示しません。
- SCR-006-SESSION-FR-14: (旧: FR-039D) セッション画面右上 `•••` メニューに `セッションを中断（非常用）` を配置します。
- SCR-006-SESSION-FR-15: (旧: FR-039E) `セッションを中断（非常用）` は確認ダイアログを経て実行し、中断後はホームへ戻します。
- SCR-006-SESSION-FR-16: (旧: FR-039F) 明示中断時はセッションを `aborted` で終了し、対応スロットの表示状態を `未実施` へ戻します。
- SCR-006-SESSION-FR-17: (旧: FR-039G) ホームのスロットには `前回中断あり` の表示を出しません（履歴は記録一覧で確認）。
- SCR-006-SESSION-FR-18: (旧: FR-050A) 通知対象は `timer_event=end` の終了イベントとし、`timer_segment=dwell/drain` を同一ルールで扱います。
- SCR-006-SESSION-FR-19: (旧: FR-050B) 同一セッション内の通知ジョブは `alarm_id` 単位で独立管理します。
- SCR-006-SESSION-FR-20: (旧: FR-050C) 通知ジョブは最低限 `alarm_id / segment / due_at / acked_at / attempt_no / status` を保持します。
- SCR-006-SESSION-FR-21: (旧: FR-050D) `pendingAlarm` は未ACKジョブ（`pending/notified/missed`）から `due_at` 最小を優先して1件選択し、同値時は `alarm_id` 昇順を採用します。
- SCR-006-SESSION-FR-22: (旧: FR-051) 終了時刻 `T0` で Mac ローカル通知（音+バナー）を発火し、同時にアプリ内未確認アラートを固定表示します。
- SCR-006-SESSION-FR-23: (旧: FR-052) 未確認時は段階再通知を行います。
- SCR-006-SESSION-FR-24: (旧: FR-052A) 再通知間隔は `T+2分`（iPhone補助通知1回 + Mac再通知）、`T+5分以降`（3分間隔でMac+iPhone再通知）とします。
- SCR-006-SESSION-FR-25: (旧: FR-052B) 段階再通知の対象は「貯留終了（`dwell`）」「廃液終了（`drain`）」に限定します。
- SCR-006-SESSION-FR-26: (旧: FR-053) ACK時は Mac/iPhone の通知ジョブをすべて停止し、`acked_at` を記録します。
- SCR-006-SESSION-FR-27: (旧: FR-054) アプリ内アラートは ACK まで継続表示し、通知再送も ACK まで継続します。
- SCR-006-SESSION-FR-28: (旧: FR-055) 通知チャネルは `Mac主チャネル固定 + iPhone補助` とします。
- SCR-006-SESSION-FR-29: (旧: FR-055A) iPhone未利用かつ離席想定時は「見逃し高リスク」警告を必須表示します。
- SCR-006-SESSION-FR-30: (旧: FR-055B) iPhone補助通知の利用可否は Push購読状態（登録/無効化）で管理します。
- SCR-006-SESSION-FR-31: (旧: FR-056) 「戻る」操作、過去ステップ再表示、アプリ再開、通信リトライでは、`timer_event(start/end)`・`record_event`・通知ジョブ生成を再発火しません。
- SCR-006-SESSION-FR-32: (旧: FR-057) 30秒テスト通知は手動実行とし、通知設定変更時・OS更新後・通知不調時に実施できること。
- SCR-006-SESSION-FR-33: (旧: FR-057A) 手動30秒テストに失敗した場合は、当日を「iPhone補助なし（Mac主導）」として扱います。
- SCR-006-SESSION-FR-34: (旧: FR-058) `T+30分` 未確認時は `status=missed` を永続化し、「見逃し状態」を表示します。
- SCR-006-SESSION-FR-35: (旧: FR-058A) `status=missed` になった後も、ACKまで3分間隔の再通知を継続します。
- SCR-006-SESSION-FR-36: (旧: FR-058B) `status=missed` は ACK 成功時に `acknowledged` へ遷移し、通知停止と `acked_at` 記録を行います。
- SCR-006-SESSION-FR-37: (旧: FR-071) セッション開始時は `SessionProtocolSnapshot` をローカル同一トランザクションで保存し、保存失敗時は開始自体を失敗させます。
- SCR-006-SESSION-FR-38: (旧: FR-072) スナップショットには `sourceProtocol(meta)`、step定義本文（通し番号/タイトル/文言/必須チェック/timer/alarm/record）、画像 `assetKey`、`assetManifest`、`snapshotHash` を含めます。
- SCR-006-SESSION-FR-39: (旧: FR-073) セッション表示/再開時は開始時スナップショットを常に優先し、現行テンプレート版へフォールバックしません。
- SCR-006-SESSION-FR-40: (旧: FR-074) スナップショット欠落またはハッシュ不整合は整合性エラーとして扱い、セッション表示を停止します。
