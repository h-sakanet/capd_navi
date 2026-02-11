# SCR-006-SESSION

## 1. メタ情報
- SCR ID: SCR-SESSION-001
- 画面名: Session
- Route/I/F: `/capd/session`
- 主JRN: JRN-003-SESSION, JRN-004-ABORT, JRN-007-ALARM
- Phase: Phase1

## 2. 目的と責務境界
- この画面で決めること: ステップ進行、必須チェックゲート、記録ゲート、アラームACK、非常中断導線。
- この画面で決めないこと: CSV取込、一覧編集、クラウド同期競合解決。

## 3. UIワイヤー・レイアウト制約
- 参照: `../../../requirements/06_ui_wireframes_ab.md` 7章。
- 画像領域は常に1:1正方形。
- iPhoneは1カラム、Macは2カラム。
- `戻る/次へ` は横並び同幅。
- `••• > セッションを中断（非常用）` を右上固定配置。

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
| ACT-001-SESSION | 必須チェック完了かつ`record_event`完了 | `currentStepId` 更新 | 同一画面で次ステップ表示 | ブロック理由表示 |
| ACT-002-SESSION | 先頭ステップ以外 | 表示遷移のみ（再発火禁止） | 同一画面で前ステップ表示 | 該当なし |
| ACT-004-SESSION | 最終ステップ到達 | `Session.completed` + スロット更新 + 同期契機 | SCR-001-HOME | 完了失敗エラー |
| ACT-006-SESSION | 確認ダイアログ承認 | `Session.aborted` + スロットを`未実施`へ戻す | SCR-001-HOME | 中断失敗エラー |
| ACT-001-ALARM | 未ACKジョブあり | 通知停止 + `acked_at` 記録 | 同一画面維持 | ACK失敗表示 |

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
- FR: FR-030〜FR-039G, FR-050A〜FR-058B, FR-071〜FR-074
- AT: AT-FLOW-001, AT-FLOW-002, AT-FLOW-003, AT-FLOW-007, AT-ALARM-001〜AT-ALARM-004
- E2E/UT/VR: E2E-FLOW-004〜E2E-FLOW-007, E2E-ALARM-001〜E2E-ALARM-004, VR-SESSION-001〜VR-SESSION-004（`../50_quality/test-link-index.md` 参照）
- CAP: `../30_capabilities/CAP-SNAPSHOT-001.md`, `../30_capabilities/CAP-ALARM-001.md`
