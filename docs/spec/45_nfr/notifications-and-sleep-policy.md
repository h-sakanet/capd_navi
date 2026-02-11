# Notifications And Sleep Policy

## 1. 目的
貯留/廃液終了の見逃し低減と、ACKまでの追従通知を保証します。

## 2. 通知ポリシー
- 対象は `timer_event=end` かつ `timer_segment=dwell/drain` のみ。
- `T0`: Mac通知 + アプリ内強調
- `T+2`: iPhone補助1回 + Mac再通知
- `T+5以降`: 3分間隔再通知
- `T+30`: `missed` 永続化（ACKまで再通知継続）

## 3. ACKポリシー
- ACK時は通知停止と `acked_at` 記録を同時実行します。

## 4. スリープ抑止
- Mac: ネイティブ制御で抑止
- iPhone: Wake Lock試行。未対応/失敗時はガイダンス表示

## 5. 参照リンク
- `../30_capabilities/CAP-ALARM-001.md`
- `../20_screens/SCR-006-SESSION.md`
- `./non-functional.md`
