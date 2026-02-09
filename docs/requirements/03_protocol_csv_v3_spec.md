# 03. 手技CSV v3仕様

## 1. 目的
Googleスプレッドシートで編集し、CSVエクスポートした手技定義をアプリへ取り込み、画面描画用JSONへ正規化するための仕様です。

## 2. 対応バージョン
- 対応: v3のみ
- 非対応: v2以前

## 3. ファイル仕様
- 文字コード: UTF-8
- 区切り: カンマ
- 改行: LF/CRLFの両方を許容
- セル内改行: ダブルクォートで囲まれた改行を許容

## 4. 列仕様（推奨順）
`row_type,meta_key,meta_value,通し番号,step_id,next_step_id,フェーズ,状態,タイトル,画像,表示テキスト,警告テキスト,必須チェック,timer_id,timer_event,timer_exchange_no,timer_segment,alarm_id,alarm_trigger,alarm_duration_min,alarm_related_timer_id,record_event,record_exchange_no,record_unit`

### 4.1 `row_type=meta` 行
- `meta_key`, `meta_value` を必須とします。
- その他列は空欄とします。

必須メタキー:

- `format_version`（値は `3` 固定）
- `protocol_id`
- `protocol_name`
- `protocol_version`
- `effective_from_local`（端末ローカル日時文字列）

### 4.2 `row_type=step` 行
主要必須列:

- `step_id`
- `next_step_id`（最終行のみ空許容）
- `フェーズ`
- `状態`
- `タイトル`

条件付き列:

- `必須チェック`: 改行区切りで複数定義可
- `timer_id` 使用時は `timer_event` も必須
- `alarm_id` 使用時は `alarm_trigger`, `alarm_duration_min`, `alarm_related_timer_id` も必須
- `record_event` 使用時は必要に応じて `record_exchange_no`, `record_unit` を併用

## 5. 列の意味
- `step_id`, `next_step_id`: 完全シリアル遷移（分岐なし）
- `フェーズ`, `状態`: UI常時表示用の文脈ラベル
- `タイトル`, `画像`, `表示テキスト`, `警告テキスト`: 画面表示コンテンツ
- `必須チェック`: チェックボックス表示と進行ブロック制御
- `timer_*`: 自動時刻記録
- `alarm_*`: 待機用通知
- `record_*`: 手動記録モーダル起動条件

## 6. 画像パス解決
- `画像` 列はCSVファイル配置ディレクトリ基準の相対パスです。
- 版サブフォルダを含めることを推奨します（例: `v3/手洗い.png`）。
- ファイル未存在は取り込みエラーです。

## 7. 値ドメイン（v1固定）
- `timer_event`: `start` / `end`
- `alarm_trigger`: `step_enter`
- `record_event`: `drain_appearance` / `drain_weight_g` / `bag_weight_g` / `session_summary`
- `record_unit`（v1実績）: `g`

## 8. バリデーション

### 8.1 エラー（1件でも取り込み中止）
- `row_type` が `meta` / `step` 以外
- 必須メタキー欠落
- `step_id` 重複
- `next_step_id` 不整合（完全シリアル違反）
- `timer_event` が `start/end` 以外
- 同一 `timer_id` の整合違反（start/end不備）
- `alarm_related_timer_id` が未定義 `timer_id` を参照
- `record_event` が定義外値
- `画像` 指定ファイルが存在しない

### 8.2 警告（取り込み可能だが修正推奨）
- `xx分` など未確定時間表現
- `(これはなんだろう)` など未確定文言
- ダミー電話番号等のプレースホルダ

## 9. 取り込み処理手順
1. CSV受領
2. 構文パース（改行セル対応）
3. `meta` 行検証
4. `step` 行検証
5. エラー有無判定（1件でも中止）
6. 警告収集
7. 正規化JSON生成
8. テンプレート版として保存

## 10. 取り込み結果レスポンス
- `status`: `success` / `failed`
- `errors[]`: 取り込み停止要因
- `warnings[]`: 品質警告
- `summary`: ステップ数、タイマー数、アラーム数、記録イベント数

## 11. 最小CSV例
```csv
row_type,meta_key,meta_value,通し番号,step_id,next_step_id,フェーズ,状態,タイトル,画像,表示テキスト,警告テキスト,必須チェック,timer_id,timer_event,timer_exchange_no,timer_segment,alarm_id,alarm_trigger,alarm_duration_min,alarm_related_timer_id,record_event,record_exchange_no,record_unit
meta,format_version,3,,,,,,,,,,,,,,,,,,,,,,
meta,protocol_id,capd_onebag,,,,,,,,,,,,,,,,,,,,,,
meta,protocol_name,ワンバッグ手技,,,,,,,,,,,,,,,,,,,,,,
meta,protocol_version,v3.0.0,,,,,,,,,,,,,,,,,,,,,,
meta,effective_from_local,2026-02-10T00:00:00+09:00,,,,,,,,,,,,,,,,,,,,,,
step,,,1,step_001,step_002,事前準備,お腹-独立,必要物品の準備,v3/必要物品.png,,,"物品は揃っている",,,,,,,,,,,
step,,,2,step_002,,終了,お腹-独立,今日の腹膜透析は終了,,,,,,,,,,,,,,,
```
