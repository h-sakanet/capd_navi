# Sync And Conflict Policy Contract

## 1. 目的
Mac/iPhone 併用時にローカルファースト操作を維持しつつ、同期で最終整合を保証します。

## 2. 同期トリガー
- `startup`
- `resume`
- `session_complete`
- `manual`

## 3. 同期手順
1. `push`: outbox mutation を送信
2. 受理分をクラウド反映
3. `pull`: `cloudRevision` 以降差分を取得
4. クライアントでLWW適用
5. `lastSyncStatus` を更新

## 4. 欠損復旧（cloudState=missing）
- `index.json` 欠損や参照不整合で `cloudState=missing` を返却します。
- クライアントはローカル正本から `syncMode=full_reseed` を実行します。
- 再pullで `cloudState=ok` を確認するまで復旧完了にしません。
- 復旧失敗時もローカルデータを削除しません。

## 5. 競合解決（LWW）
比較キーを降順で評価します。
1. `updatedAt`
2. `updatedByDeviceId`
3. `mutationId`

- tombstone も同一ルールで解決します。
- 競合件数表示や手動マージUIは提供しません。

## 6. 出口部写真パッチ
- `session_summary.payload.exit_site_photo` は `patch_path=payload.exit_site_photo` の部分パッチで同期します。
- 同一record内の他サマリ項目を上書きしません。

## 7. 参照リンク
- `./storage-model.md`
- `./api.md`
- `./state-machine.md`
- `../30_capabilities/CAP-SYNC-001.md`
- `../30_capabilities/CAP-RECOVERY-001.md`
- `../30_capabilities/CAP-PHOTO-BACKUP-001.md`
