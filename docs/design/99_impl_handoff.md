# 99. 実装セッション引き継ぎ要約

## 1. 実装固定事項
- アーキテクチャ: 共通Web + Macネイティブシェル（WKWebView）
- データ基盤: IndexedDB（端末正本） + Netlify Blobs（共有/バックアップ）
- API: Netlify Functions は最小構成（`/sync/pull`, `/sync/push`）
- 認証: アプリ内認証なし（公開URL運用）
- 同期データ: 非暗号化保存（HTTPS通信前提）
- 同期契機: 起動/復帰、セッション完了、手動同期
- クラウド欠損時: `sync/pull` の `cloudState=missing` 検知で `syncMode=full_reseed` を実行し、ローカル正本から再シード
- 競合解決: エンティティ単位LWW（`updatedAt`, `updatedByDeviceId`, `mutationId` 降順）
- 競合表示: ユーザー向け件数表示/詳細表示は行わない
- 同時実行セッション: 端末内で1件
- 開始時スナップショット: セッション開始時にローカル原子的保存
- スナップショット復元: snapshot固定（現行テンプレート版へフォールバックしない）
- スロット制御: 左から右の順序実行、推奨時刻は厳密昇順
- 予期せぬ離脱: `active` 維持、`実施中` スロット選択で再開
- 明示中断: セッション画面 `•••` の非常中断のみ許可。中断後は `未実施` へ戻す
- 通知対象: `timer_event=end` かつ `timer_segment=dwell/drain` の終了通知のみ
- 通知チャネル: `Mac主チャネル固定 + iPhone補助`
- 手技開始通知: 本アプリ対象外（外部アラーム運用）
- 写真: 上限1GB、超過時古い順削除
- バックアップ: 日次スナップショット（30日保持）
- エクスポート: v1対象外

## 2. 実装優先順
1. ローカルドメイン層（Session/Record/DailyPlan Service + IndexedDBスキーマ）
2. Sync基盤（outbox, pull/push, LWW内部適用）
3. セッション進行・記録UIとローカル保存
4. Macブリッジ（通知/スリープ/取り込み）
5. 写真容量制御
6. バックアップ
7. UI標準反映と受入試験

## 3. 主要APIチェックリスト（最小）
- `POST /sync/pull`
  - 入力: `deviceId`, `knownCloudRevision`, `knownDayRevisions`
  - 出力: `cloudState`, `manifestDiff`, `dayBundles`, `photoRefs`
  - `cloudState=missing` 判定: `index.json` 欠損 / 必須フィールド不正 / `dayRefs` 参照欠損 / `photoRefs` 参照欠損 / `integrity` 検証失敗
- `POST /sync/push`
  - 入力: `deviceId`, `syncMode`, `baseCloudRevision`, `mutations[]`
  - 出力: `acceptedMutations`, `rejectedMutations`, `newCloudRevision`, `reseedApplied`

## 4. クライアント公開I/Fチェックリスト
- `SessionService`
  - `startSession(slotNo, protocolId)`
  - `enterStep(sessionId, stepId)`
  - `completeStep(sessionId, stepId)`
  - `abortSession(sessionId)`
- `RecordService`
  - `saveRecord(sessionId, recordEvent, payload)`
  - `updateRecord(recordId, patch)`
  - `listRecords(dateRange)`
- `DailyPlanService`
  - `getPlan(dateLocal)`
  - `upsertSlot(dateLocal, slotNo, payload)`
  - `deleteSlot(dateLocal, slotNo)`
- `ProtocolImportService`
  - `importFromDirectory(basePath)`
- `SyncService`
  - `sync(trigger)`
  - `restoreFromCloud()`
  - `getSyncState()`

## 5. UIスパイク成果物
- 本番ルート: `/capd/home`, `/capd/history-list`, `/capd/session`
- 参考ルート: `/ui-preview`（アーカイブ案内のみ）
- UI仕様は `08_ui_standard.md` を正とし、ローカルファースト化で画面要件は変更しない

## 6. 未確定事項
- なし（本書時点でゼロ）
