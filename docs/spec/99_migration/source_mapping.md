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

## 3. 文書マッピング（方針）
1. `docs/requirements/09_user_journeys.md` -> `docs/spec/10_journeys/journeys.md` + `docs/spec/10_journeys/JRN-*.md`
2. `docs/requirements/10_screen_transition_and_actions.md` -> `docs/spec/20_screens/SCR-*.md`
3. `docs/requirements/11_form_contracts.md` -> `docs/spec/20_screens/SCR-*.md`（画面別）+ `docs/spec/40_contracts/*`（横断）
4. `docs/requirements/12_ui_data_binding_matrix.md` -> `docs/spec/20_screens/SCR-*.md` + `docs/spec/30_capabilities/CAP-*.md`
5. `docs/requirements/06_ui_wireframes_ab.md` -> `docs/spec/20_screens/SCR-*.md`
6. `docs/design/03_protocol_csv_v3_spec.md`, `docs/design/04_domain_model_and_interfaces.md`, `docs/design/02_mac_shell_web_boundary.md` -> `docs/spec/30_capabilities/CAP-CSV-IMPORT-001.md`, `docs/spec/20_screens/SCR-012-MAC-IMPORT.md`
7. 同期/復旧/通知/写真関連設計文書 -> `docs/spec/30_capabilities/CAP-*.md` + `docs/spec/40_contracts/*`
8. `docs/requirements/07_acceptance_tests.md` + `test/specs/*` -> `docs/spec/50_quality/*`（レビュービュー） + `test/specs/*`（実行正本）

## 4. 移行時の注意
- 旧文書は削除完了まで正本扱いを継続します。
- 実装担当は移行完了宣言まで旧文書参照を許容します。
