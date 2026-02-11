# Photo And Backup Policy

## 1. 目的
写真保存・容量制御・バックアップの運用ルールを固定します。

## 2. 写真保存
- 対象: `drain` / `exit_site`
- JPEG再圧縮: 長辺1600px, quality 85
- 参照メタ: `photoRefs`（`photo_kind` を保持）

## 3. 容量制御
- 総量上限: 1GB
- 超過時: 古い順に削除し、0.95GB以下へ収束

## 4. バックアップ
- 日次1回実行
- 30日保持
- 対象: `index.json`, `days/*.json`, `photos/*`

## 5. 参照リンク
- `../30_capabilities/CAP-PHOTO-BACKUP-001.md`
- `../40_contracts/storage-model.md`
- `./non-functional.md`
