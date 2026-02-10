# 99. 実装セッション引き継ぎ要約

## 1. 実装固定事項
- アーキテクチャ: 共通Web + Macネイティブシェル（WKWebView）
- スタック: Next.js + Tailwind CSS + shadcn/ui + Netlify Functions + Neon PostgreSQL + Drizzle + Netlify Blobs
- 認証: アプリ内認証なし（公開URL運用）
- 同期: 非リアルタイム単一書き込み
- 同時実行セッション: 1件
- 開始時スナップショット: `POST /sessions` で `sessions` + `session_protocol_snapshots` を原子的に作成
- スナップショット復元: `GET /sessions/{id}` は snapshot 固定（現行テンプレート版へフォールバックしない）
- スナップショット異常: 欠落/改ざんは `409 SESSION_SNAPSHOT_INTEGRITY_ERROR`
- ホームスロット: 左から右の順序実行を強制（左未完了時は右開始不可）
- 推奨実施時間: 左から右で厳密昇順（同時刻不可）
- スロット表示状態: `未登録` / `未実施` / `実施中` / `実施済み`
- 予期せぬ離脱: `active` 維持、`実施中` スロット選択で再開
- 明示中断: セッション画面 `•••` の非常中断のみ許可。中断後はスロットを `未実施` へ戻す
- 進行中セッションの別端末閲覧: v1対象外（完了/中断後のみ別端末閲覧）
- 同期での `sessionId` 共有: completed/aborted のみ（activeは共有しない）
- 通知対象: `timer_event=end` かつ `timer_segment=dwell/drain` の終了通知のみ
- 通知チャネル: `Mac主チャネル固定 + iPhone補助`
- 通知再送: `T+2分`（iPhone1回 + Mac再通知）、`T+5分以降`（3分間隔でMac+iPhone）
- ACK処理: `POST /sessions/{id}/alarms/{alarmId}/ack` で再通知停止 + `acked_at` 記録
- 手技開始通知: 本アプリ対象外（外部アラーム運用）
- 運用品質: 手動30秒テスト通知（必要時実施）
- 写真: 上限1GB、超過時古い順削除
- バックアップ: 日次自動（30日保持）
- エクスポート: 手動ZIP
- 日次サマリ必須入力:
  - 最初完了セッション: 血圧/体重/脈拍/体温/出口部状態
  - 最後完了セッション: 飲水量/尿量/排便回数
- 除水量: 交換#1は未計算、交換#2以降のみ `排液量-前回注液量`

## 2. 実装優先順
1. API契約（executionToken、syncCursor、record revision、slot plan revision）
2. セッション進行の単一書き込み制御
3. Macブリッジ（通知/スリープ/取り込み）
4. CSV+画像取り込み
5. 写真容量制御
6. バックアップ/エクスポート
7. UIスパイク反映とUI標準適用

## 3. 主要APIチェックリスト
- `POST /protocols/import-package`
- `GET /daily-procedure-slots`
- `PUT /daily-procedure-slots/{slotNo}`（`baseRevision`）
- `DELETE /daily-procedure-slots/{slotNo}`（`baseRevision`）
- `POST /sessions`
- `session_protocol_snapshots` 作成（`snapshot_hash` 保存）
- `GET /sessions/{id}`（`active` は ownerDevice 以外 `403`）
- `POST /sessions/{id}/steps/{stepId}/enter`（副作用確定、冪等）
- `POST /sessions/{id}/alarms/{alarmId}/ack`（ACKで再通知停止）
- `POST /push-subscriptions`（iPhone補助通知の購読登録/更新）
- `DELETE /push-subscriptions/{subscriptionId}`（購読無効化）
- `POST /notification-tests/daily`（30秒テスト通知）
- `POST /sessions/{id}/abort`（`X-Execution-Token`）
- `POST /sessions/{id}/steps/{stepId}/complete`（`X-Execution-Token`）
- `POST /sessions/{id}/records`（`X-Execution-Token`）
- `PATCH /sessions/{id}/records/{recordId}`（`baseRevision`）
- `GET /sync/changes`
- `POST /exports/manual`

## 4. UIスパイク成果物
- ルート: `/ui-preview/home-a`, `/ui-preview/history-list`, `/ui-preview/session-a`, `/ui-preview/status-patterns`
- Home A追加仕様: 4スロット（初期未登録`+`）/ 手技設定モーダル / 手技の開始確認モーダル / 手技内容確認モーダル / カード本体タップ開始 / `•••` 補助操作
- Home A状態仕様: スロット状態は `未実施` / `実施中` / `実施済み`。`実施中` は再開、`実施済み` はカード本体タップ開始を無効化
- Home A制御仕様: スロット推奨時刻は左から右で厳密昇順。右側開始は左側スロット実施済みが前提
- Home A表示仕様: 中断履歴バッジ（`前回中断あり`）は表示しない
- Session A追加仕様: 状態バッジは Compact Badge（MynaUI icon + 色）/ タイトルは `#通し番号 + タイトル` / `戻る・次へ` は横並び同幅
- Session A遷移仕様: `戻る/次へ/Enter(次へ)` でメインパネルを左右スライド遷移（左右ナビボタンなし）
- Session A非常手段: 右上 `•••` から `セッションを中断（非常用）` を実行可能。実行後はホーム復帰 + スロットを `未実施` 表示へ戻す
- 判定: 5観点 x 5点評価
- 採用後に `08_ui_standard.md` を最終確定

## 5. 未確定事項
- なし（本書時点でゼロ）

## 6. レビュー指摘トラッキング
- 第三者レビュー10指摘（P0/P1/P2）の解消状況は `docs/design/10_review_findings_status.md` を参照してください。
