# State Machine Contract

## 1. 状態一覧
- Slot: `empty / pending / in_progress / completed`
- Session: `active / completed / aborted`
- Sync: `idle / syncing / full_reseeding / success / failed`
- Alarm: `pending / notified / missed / acknowledged`
- Import: `idle / validating / failed / succeeded_with_warnings / succeeded`

## 2. イベント一覧
- Slot: `registerSlot`, `editSlot`, `startSession`, `resumeSession`, `completeSession`, `abortSession`, `deleteSlot`
- Session: `startSession`, `enterStep`, `completeStep`, `completeFinalStep`, `emergencyAbort`
- Sync: `startup`, `resume`, `session_complete`, `manual`, `pull_missing`, `full_reseed_applied`, `retry`
- Alarm: `timer_end`, `notify_t0`, `notify_retry`, `mark_missed`, `ack`
- Import: `select_directory`, `validate_csv`, `save_template`

## 3. 遷移表（禁止遷移含む）
| 対象 | 許可遷移 | 禁止遷移 |
|---|---|---|
| Slot | `empty->pending->in_progress->completed`, `in_progress->pending(abort)` | `completed->pending/edit/delete` |
| Session | `active->completed`, `active->aborted` | `completed|aborted->active` |
| Sync | `idle->syncing->success|failed`, `syncing->full_reseeding->syncing` | `failed->success`（再試行なし） |
| Alarm | `pending->notified->acknowledged`, `notified->missed->acknowledged` | `acknowledged` から再通知 |
| Import | `idle->validating->succeeded|failed` | `failed->succeeded`（再検証なし） |

## 4. 例外・リトライ・復旧
- 同期失敗時は指数バックオフ再試行。
- `cloudState=missing` は `full_reseed` 必須。
- `missed` 後もACKまで3分間隔再通知を継続。
- `record_event`/必須チェック未完了時は `ACT-001-SESSION` を拒否。

## 5. 参照元リンク
- `../../../design/11_state_machines.md`
- `../../../requirements/10_screen_transition_and_actions.md`
