# 02. 運用フロー

> 移行メモ（2026-02-11）: 本文の正本は `docs/spec/10_journeys/journeys.md` / `docs/spec/20_screens/SCR-001-HOME.md` / `docs/spec/20_screens/SCR-006-SESSION.md` / `docs/spec/30_capabilities/CAP-SYNC-001.md` / `docs/spec/30_capabilities/CAP-RECOVERY-001.md` / `docs/spec/30_capabilities/CAP-ALARM-001.md` / `docs/spec/30_capabilities/CAP-PHOTO-BACKUP-001.md` / `docs/spec/40_contracts/state-machine.md` / `docs/spec/40_contracts/storage-model.md` へ再構成済みです。  
> 本書は旧体系参照用として残置し、更新は `docs/spec` 側を優先します。


## 1. 日次運用の基本
- 主端末は Mac ネイティブシェル（WKWebView）を利用します。
- iPhone は代替端末として、手技確認・記録・履歴閲覧に利用します。
- 同一端末内の同時実行セッションは1件のみとします。
- 手技開始通知は本アプリ対象外とし、外部アラーム（時計アプリ等）で運用します。
- 記録一覧はホームに表示せず、専用の「記録一覧」画面で確認・編集します。
- ホームの4スロットは、左から右へ推奨実施時間が厳密昇順になるように登録します。
- 右側スロットは、左側スロットがすべて実施済みになるまで開始できません。
- `実施中` スロットはタップで再開し、新規セッション開始は行いません。
- 30秒テスト通知は、通知設定変更時・OS更新後・通知不調時に手動実施します。
- 手動30秒テストが失敗した日は iPhone補助を無効扱いとし、Mac主導運用へ切替します。

## 2. セッション実行フロー
1. ホームで当日スロットを参照し、対象スロットからセッション開始
2. ローカル（IndexedDB）で `session` と `session_protocol_snapshot` を同一トランザクション保存
3. ステップ表示（フェーズ/状態を常時表示）
4. スリープ抑止を試行し状態表示（Mac: ネイティブ、iPhone: ベストエフォート）
5. 必須チェック完了まで遷移不可
6. `record_event` 完了まで遷移不可
7. ステップ到達時に `timer_event` をローカル記録
8. `timer_event=end` かつ `timer_segment=dwell/drain` の到達時、通知ジョブを生成
9. 終了時刻 `T0` でMac通知（音+バナー）を発火し、アプリ内未確認アラートを固定表示
10. 未確認時は `T+2分` で iPhone補助通知 + Mac再通知、`T+5分以降` は3分間隔でMac+iPhone再通知
11. ACK時に通知ジョブを停止し `acked_at` を記録
12. `next_step_id` に従って次ステップへ遷移
13. 最終ステップでセッション完了（ローカル反映 + outbox追記）
14. 完了契機で同期（push/pull）を実行
15. 同期後に別端末へ反映され、閲覧可能になる

## 2.1 ホームスロット管理フロー
1. ローカルから当日4スロットを取得（未作成日は空スロットで初期化）
2. `+` からスロット登録/更新（ローカル保存 + outbox追記）
3. 削除時は tombstone として outbox へ追記
4. `completed` スロットは編集不可
5. 同一端末で active セッションが存在する間はスロット編集不可

## 2.2 離脱/再開/中断
- 予期せぬ離脱（アプリ終了、端末クラッシュ、通信断）時はセッションを `active` のまま保持します。
- 再起動後はホームで `実施中` スロットを選択し、対応 `activeSessionId` をローカルから復元して再開します。
- セッション画面の `•••` から `セッションを中断（非常用）` を実行した場合のみ `aborted` へ遷移します。
- `aborted` 実行後はホームへ戻し、該当スロット表示は `未実施` へ戻します（同一スロットで再開始可能）。

## 2.3 スナップショット運用
- スナップショット固定範囲は、開始時点の実行必要情報全体です（step定義本文、必須チェック、timer/alarm/record指示、画像 `assetKey`、`assetManifest`）。
- スナップショット保存失敗時はロールバックし、セッションを開始しません。
- セッション表示/再開は開始時スナップショットのみを参照し、テンプレート現行版への差し替えを行いません。
- スナップショット欠落またはハッシュ不整合を検出した場合は表示再開を停止します。

