# 05. 通知・アラーム / 画面スリープ抑止設計

## 1. 目的
貯留/廃液の終了見逃しを減らし、ACKまで確実に追従する通知運用を実現します。

## 2. 通知方針
- 通知対象は `timer_event=end` かつ `timer_segment=dwell/drain` の終了イベントのみ
- 手技開始通知は本アプリ対象外（外部アラーム運用）
- 通知チャネルは `Mac主チャネル固定 + iPhone補助`
- 通知ジョブは `alarm_id / segment / due_at / acked_at / attempt_no / status` で管理
- 段階通知:
  - `T0`: Macローカル通知（音+バナー） + アプリ内未確認アラート固定表示
  - `T+2分` 未ACK: iPhone Pushを1回送信 + Mac再通知
  - `T+5分以降` 未ACK: 3分間隔でMac+iPhoneを再通知
  - `T+30分` 未ACK: `missed` として見逃し状態を表示し、次回表示時も警告継続
- ACK時は再通知ジョブを停止し `acked_at` を記録

## 3. Mac実装
- 権限: `UNUserNotificationCenter` で許可確認
- 通知登録: `scheduleLocalAlarm(alarmId, fireAt, attemptNo, title, body)`
- 通知取消: `cancelLocalAlarm(alarmId)`
- 毎日テスト: `fireDailyNotificationTest(testId, fireAfterSec=30, title, body)`
- `UNNotificationRequest.identifier` は `alarmId` を使用し、同一ID再登録時は上書き

## 4. iPhone実装
- PWA Push購読を管理し、補助通知のみ担当
- Push受信時は通知タップで該当セッションへ復帰
- ACK操作はWeb UIで実施し、`POST /sessions/{id}/alarms/{alarmId}/ack` を呼び出し
- Push未許可/未対応時でもアプリ内未確認アラート表示は維持

## 5. 毎日30秒テスト運用
- 当日最初のタイマー運用前にテスト通知を1回実施
- 失敗時は当日を「iPhone補助なし」として扱い、Mac主導運用へ切替

## 6. スリープ抑止

### 6.1 Mac
- セッション開始時: `startKeepAwake(sessionId)`
- セッション終了時: `stopKeepAwake(sessionId)`
- 実装: IOPM assertion（display idle sleep抑止）

### 6.2 iPhone
- Screen Wake Lock API を試行
- 未対応/失敗時は状態を `unsupported` / `failed` で表示
- ユーザーへ手動対処（自動ロック時間延長など）を案内

## 7. UI状態定義
- `active`: 抑止有効
- `inactive`: 抑止停止
- `unsupported`: 端末未対応
- `failed`: 試行失敗
- `missed`: `T+30分` 未ACKの見逃し状態

## 8. 監視項目
- 通知許可率（Mac/iPhone）
- 通知送信成功率（T0/T+2/T+5以降）
- アラーム確認遅延時間
- 見逃し件数（`status=missed`）
- 毎日30秒テスト成功率
- スリープ抑止失敗率
