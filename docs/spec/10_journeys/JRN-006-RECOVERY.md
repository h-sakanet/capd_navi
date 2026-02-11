# JRN-006-RECOVERY

## 1. メタ情報
- JRN ID: JRN-006-RECOVERY
- 名称: 復旧（DB消失/クラウド欠損）
- Phase: Phase1
- 主端末: Mac/iPhone
- 版: v1

## 2. 目的 / 非目的
- 目的: ローカル正本を維持して復旧を完了する。
- 非目的: 通常同期の差分反映。

## 3. スコープ（含む / 含まない）
- 含む: restoreFromCloud, full_reseed, 再pull確認。
- 含まない: UI改善（バナー文言以外）。

## 4. 事前条件 / 事後条件
- 事前条件: DB消失または `cloudState=missing`。
- 事後条件: `cloudState=ok` を確認。

## 5. 主フロー
1. DB消失時は `restoreFromCloud`。
2. `missing` 検知時は `syncMode=full_reseed`。
3. 再pullで `ok` を確認して完了。

## 6. 例外フロー
- 再シード失敗時: ローカル不変のまま失敗表示 + 再試行導線。

## 7. 状態遷移
- 参照: `../40_contracts/state-machine.md` Recovery遷移。

## 8. 参照画面（レビュー順）
1. `../20_screens/SCR-011-SYNC-STATUS.md`

## 9. 受入条件（GWT）
- Given ローカル記録ありでクラウド欠損
- When 手動同期を実行
- Then ローカルを失わず再シードされる

## 10. ログ/監査/計測
- missing検知、reseed開始/終了、再pull判定を記録。

## 11. トレーサビリティ
- FR: FR-087, FR-087A, FR-087B, FR-087C, FR-087D, FR-088
- AT: AT-RECOVERY-001, AT-RECOVERY-002, AT-RECOVERY-003
- CAP: CAP-RECOVERY-001
- SCR: SCR-SYNC-STATUS-001
- ACT: ACT-001-SYNC
