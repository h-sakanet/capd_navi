# 06. 写真保存・バックアップ・エクスポート設計

## 1. 写真保存ポリシー

### 1.1 入力
- 対象: `record_event=drain_appearance`
- 任意入力

### 1.2 変換
- JPEGへ再圧縮
- 長辺1600px
- quality 85

### 1.3 保存先
- Netlify Blobs
- メタ情報はDBで管理（photoId, blobKey, capturedAt, sizeBytes）

### 1.4 容量制御
- 全写真合計上限: 1GB
- 閾値超過時処理:
  1. `capturedAt` 昇順で削除候補を取得
  2. 古い順に削除
  3. 合計使用量が0.95GB以下になるまで継続
- 削除ログを監査テーブルに記録

## 2. バックアップ設計

### 2.1 スケジュール
- Netlify Scheduled Functions で毎日1回（深夜）実行

### 2.2 内容
- DB論理ダンプ（セッション、記録、テンプレート、監査ログ）
- バックアップメタ情報（作成日時、件数、チェックサム）

### 2.3 保持
- 30日保持
- 31日目以降は自動削除

## 3. 手動エクスポート設計
- API: `POST /exports/manual`
- 出力形式: ZIP
- 内容:
  - `sessions/*.json`
  - `records/*.json`
  - `photos/*`（includePhotos=true時）
  - `manifest.json`
- ダウンロードURLは時限（例: 24時間）

## 4. 失敗時の運用
- 写真保存失敗: 記録保存を継続し、写真のみ再試行導線を表示
- バックアップ失敗: 管理通知に記録し、次回ジョブで再実行
- エクスポート失敗: 再実行ボタン + 失敗理由を表示
