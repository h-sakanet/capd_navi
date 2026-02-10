# 02. Macネイティブ層とWeb層の責務境界

## 1. 境界方針
- 提供形態は「Web本体 + Mac薄型ネイティブシェル（WKWebView）」で固定します。
- Web層は業務ロジックと共通UIを担当します。
- Macネイティブ層はOS機能とローカルファイルアクセスを担当します。
- Webはネイティブ機能が無い場合にフォールバック動作を提供します。
- 通知は「タイマー終了通知のみ」を対象とし、`Mac主チャネル固定 + iPhone補助` で運用します。

## 2. 責務マトリクス
| 機能 | Web層 | Macネイティブ層 |
|---|---|---|
| セッション進行 | 主担当 | なし |
| 進行ブロック判定 | 主担当 | なし |
| 記録入力/保存 | 主担当 | なし |
| 遅延同期 | 主担当 | なし |
| タイマー終了時刻計算（dwell/drain） | 主担当 | なし |
| 通知ACK状態管理 | 主担当 | なし |
| iPhone Push購読管理 | 主担当 | なし |
| OS通知許可/通知登録（Mac） | 要求発行 | 実行 |
| Mac再通知（T+2分 / T+5分以降3分） | 要求発行 | 実行 |
| 画面スリープ抑止 | 状態表示 | 実行 |
| CSV+画像ローカル読み取り | UI起点のみ | 実行 |
| 取り込みアップロード | API呼び出し制御 | ファイル提供 |

## 2.1 iPhone PWA運用責務
- Push受信後、通知タップで該当セッション画面へ復帰します。
- 未確認アラートのACK操作を提供します。
- 手技開始通知は提供せず、外部アラーム運用とします。

## 3. JSブリッジI/F（固定）

### 3.1 `requestNotificationPermission`
- 入力: なし
- 出力:
```json
{ "status": "granted" }
```

### 3.2 `scheduleLocalAlarm`
- 入力:
```json
{
  "alarmId": "alarm_001",
  "fireAt": "2026-02-10T20:15:00+09:00",
  "attemptNo": 1,
  "title": "CAPD待機終了",
  "body": "次の手順に進んでください"
}
```
- 出力:
```json
{ "scheduled": true, "upserted": true }
```
- 仕様:
  - `alarmId` を通知リクエストIDとして扱い、同一ID再登録は上書き（重複追加なし）
  - 同一 `alarmId + fireAt + title + body` の再送は冪等に成功を返却
  - `attemptNo` は `1=T0`, `2=T+2分`, `3以降=T+5分以降の3分間隔` の再通知管理に利用

### 3.3 `cancelLocalAlarm`
- 入力: `{ "alarmId": "alarm_001" }`
- 出力: `{ "cancelled": true }`
- 仕様: 対象未登録でも成功（冪等）

### 3.4 `startKeepAwake`
- 入力: `{ "sessionId": "ses_..." }`
- 出力: `{ "state": "active" }`

### 3.5 `stopKeepAwake`
- 入力: `{ "sessionId": "ses_..." }`
- 出力: `{ "state": "inactive" }`

### 3.6 `pickProtocolDirectory`
- 入力: なし
- 出力:
```json
{
  "selected": true,
  "basePath": "protocol_package",
  "csvPath": "protocol_package/protocol.csv",
  "assetPaths": [
    "protocol_package/v3/handwash.png"
  ]
}
```

### 3.7 `uploadProtocolPackage`
- 入力:
```json
{
  "basePath": "protocol_package",
  "csvPath": "protocol_package/protocol.csv",
  "assetPaths": ["protocol_package/v3/handwash.png"]
}
```
- 出力:
```json
{
  "status": "success",
  "errors": [],
  "warnings": []
}
```

### 3.8 `fireDailyNotificationTest`
- 目的: 毎日最初のタイマー運用前に30秒テスト通知を実施
- 入力:
```json
{
  "testId": "daily-test-2026-02-10",
  "fireAfterSec": 30,
  "title": "CAPD通知テスト",
  "body": "通知テストです"
}
```
- 出力:
```json
{
  "scheduled": true
}
```

## 4. フォールバック仕様（ネイティブ未提供時）
- `requestNotificationPermission`: Web Notification APIへフォールバック
- `scheduleLocalAlarm`: Macネイティブ未利用時はWeb通知を試行し、不可ならアプリ内強調のみ（iPhoneはPush補助のみ）
- `startKeepAwake`: Screen Wake Lock APIを試行、不可なら注意表示
- `pickProtocolDirectory` / `uploadProtocolPackage`: iPhoneでは無効化し「Macのみ対応」表示

## 5. エラーハンドリング
- ブリッジ呼び出しはすべて `{ code, message }` を返す
- 失敗時もセッション継続可能な範囲でUIを継続
- 致命エラー（CSV必須ファイル欠落など）は処理中断 + 再試行導線

## 6. 実装メモ（Swift側）
- `WKScriptMessageHandler` でメッセージ受信
- `UNUserNotificationCenter` で通知権限/通知登録
- IOPM assertion で display idle sleep 抑止
- セキュリティ上、許可するメソッドを固定し任意実行を禁止