## 3. 同期フロー
- 同期対象は「日次スロット計画」「完了済みセッション」「履歴編集結果」「テンプレート更新」「写真参照」です。
- 同期トリガーは起動時・復帰時・セッション完了時・手動同期です。
- 同期APIは `POST /sync/push` と `POST /sync/pull` を使用します。
- 同期データは非暗号化JSON/画像として Blobs へ保存します（HTTPS通信前提）。
- すべてのローカル更新は outbox に積み、push成功時に消し込みます。
- `POST /sync/pull` が `cloudState=missing` を返した場合はクラウド欠損として扱います。
- クラウド欠損時はローカル全量（day bundle / photo ref / tombstone）を `syncMode=full_reseed` で再シードします。
- 再シード後に再度 `POST /sync/pull` を実行し、`cloudState=ok` を確認できるまで同期完了にしません。
- `session_summary.payload.exit_site_photo` の更新は `patch_path=payload.exit_site_photo` の部分パッチとして送信し、同一record内の他サマリ項目を上書きしません。
- 競合はエンティティ単位LWWで内部的に自動解決します（競合件数表示や詳細表示は行いません）。

## 4. 同期状態運用
1. 同期成功時は `lastSyncedAt` と `lastSyncStatus=success` を更新
2. 同期失敗時は `lastSyncStatus=failed` と `lastError` を更新
3. UIは直近同期状態のみ表示し、履歴メトリクスは保持しない

## 5. CSV取り込みフロー（Macのみ）
1. Macネイティブで取り込み対象ディレクトリを選択
2. `protocol.csv` と画像群を検証
3. 正規化JSONをローカルへ保存し、同期対象として outbox へ追記
4. 同期時にクラウドへ共有反映

## 6. 記録運用
- `drain_appearance`: 見た目分類 + 任意メモ + 任意写真
- `drain_weight_g`: 廃液重量（g）
- `bag_weight_g`: 透析液重量（g）
- `session_summary`: 最初完了セッションで血圧上/下、体重、脈拍、体温、出口部状態（複数選択）を必須化
- `session_summary`: 最後完了セッションで飲水量、尿量、排便回数を必須化
- `session_summary`: 1日1回運用時は `summaryScope=both` で最初/最後の必須項目を同時入力
- `session_summary`: 症状メモ、備考は任意
- `exit_site_photo`: `session_summary.payload.exit_site_photo` に保存する任意の記録写真（1枚固定、変更/削除可）

## 6.1 出口部写真登録フロー
1. Macで当日 `first_of_day`（1日1回運用時は `both`）の `session_summary` 入力を完了する
2. 対象レコードは `summaryScope=both` を最優先し、次に `summaryScope=first_of_day` を採用する。同値時は `completedAt` 昇順、さらに同値時は `recordId` 昇順で決定する
3. iPhoneホームの当日全体サマリ、または iPhone記録詳細（対象 `session_summary`）に `出口部写真` 操作を表示する
4. 未登録時は `登録`、登録済み時は `変更` / `削除` を表示する
5. 入力手段は iPhone の `カメラ撮影` と `ファイル選択` の両方を許可する
6. 保存時は `record` への `operation=patch`（`patch_path=payload.exit_site_photo`）として outbox に追記する
7. 削除時は `exit_site_photo=null` を保存し、対象画像は tombstone 化する
8. Macは閲覧のみを許可し、登録/変更/削除は許可しない

## 7. 通知/アラーム運用
- 通知対象は `timer_event=end` のうち `timer_segment=dwell/drain` のみです。
- Macを主チャネルとし、終了時刻 `T0` でOSローカル通知を発火します。
- 未確認時は `T+2分` で iPhone補助通知（1回） + Mac再通知、`T+5分以降` は3分間隔でMac+iPhoneを再通知します。
- iPhoneはPWA Push購読が有効な場合のみ補助通知を受信します。
- 通知未許可/未対応時でも、アプリ内強調アラームをACKまで継続表示します。
- ACK時に通知ジョブを停止し `acked_at` を保存します。

## 8. バックアップ運用
- 日次バックアップ: 毎日1回、Blobsスナップショットとメタ情報を保存（保持30日）

## 9. 異常判定運用（v1）
- 見た目分類ベースの簡易判定のみ
- 異常分類時は警告表示のみ
- 連絡導線はv1対象外
