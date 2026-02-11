# 04. データ同期と競合解決ポリシー

> 移行メモ（2026-02-11）: 本文の正本は `docs/spec/40_contracts/sync-conflict-policy.md` / `docs/spec/30_capabilities/CAP-SYNC-001.md` / `docs/spec/30_capabilities/CAP-RECOVERY-001.md` へ再構成済みです。  
> 本書は旧体系参照用として残置し、更新は `docs/spec` 側を優先します。


## 1. 目的
Mac/iPhone 併用時に、ローカルファーストの操作性を維持しながら、Netlify Blobs 共有で最終的整合性を確保します。

## 2. 前提ルール
- データ正本は各端末の IndexedDB
- クラウド（Netlify Blobs）は共有・復旧・バックアップ用途
- 同一端末内の `active` セッションは1件のみ
- 端末間の同時進行は許容し、同期時に内部LWWで解決
- 手技スナップショットは開始時固定、再開時は固定版のみ参照
- 同期は起動/復帰、セッション完了、手動同期で実行（定期ポーリングなし）

## 3. ストレージレイアウト
- `index.json`: 全体manifest（cloudRevision, dayRefs, photoRefs, tombstones, integrity hash）
- `days/YYYY-MM-DD.json`: 当日スロット、当日セッション、当日記録
- `photos/{photoId}.jpg`: 写真実体

## 4. 同期モデル

### 4.1 同期トリガー
- `startup`: アプリ起動時
- `resume`: バックグラウンド復帰時
- `session_complete`: 最終ステップ完了時
- `manual`: ユーザー明示の手動同期

### 4.2 同期手順
1. `push`: `outbox` 内 mutation を `POST /sync/push` で送信
2. サーバーは mutation を検証し、Blobs に反映
3. `pull`: 端末既知の `cloudRevision` 以降を `POST /sync/pull` で取得
4. クライアントがLWWでローカルへ適用
5. 適用結果に応じて同期状態（成功/失敗）を更新

### 4.3 クラウド欠損時の再シード
`POST /sync/pull` が `cloudState=missing` を返した場合は、クラウド同期基盤の欠損として扱います。

`cloudState=missing` は以下のいずれかで返却します。
- `index.json` 欠損
- `index.json` の必須フィールド不正（`cloudRevision/dayRefs/photoRefs/tombstones/integrity`）
- `dayRefs` が参照する `days/*.json` の欠損
- `photoRefs` が参照する `photos/*` の欠損
- `integrity` 検証失敗（自動補正不能）

1. クライアントはローカル全量（manifest/day/photo/tombstone）を組み立てる
2. `POST /sync/push` を `syncMode=full_reseed` で実行し、クラウド側を再シードする
3. 再シード後に `POST /sync/pull` を再実行し、`cloudState=ok` を確認する
4. 失敗時はローカルを変更せず `lastSyncStatus=failed` と再試行導線を表示する

### 4.4 outbox
- すべてのローカル更新は `outbox` へ追記
- `mutationId` は端末内で一意（ULID推奨）
- `session_summary.payload.exit_site_photo` の更新は `operation=patch` + `patch_path=payload.exit_site_photo` を使用
- push成功時に ack 済みとして削除
- push失敗時は保持し、次トリガーで再送

## 5. 競合解決（内部LWW固定）

### 5.1 比較キー
エンティティ単位で以下を降順比較して勝者を決定します。
1. `updatedAt`
2. `updatedByDeviceId`
3. `mutationId`

### 5.2 削除の扱い
- `deleted=true` を特別優先しません
- tombstone も同一比較キーで勝敗を決定します

### 5.3 `session_summary.payload.exit_site_photo` の扱い
- `record` への出口部写真更新は部分パッチ（`patch_path=payload.exit_site_photo`）として反映します。
- 競合時は `exit_site_photo` フィールドに対して同一比較キーでLWWを適用し、同一record内の他サマリ項目は上書きしません。
- 削除は `exit_site_photo=null` のパッチとして扱い、対応画像は `photo` tombstone で整合を取ります。

### 5.4 ユーザー表示
- 競合件数バナーや競合詳細一覧は提供しません。
- 競合は内部適用のみ行い、最終状態のみを表示します。

## 6. トゥームストーン方針
- 削除操作は物理削除せず tombstone として記録
- tombstone は `entityType/entityId/deletedAt/deletedByDeviceId/mutationId` を保持
- 30日保持後にGC対象とする

## 7. 端末消失・復旧
- 初回導線で `storage.persist()` を要求
- IndexedDB消失検知時は `POST /sync/pull` でフルリストア
- クラウド欠損検知時はローカル正本から全量再シードし、ローカルデータは削除しない
- 復旧不能時は復旧ガイダンス（確認手順、再同期手順）を表示

## 8. 障害時動作
- `push`/`pull` 失敗時は非同期バナーで再試行導線を提示
- セッション進行はローカルで継続可能
- 次回トリガーまたは手動同期で再試行
- 同時編集回避のため、更新前に手動同期を推奨
