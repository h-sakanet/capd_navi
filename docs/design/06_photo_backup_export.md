# 06. 写真保存・バックアップ設計

> 移行メモ（2026-02-11）: 本文の正本は `docs/spec/45_nfr/photo-backup-policy.md` / `docs/spec/30_capabilities/CAP-PHOTO-BACKUP-001.md` / `docs/spec/40_contracts/storage-model.md` へ再構成済みです。  
> 本書は旧体系参照用として残置し、更新は `docs/spec` 側を優先します。


## 1. 写真保存ポリシー

### 1.1 入力
- 対象:
  - `record_event=drain_appearance`（`photo_kind=drain`）
  - `session_summary.payload.exit_site_photo`（`photo_kind=exit_site`）
- 任意入力
- 出口部写真は1レコード1枚固定、変更/削除可（削除時は `exit_site_photo=null` + 写真tombstone）

### 1.2 変換
- JPEGへ再圧縮
- 長辺1600px
- quality 85

### 1.3 保存先
- 実体: `photos/{photoId}.jpg`（Netlify Blobs）
- 参照情報: `index.json` の `photoRefs[]`
- ローカル参照: IndexedDB の `photos` テーブル
- `photoRefs[]` は `photo_kind`（`drain` / `exit_site`）で種類を識別

### 1.4 容量制御
- 全写真合計上限: 1GB
- 容量枠は `drain` と `exit_site` で共通
- 閾値超過時処理:
  1. `capturedAt` 昇順で削除候補を取得
  2. 古い順に tombstone 化して削除
  3. 合計使用量が 0.95GB 以下になるまで継続
- 削除処理結果は直近実行状態のみ保持し、件数履歴メトリクスは保持しない

## 2. 共有インデックス設計

### 2.1 `index.json`
最低限以下を保持します。
- `cloudRevision`
- `dayRefs[]`（`dateLocal`, `blobKey`, `sha256`, `updatedAt`）
- `photoRefs[]`（`photoId`, `photo_kind`, `blobKey`, `sizeBytes`, `sha256`, `updatedAt`）
- `tombstones[]`
- `integrity`（index本文ハッシュ）

### 2.2 `days/YYYY-MM-DD.json`
- 当日4スロット
- 当日セッション
- 当日記録
- 当日スナップショット参照
- 更新メタ（`updatedAt`, `updatedByDeviceId`, `mutationId`）

## 3. バックアップ設計

### 3.1 スケジュール
- Netlify Scheduled Functions で毎日1回（深夜）実行

### 3.2 内容
- `index.json` の世代コピー
- `days/*.json` の差分スナップショット
- `photoRefs` の整合性チェック結果
- バックアップメタ（作成日時、実行結果、チェックサム）

### 3.3 保持
- 30日保持
- 31日目以降は自動削除

## 4. 失敗時の運用
- 写真保存失敗: 記録保存を継続し、写真のみ再試行導線を表示
- バックアップ失敗: 次回ジョブで再実行し、UIには直近失敗状態のみ表示（履歴メトリクスは保持しない）

## 5. バックアップ復元Runbook（運用固定）

### 5.1 発動条件
- `POST /sync/pull` が `cloudState=missing` を返す
- もしくは `index.json` / `days/*.json` / `photos/*` の整合性チェックで欠損を検知

### 5.2 復元手順
1. 端末にローカル正本が残っている場合は、手動同期で `syncMode=full_reseed` を実行する（第一選択）
2. `full_reseed` が失敗し、かつクラウド欠損が継続する場合は、最新のバックアップ世代を現行キーへ復元する
3. 復元後に Mac で手動同期を1回実行し、続けて iPhone で同期を実行する
4. `cloudState=ok`、`lastSyncStatus=success`、主要日付バンドル参照可能を確認する

### 5.3 完了条件
- `index.json` が存在し、`dayRefs/photoRefs/tombstones` が参照可能
- 主要端末（Mac/iPhone）で同一日の記録件数が一致
- 以後の通常同期（delta）が成功する
