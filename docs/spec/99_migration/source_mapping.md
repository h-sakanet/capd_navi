# Source Mapping

## 1. 目的
旧体系（`docs/requirements`, `docs/design`, `test/specs`）から新体系（`docs/spec`）への移行先を固定します。

## 2. Journey ID 旧→新
| 旧ID | 新ID |
|---|---|
| JRN-001 | JRN-001-CSV |
| JRN-002 | JRN-002-SLOT |
| JRN-003 | JRN-003-SESSION |
| JRN-004 | JRN-004-ABORT |
| JRN-005 | JRN-005-SYNC |
| JRN-006 | JRN-006-RECOVERY |
| JRN-007 | JRN-007-ALARM |
| JRN-008 | JRN-008-HISTORY |
| JRN-009 | JRN-009-EXITPHOTO |

## 3. `docs/requirements` 移行先（全件）
| 旧文書 | 新体系の一次参照先 | 備考 |
|---|---|---|
| `docs/requirements/01_scope_and_success.md` | `docs/spec/01_governance.md`, `docs/spec/10_journeys/journeys.md`, `docs/spec/45_nfr/non-functional.md`, `docs/spec/50_quality/acceptance_policy.md`, `docs/spec/30_capabilities/CAP-PLATFORM-001.md` | スコープ・成功条件・体制 |
| `docs/requirements/02_operational_flow.md` | `docs/spec/10_journeys/journeys.md`, `docs/spec/20_screens/SCR-001-HOME.md`, `docs/spec/20_screens/SCR-006-SESSION.md`, `docs/spec/30_capabilities/CAP-SYNC-001.md`, `docs/spec/30_capabilities/CAP-RECOVERY-001.md`, `docs/spec/30_capabilities/CAP-ALARM-001.md`, `docs/spec/30_capabilities/CAP-PHOTO-BACKUP-001.md`, `docs/spec/40_contracts/state-machine.md`, `docs/spec/40_contracts/storage-model.md` | 運用フロー統合先 |
| `docs/requirements/03_protocol_csv_v3_spec.md` | `docs/spec/35_interfaces/IF-001-PROTOCOL-CSV.md`, `docs/spec/30_capabilities/CAP-CSV-IMPORT-001.md`, `docs/spec/20_screens/SCR-012-MAC-IMPORT.md` | protocol.csv I/F正本 |
| `docs/requirements/04_domain_model_and_interfaces.md` | `docs/spec/40_contracts/storage-model.md`, `docs/spec/40_contracts/types.md`, `docs/spec/40_contracts/api.md`, `docs/spec/40_contracts/events.md`, `docs/spec/40_contracts/state-machine.md` | データモデル・契約 |
| `docs/requirements/05_functional_requirements.md` | `docs/spec/40_contracts/functional-requirements.md`, `docs/spec/20_screens/SCR-*.md`, `docs/spec/30_capabilities/CAP-*.md` | 旧FR台帳 + ローカルFRへ再配分 |
| `docs/requirements/06_ui_wireframes_ab.md` | `docs/spec/20_screens/SCR-*.md` | ワイヤーは画面定義へ内包 |
| `docs/requirements/07_acceptance_tests.md` | `docs/spec/50_quality/acceptance_policy.md`, `docs/spec/50_quality/test-link-index.md`, `docs/spec/50_quality/traceability.md`, `test/specs/*` | レビュー用はspec、実行正本はtest/specs |
| `docs/requirements/08_risks_and_constraints.md` | `docs/spec/45_nfr/risks-and-constraints.md`, `docs/spec/45_nfr/non-functional.md`, `docs/spec/45_nfr/observability.md` | リスクと制約 |
| `docs/requirements/09_user_journeys.md` | `docs/spec/10_journeys/journeys.md`, `docs/spec/10_journeys/JRN-*.md` | Journey総覧 + 個票 |
| `docs/requirements/10_screen_transition_and_actions.md` | `docs/spec/20_screens/screens_index.md`, `docs/spec/20_screens/SCR-*.md` | 画面遷移・ACT契約 |
| `docs/requirements/11_form_contracts.md` | `docs/spec/20_screens/SCR-*.md`, `docs/spec/40_contracts/*` | フォーム契約 |
| `docs/requirements/12_ui_data_binding_matrix.md` | `docs/spec/20_screens/SCR-*.md`, `docs/spec/30_capabilities/CAP-*.md`, `docs/spec/40_contracts/storage-model.md` | バインディング・保存境界 |
| `docs/requirements/README.md` | `docs/spec/00_index.md`, `docs/spec/01_governance.md`, `docs/spec/99_migration/source_mapping.md` | 入口案内 |

