# Types Contract

## 1. 用語集
- ProtocolPackage: CSV取込後に保存される手技テンプレート。
- Session: 当日スロットに紐づく実施インスタンス。
- Record: `record_event` 単位の記録。
- SessionProtocolSnapshot: 開始時固定の手順定義。
- OutboxMutation: 同期対象のローカル更新。

## 2. 列挙型（完全列挙）
| 型名 | 値 | 備考 |
|---|---|---|
| `TimerEvent` | `start`, `end` | タイマーイベント |
| `TimerSegment` | `dwell`, `drain` | タイマー区分 |
| `RecordEvent` | `drain_appearance`, `drain_weight_g`, `bag_weight_g`, `session_summary` | 記録種別 |
| `SessionStatus` | `active`, `completed`, `aborted` | セッション状態 |
| `DailyProcedureSlotStatus` | `empty`, `planned`, `completed` | 永続状態 |
| `DailyProcedureSlotDisplayStatus` | `empty`, `pending`, `in_progress`, `completed` | 画面表示状態 |
| `SessionSummaryScope` | `first_of_day`, `last_of_day`, `both` | サマリ対象 |
| `AlarmDispatchStatus` | `pending`, `notified`, `acknowledged`, `missed` | アラーム状態 |
| `SyncTrigger` | `startup`, `resume`, `session_complete`, `manual` | 同期契機 |
| `SyncMode` | `delta`, `full_reseed` | 同期モード |
| `PhotoKind` | `drain`, `exit_site` | 写真種別 |

## 3. 不変条件（Invariants）
1. `record` のLWW比較キーは `(updatedAt, updatedByDeviceId, mutationId)` 降順。
2. `session_summary.payload.exit_site_photo` の更新は `patch_path=payload.exit_site_photo` の部分パッチ。
3. `SessionProtocolSnapshot` 保存失敗時はセッション開始失敗。
4. `cloudState=missing` 判定時にローカルデータ削除を禁止。
5. Import失敗時はテンプレート保存を行わない。

## 4. 参照元リンク
- `../../../requirements/04_domain_model_and_interfaces.md`
- `../../../design/04_sync_conflict_policy.md`
- `../30_capabilities/CAP-CSV-IMPORT-001.md`
- `../30_capabilities/CAP-SYNC-001.md`
- `../30_capabilities/CAP-SNAPSHOT-001.md`
