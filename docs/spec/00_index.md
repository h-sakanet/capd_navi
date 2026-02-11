# 00. Spec Index

## 1. この仕様の読み方（レビューフロー）
1. `10_journeys/journeys.md` で対象ジャーニーを特定します。
2. 対象ジャーニーから `20_screens/SCR-*.md` を順に確認します。
3. 画面で決まらない仕様は `30_capabilities/CAP-*.md` を確認します。
4. 型・状態・APIは `40_contracts/*` を確認します。
5. 受入観点は `50_quality/*` と `test/specs/*` を確認します。

## 2. 一次仕様の所在（唯一の正）
- Journey一次仕様: `10_journeys/*.md`
- 画面一次仕様: `20_screens/SCR-*.md`
- 横断機能一次仕様: `30_capabilities/CAP-*.md`
- 契約一次仕様: `40_contracts/*`

## 3. ジャーニーへのリンク
- `10_journeys/journeys.md`

## 4. 画面一覧へのリンク
- `20_screens/screens_index.md`

## 5. 横断定義へのリンク
- `35_interfaces/interfaces_index.md`
- `30_capabilities/capabilities_index.md`
- `40_contracts/types.md`
- `40_contracts/architecture-overview.md`
- `40_contracts/sync-conflict-policy.md`
- `40_contracts/storage-model.md`
- `40_contracts/state-machine.md`
- `40_contracts/api.md`
- `40_contracts/events.md`
- `40_contracts/error-codes.md`
- `40_contracts/functional-requirements.md`

## 6. 非機能仕様へのリンク
- `45_nfr/non-functional.md`
- `45_nfr/observability.md`
- `45_nfr/risks-and-constraints.md`
- `45_nfr/notifications-and-sleep-policy.md`
- `45_nfr/photo-backup-policy.md`

## 7. 品質仕様へのリンク
- `50_quality/acceptance_policy.md`
- `50_quality/traceability.md`
- `50_quality/test-link-index.md`

## 8. テンプレートと移行管理
- `60_templates/TEMPLATE_journey.md`
- `60_templates/TEMPLATE_screen.md`
- `60_templates/TEMPLATE_capability.md`
- `60_templates/TEMPLATE_contract.md`
- `90_decisions/ADR-001-stack-decision.md`
- `90_decisions/ADR-002-review-findings-2026-02-10.md`
- `90_decisions/ADR-003-implementation-handoff.md`
- `99_migration/source_mapping.md`
- `99_migration/deletion_gate.md`

## 9. 変更履歴（重要変更のみ）
- 2026-02-11: `docs/spec` 新設。仕様を画面主導 + 横断機能分離へ再編開始。
- 2026-02-11: Journey ID を `JRN-xxx-001` 形式へ移行開始。