## 4. `docs/design` 移行先（全件）
| 旧文書 | 新体系の一次参照先 | 備考 |
|---|---|---|
| `docs/design/01_architecture_overview.md` | `docs/spec/40_contracts/architecture-overview.md`, `docs/spec/40_contracts/storage-model.md`, `docs/spec/40_contracts/api.md` | アーキテクチャ概要 |
| `docs/design/02_mac_shell_web_boundary.md` | `docs/spec/35_interfaces/IF-001-PROTOCOL-CSV.md`, `docs/spec/30_capabilities/CAP-CSV-IMPORT-001.md`, `docs/spec/20_screens/SCR-012-MAC-IMPORT.md` | Mac取込境界 |
| `docs/design/03_stack_decision.md` | `docs/spec/90_decisions/ADR-001-stack-decision.md`, `docs/spec/30_capabilities/CAP-PLATFORM-001.md` | 技術選定の意思決定 |
| `docs/design/04_sync_conflict_policy.md` | `docs/spec/40_contracts/sync-conflict-policy.md`, `docs/spec/30_capabilities/CAP-SYNC-001.md`, `docs/spec/30_capabilities/CAP-RECOVERY-001.md` | 同期競合方針 |
| `docs/design/05_notifications_sleep.md` | `docs/spec/45_nfr/notifications-and-sleep-policy.md`, `docs/spec/30_capabilities/CAP-ALARM-001.md`, `docs/spec/20_screens/SCR-006-SESSION.md` | 通知・スリープ方針 |
| `docs/design/06_photo_backup_export.md` | `docs/spec/45_nfr/photo-backup-policy.md`, `docs/spec/30_capabilities/CAP-PHOTO-BACKUP-001.md`, `docs/spec/40_contracts/storage-model.md` | 写真バックアップ |
| `docs/design/07_ui_spike_plan.md` | `docs/spec/20_screens/screens_index.md`, `docs/spec/20_screens/SCR-001-HOME.md`, `docs/spec/20_screens/SCR-006-SESSION.md`, `docs/spec/20_screens/SCR-008-HISTORY.md` | UIスパイク反映先 |
| `docs/design/08_ui_standard.md` | `docs/spec/20_screens/screens_index.md`, `docs/spec/45_nfr/non-functional.md`, `docs/spec/20_screens/SCR-001-HOME.md`, `docs/spec/20_screens/SCR-006-SESSION.md` | UI標準 |
| `docs/design/10_review_findings_status.md` | `docs/spec/90_decisions/ADR-002-review-findings-2026-02-10.md`, `docs/spec/50_quality/traceability.md` | レビュー指摘履歴 |
| `docs/design/11_state_machines.md` | `docs/spec/40_contracts/state-machine.md` | 状態機械正本 |
| `docs/design/99_impl_handoff.md` | `docs/spec/90_decisions/ADR-003-implementation-handoff.md`, `docs/spec/00_index.md` | 実装引き継ぎ判断 |
| `docs/design/README.md` | `docs/spec/00_index.md`, `docs/spec/99_migration/source_mapping.md` | 入口案内 |

## 5. `docs/design/ui-preview` の扱い
- `docs/design/ui-preview/README.md`
- `docs/design/ui-preview/history-list.html`
- `docs/design/ui-preview/home.html`
- `docs/design/ui-preview/index.html`
- `docs/design/ui-preview/session.html`
- `docs/design/ui-preview/style.css`
- `docs/design/ui-preview/ui-preview/history-list/index.html`
- `docs/design/ui-preview/ui-preview/home/index.html`
- `docs/design/ui-preview/ui-preview/session/index.html`

上記は UI スパイク成果物です。一次仕様は `docs/spec/20_screens/SCR-*.md` へ吸収済みのため、削除時は `docs/spec/90_decisions/ADR-002-review-findings-2026-02-10.md` に「廃止理由」を記録したうえで一括削除します。

## 6. 移行時の注意
- 旧文書は削除完了まで正本扱いを継続します。
- 実装担当は移行完了宣言まで旧文書参照を許容します。
