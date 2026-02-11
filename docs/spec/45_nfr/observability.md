# Observability

## 1. 収集方針
- CAP単位で成功/失敗件数を収集します（CSV, Snapshot, Sync, Recovery, Alarm, Photo）。
- 失敗イベントには `error_code`, `device_id`, `trigger`, `mutationId` を付与します。
- 収集は「直近状態の把握」を目的とし、v1では重い履歴分析基盤を持ち込みません。

## 2. ダッシュボード
- Import: 成功率、失敗内訳（`IMPORT-*`）、warnings件数。
- Session: `active/completed/aborted` 件数、再開成功率。
- Sync: 成功率、再試行回数、`cloudState=missing` 発生回数。
- Recovery: `full_reseed` 成功率、失敗継続時間。
- Alarm: ACK遅延、`missed` 件数。
- Photo: 容量利用率、GC発火回数。

## 3. アラート
- 同期失敗連続が閾値超過で通知。
- `cloudState=missing` 検知時は即時通知。
- `full_reseed` 失敗継続時に通知。
- `missed` が連続発生した場合に通知。

## 4. 最低限の運用確認（毎日）
1. `lastSyncStatus` が `failed` の端末有無を確認。
2. `missed` の未解消ジョブ有無を確認。
3. 写真容量が上限へ近づいていないか確認。
