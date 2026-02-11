# JRN-005-SYNC

## 1. メタ情報
- JRN ID: JRN-005-SYNC
- 名称: 同期と再試行
- Phase: Phase1
- 主端末: Mac/iPhone
- 版: v1

## 2. 目的 / 非目的
- 目的: push/pull同期と失敗時再試行導線を成立させる。
- 非目的: 欠損復旧（別ジャーニー）。

## 3. スコープ（含む / 含まない）
- 含む: 起動/復帰/完了/手動同期。
- 含まない: full_reseed詳細。

## 4. 事前条件 / 事後条件
- 事前条件: ローカル更新または同期要求あり。
- 事後条件: 成功時 outbox消し込み。

## 5. 主フロー
1. 同期契機で `ACT-001-SYNC` を実行。
2. push成功後pullを実行。
3. 成功なら同期状態更新。

## 6. 例外フロー
- 失敗時は `SCR-SYNC-STATUS-001` で再試行導線を表示。

## 7. 状態遷移
- 参照: `../40_contracts/state-machine.md` Sync状態。

## 8. 参照画面（レビュー順）
1. `../20_screens/SCR-011-SYNC-STATUS.md`
2. `../20_screens/SCR-001-HOME.md`

## 9. 受入条件（GWT）
- Given outbox pendingあり
- When 手動同期を実行
- Then outboxが消し込まれる

## 10. ログ/監査/計測
- trigger、push/pull件数、失敗理由を記録。

## 11. トレーサビリティ
- FR: FR-080, FR-081, FR-082, FR-082A, FR-083, FR-084, FR-085, FR-086, FR-088, FR-089, FR-089A
- AT: AT-SYNC-001〜AT-SYNC-006, AT-API-001, AT-API-004
- CAP: CAP-SYNC-001
- SCR: SCR-SYNC-STATUS-001, SCR-HOME-001
- ACT: ACT-001-SYNC, ACT-011-HOME
