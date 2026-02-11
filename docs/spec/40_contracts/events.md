# Events Contract

## 1. イベント一覧
| イベント | 発火条件 | 主payload |
|---|---|---|
| `protocol.imported` | CSV取込成功 | `protocolId`, `warnings`, `summary` |
| `protocol.import_failed` | CSV取込失敗 | `errors`, `warnings` |
| `session.started` | 開始確認確定 | `sessionId`, `slotNo`, `protocolId` |
| `session.completed` | 最終ステップ完了 | `sessionId`, `completedAt` |
| `session.aborted` | 非常中断確定 | `sessionId`, `abortedAt` |
| `record.saved` | 記録モーダル保存 | `recordId`, `recordEvent` |
| `sync.started` | 同期契機到達 | `trigger` |
| `sync.succeeded` | push/pull成功 | `applied`, `cloudRevision` |
| `sync.failed` | 同期失敗 | `error`, `trigger` |
| `recovery.started` | `cloudState=missing` | `reason` |
| `recovery.completed` | 再シード+再pull成功 | `cloudRevision` |
| `alarm.fired` | T0/再通知発火 | `alarmId`, `attemptNo`, `dueAt` |
| `alarm.acked` | ACK成功 | `alarmId`, `ackedAt` |
| `photo.updated` | 写真登録/変更成功 | `recordId`, `photoId`, `photo_kind` |
| `photo.deleted` | 写真削除成功 | `recordId`, `photoId` |

## 2. ペイロード定義
- 共通項目: `event_id`, `occurred_at`, `device_id`
- 競合解決に関わるイベントは `updatedAt`, `updatedByDeviceId`, `mutationId` を含めます。
- 機微情報（自由記述本文など）はイベントpayloadに平文で入れません。

## 3. 参照元リンク
- `../../../requirements/04_domain_model_and_interfaces.md`
- `../../../design/05_notifications_sleep.md`
