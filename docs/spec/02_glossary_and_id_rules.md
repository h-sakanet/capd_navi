# 02. Glossary And ID Rules

## 1. 用語集（抜粋）
- Journey: ユーザーが価値を得るための業務フロー単位。
- Screen: UI画面またはモーダル単位。
- Capability: 画面をまたぐ横断機能単位。
- Contract: 型・状態・API・イベントなどの固定契約。

## 2. ID規則
- Journey（新）: `JRN-\d{3}-[A-Z0-9]+(?:-[A-Z0-9]+)*`
- Journey（移行互換）: `JRN-[A-Z0-9]+(?:-[A-Z0-9]+)*-\d{3}`
- Screen: `SCR-[A-Z0-9-]+-\d{3}`
- Action（新）: `ACT-\d{3}-[A-Z0-9-]+`
- Action（移行互換）: `ACT-[A-Z0-9-]+-\d{3}`
- UI（新）: `UI-\d{3}-[A-Z0-9-]+`
- UI（移行互換）: `UI-[A-Z0-9-]+-\d{3}`
- Form Contract: `FC-[A-Z0-9-]+-\d{3}`
- Capability: `CAP-[A-Z0-9-]+-\d{3}`
- Requirement: `FR-\d{3}[A-Z]?`
- Acceptance: `AT-[A-Z0-9-]+-\d{3}`
- Test: `UT-*`, `E2E-*`, `VR-*`

## 3. Journey IDマッピング（参照）
- 旧体系から新体系への確定マッピングは `99_migration/source_mapping.md` を参照します。

## 4. 禁止事項
- 旧 `JRN-\d{3}` 形式の新規利用を禁止します。
- 連番のみで意味が読めない新ID追加を禁止します。
- Actionの新規採番で `ACT-[NAME]-[NUMBER]` 形式を使うことを禁止します。
- UIの新規採番で `UI-[NAME]-[NUMBER]` 形式を使うことを禁止します。
