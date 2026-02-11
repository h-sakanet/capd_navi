# Migration Audit (2026-02-11)

## 1. 目的
`docs/requirements` / `docs/design` から `docs/spec` への移行残件を、削除判定に使える形式で固定します。

## 2. 実施チェック
1. IDカバレッジ（旧 -> 新）:
   - FR: old=136, spec側に未移行=0
   - AT: old=49, spec側に未移行=0
   - FC: old=7, spec側に未移行=0
   - NFR: old=5, spec側に未移行=0
2. `docs:map`:
   - `nodes=604`, `edges=852`, `issues: none`
3. `docs:map:check`:
   - `issues: none`
4. 旧文書依存の重点確認:
   - `ProtocolPackage` の `effectiveFromLocal` / `source.importMode` / `source.basePath` / `validationReport` は `40_contracts/storage-model.md` と `40_contracts/types.md` に移行済み
   - `SessionService` / `DailyPlanService` / `SyncService` などクライアント公開I/Fは `40_contracts/api.md` に移行済み
   - `FC-SUMMARY-002` / `FC-SUMMARY-003` の詳細は `20_screens/SCR-007-SESSION-RECORD.md` に移行済み

## 3. 現時点の未完了項目
1. `docs/design/ui-preview/*` の削除可否判断（参照資産として残置中）
2. `deletion_gate.md` の基準 4（`test:e2e` Pass）は本監査では未実施
3. 旧文書削除PRの作成と、削除理由の最終レビュー承認

## 4. 削除判定（暫定）
- `docs/requirements` / `docs/design` の本文情報は、主要契約（FR/AT/FC/NFR/型/I/F）レベルでは `docs/spec` へ移行済みです。
- ただし `deletion_gate.md` の全条件を満たした宣言は、上記「未完了項目」解消後に行います。

## 5. 参照
- `./source_mapping.md`
- `./deletion_gate.md`
- `../40_contracts/types.md`
- `../40_contracts/api.md`
- `../40_contracts/storage-model.md`
- `../20_screens/SCR-007-SESSION-RECORD.md`
