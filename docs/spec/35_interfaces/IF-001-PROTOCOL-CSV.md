# IF-001-PROTOCOL-CSV

## 1. 概要
- IF ID: `IF-001-PROTOCOL-CSV`
- 対象画面: `/capd/import`
- 取込単位: CSVファイル1件
- 画像入力: 選択フォルダ（直下ファイルのみを照合対象）
- 文字コード: UTF-8

## 2. ヘッダー契約（固定・完全一致）

`通し番号,step_id,next_step_id,フェーズ,状態,タイトル,画像,表示テキスト,警告テキスト,必須チェック,必須チェック数,timer_id,timer_event,timer_exchange_no,timer_segment,alarm_id,alarm_trigger,alarm_duration_min,alarm_related_timer_id,record_event,record_exchange_no,record_unit`

- `row_type/meta_key/meta_value` はCSVに含めません。
- `format_version/protocol_id/protocol_name/protocol_version/effective_from_local` はCSVで扱いません。

## 3. 値ドメイン
- `timer_event`: `start` | `end`
- `timer_segment`: `dwell` | `drain` | `""`
- `alarm_trigger`: `timer_end` | `step_enter` | `""`
- `record_event`: `drain_appearance` | `drain_weight_g` | `bag_weight_g` | `session_summary` | `""`
- `record_exchange_no`: `1`..`5` または空
- `timer_exchange_no`: `1`..`5` または空

## 4. 取込時バリデーション
- エラー（取込中止）:
  - ヘッダー不一致
  - `step_id` 重複
  - `next_step_id` 未定義参照
- 警告（取込継続）:
  - 参照画像不足（保存ボタンをdisabled）
  - 文言品質警告（Phase2拡張）

## 5. 保存契約
- 保存先: `protocol_packages`（IndexedDB）
- 画像保存先: `photo_meta`（`photoId=protasset::<protocolId>::<assetKey>`）
- `protocolId`/`protocolName`: CSVファイル名（拡張子除く）
- `steps`: 正規化済みstep本文を保持

## 6. 実行契約（Session連携）
1. セッション開始時に `ProtocolPackage.steps` を `SessionProtocolSnapshot.steps` へ固定コピーする。
2. セッション画面はsnapshotのみを参照する。
3. `ACT-001` 成功時に現在stepの `timer_event(start/end)` を1回記録する。
4. `alarm_trigger=timer_end` は `timer_event=end` 記録時にジョブ生成する。
5. `alarm_trigger=step_enter` はstep初回表示時にジョブ生成する。
