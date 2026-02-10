# 03. 手技CSV v3仕様

## 1. 目的
Googleスプレッドシートで編集したCSVを、Macから画像群と一緒に取り込み、画面描画用JSONへ正規化する仕様です。

## 2. 対応バージョン
- 対応: v3のみ
- 非対応: v2以前

## 3. 取り込み単位（v1固定）
- 取り込みは Mac ネイティブシェルからのみ実行します。
- 入力は「1ディレクトリ単位」です。
- ディレクトリ内に `protocol.csv` を必須とします。
- 画像は `protocol.csv` からの相対パスで解決できる位置に配置します。

例:
```text
protocol_package/
  protocol.csv
  v3/
    handwash.png
    step_021.png
```

## 4. CSVファイル仕様
- 文字コード: UTF-8
- 区切り: カンマ
- 改行: LF/CRLFの両方を許容
- セル内改行: ダブルクォートで囲まれた改行を許容

## 5. 列仕様（推奨順）
`row_type,meta_key,meta_value,通し番号,step_id,next_step_id,フェーズ,状態,タイトル,画像,表示テキスト,警告テキスト,必須チェック,timer_id,timer_event,timer_exchange_no,timer_segment,alarm_id,alarm_trigger,alarm_duration_min,alarm_related_timer_id,record_event,record_exchange_no,record_unit`

### 5.1 `row_type=meta` 行
- `meta_key`, `meta_value` を必須とします。
- その他列は空欄とします。

必須メタキー:

- `format_version`（値は `3` 固定）
- `protocol_id`
- `protocol_name`
- `protocol_version`
- `effective_from_local`（端末ローカル日時文字列）

### 5.2 `row_type=step` 行
主要必須列:

- `step_id`
- `next_step_id`（最終行のみ空許容）
- `フェーズ`
- `状態`
- `タイトル`

条件付き列:

- `必須チェック`: 改行区切りで複数定義可
- `timer_id` 使用時は `timer_event` も必須
- `timer_segment` は、貯留/廃液の時刻表示または通知対象判定が必要な行で使用します（非対象タイマーは空欄可）
- `timer_event=end` かつ `timer_segment=dwell/drain` の行では `alarm_id` を必須
- `alarm_trigger`, `alarm_duration_min`, `alarm_related_timer_id` は互換維持のため受理しますが、v1運用では未使用です
- `record_event` 使用時は必要に応じて `record_exchange_no`, `record_unit` を併用

## 6. 列の意味
- `step_id`, `next_step_id`: 完全シリアル遷移（分岐なし）
- `フェーズ`, `状態`: UI常時表示用の文脈ラベル
- `タイトル`, `画像`, `表示テキスト`, `警告テキスト`: 画面表示コンテンツ
- `必須チェック`: チェックボックス表示と進行ブロック制御
- `timer_*`: 自動時刻記録
- `alarm_id`: タイマー終了通知ジョブの識別子（同一セッション内の通知対象行で一意）
- `alarm_*`（`alarm_trigger`, `alarm_duration_min`, `alarm_related_timer_id`）: 互換維持列（v1運用では未使用）
- `record_*`: 手動記録モーダル起動条件
- `record_exchange_no`: 記録ノート交換列（左から `1`〜`5`）への割当キー
- `timer_exchange_no`: 時刻記録の交換列（左から `1`〜`5`）への割当キー

## 7. 画像パス解決
- `画像` 列は `protocol.csv` 配置ディレクトリ基準の相対パスです。
- 版サブフォルダを含めることを推奨します（例: `v3/手洗い.png`）。
- ファイル未存在は取り込みエラーです。
- 取り込み後、画像はオブジェクトストレージへ保存され、配信URLへ変換して参照します。

## 8. 値ドメイン（v1固定）
- `timer_event`: `start` / `end`
- `timer_segment`: `dwell` / `drain`（定義時。通知/ノート表示の対象セグメント。非対象タイマーは空欄可）
- `alarm_id`: 文字列（同一セッション内の通知対象行で重複不可）
- `record_event`: `drain_appearance` / `drain_weight_g` / `bag_weight_g` / `session_summary`
- `record_unit`（v1実績）: `g`
- `record_exchange_no`: `1`〜`5`
- `timer_exchange_no`: `1`〜`5`

## 9. バリデーション

### 9.1 エラー（1件でも取り込み中止）
- `row_type` が `meta` / `step` 以外
- 必須メタキー欠落
- `step_id` 重複
- `next_step_id` 不整合（完全シリアル違反）
- `timer_event` が `start/end` 以外
- `timer_segment` が空欄以外で `dwell/drain` 以外
- 同一 `timer_id` の整合違反（start/end不備）
- `timer_event=end` かつ `timer_segment=dwell/drain` の行で `alarm_id` が空
- 同一セッション内で、通知対象行（`timer_event=end` かつ `timer_segment=dwell/drain`）の `alarm_id` が重複
- `record_event` が定義外値
- `画像` 指定ファイルが存在しない

### 9.2 警告（取り込み可能だが修正推奨）
- `xx分` など未確定時間表現
- `(これはなんだろう)` など未確定文言
- ダミー電話番号等のプレースホルダ
- `alarm_trigger`, `alarm_duration_min`, `alarm_related_timer_id` が設定されている（v1では未使用）
- 通知対象外行（`timer_event=end` かつ `timer_segment=dwell/drain` 以外）に `alarm_id` が設定されている（一意性エラー判定の対象外）

## 10. 取り込み処理手順
1. Macでディレクトリ選択
2. `protocol.csv` 存在確認
3. 構文パース（改行セル対応）
4. `meta` 行検証
5. `step` 行検証
6. 画像存在検証
7. エラー有無判定（1件でも中止）
8. 警告収集
9. 正規化JSON生成
10. テンプレート版として保存

## 11. ローカル取り込みI/F（公開APIなし）
- v1 のCSV取り込みは公開HTTP APIを持たず、Macローカル処理で完結します。
- 取り込みI/Fは次を公開契約とします。
  - `ProtocolImportService.importFromDirectory(input: { basePath: string }): Promise<ImportResult>`

```ts
type ImportResult = {
  status: "success" | "failed";
  errors: Array<{ row?: number; field?: string; message: string }>;
  warnings: Array<{ row?: number; field?: string; message: string }>;
  summary: { stepCount: number; timerCount: number; alarmCount: number; recordEventCount: number };
};
```

## 12. 開始時スナップショット固定（実行契約）
- `SessionService.startSession` 実行時は、取り込み済み `ProtocolPackage` から以下を `SessionProtocolSnapshot` に固定コピーします。
  - `meta`: `protocol_id`, `protocol_version`, `importedAt`
  - `step` 行: `通し番号`, `step_id`, `next_step_id`, `フェーズ`, `状態`, `タイトル`, `表示テキスト`, `警告テキスト`, `必須チェック`
  - `timer` 指示: `timer_id`, `timer_event`, `timer_exchange_no`, `timer_segment`
  - `alarm` 指示: `alarm_id`（`timer_event=end` かつ `timer_segment=dwell/drain` 行）
  - `record` 指示: `record_event`, `record_exchange_no`, `record_unit`
  - 画像: `画像`（相対パス）を配信用 `assetKey` へ解決した `assetManifest`
- 固定コピー後に正規化JSONの `snapshotHash(sha256)` を算出して保存します。
- スナップショット保存に失敗した場合はセッション開始を失敗させます（`SESSION_SNAPSHOT_CREATE_FAILED`）。
- セッション再開時はスナップショットのみを参照し、テンプレート現行版へフォールバックしません。
