# Traceability Matrix

## 1. 目的
要件（`FR-*`）・受入（`AT-*`）・テスト仕様（`UT-*` / `E2E-*` / `VR-*`）の対応関係を固定します。  
本表は「1行1ケース（1テストID）」で更新し、未実装は `状態=Deferred` で明示します。

## 2. 対応表

### 2.1 Unit
| 要件ID | 受入ID | テストID | 対象 | 状態 | 備考 |
|---|---|---|---|---|---|
| FR-021 | AT-CSV-001 | UT-CSV-001 | `protocol-csv.ts` | Implemented | `capd-app/tests/unit/protocol-csv.test.ts` |
| FR-022 | - | UT-CSV-002 | `protocol-csv.ts` | Implemented | `capd-app/tests/unit/protocol-csv.test.ts` |
| FR-021 | - | UT-CSV-003 | `protocol-csv.ts` | Planned | 固定ヘッダー不一致検証 |
| FR-021 | - | UT-CSV-004 | `protocol-csv.ts` | Implemented | `capd-app/tests/unit/protocol-csv.test.ts` |
| FR-022 | - | UT-CSV-005 | `protocol-csv.ts` | Planned | `step_id` 重複検証 |
| FR-022 | - | UT-CSV-006 | `protocol-csv.ts` | Implemented | `capd-app/tests/unit/protocol-csv.test.ts` |
| FR-023 | AT-CSV-005 | UT-CSV-007 | `protocol-csv.ts` | Planned | 警告系入力（改行分割） |
| FR-021 | - | UT-CSV-008 | `csv-import.ts` | Implemented | `capd-app/tests/unit/csv-import.test.ts` |
| FR-021 | - | UT-CSV-009 | `protocol-csv.ts` | Planned | `alarm_duration_min` 空欄 |
| FR-021 | - | UT-CSV-010 | `protocol-csv.ts` | Planned | `alarm_duration_min` 非数値 |
| FR-022 | - | UT-CSV-011 | `csv-import.ts` | Implemented | `capd-app/tests/unit/csv-import.test.ts` |
| FR-021 | - | UT-CSV-012 | `protocol-csv.ts` | Implemented | `必須チェック数` 列欠落時のヘッダー不一致 |
| FR-024 | - | UT-CSV-013 | `csv-import.ts` | Implemented | `capd-app/tests/unit/csv-import.test.ts`（直下ファイル抽出） |
| FR-024 | - | UT-CSV-014 | `csv-import.ts` | Implemented | `capd-app/tests/unit/csv-import.test.ts`（不足画像分類） |
| FR-024 | - | UT-CSV-015 | `csv-import.ts` | Implemented | `capd-app/tests/unit/csv-import.test.ts`（一致画像抽出） |
| FR-102 | - | UT-DB-001 | `capd-db.ts` | Implemented | `capd-app/tests/unit/capd-db.test.ts` |
| SCR-013-STORAGE-ADMIN-FR-01 | AT-DEV-STORAGE-001 | UT-STORAGE-001 | `storage-admin.ts` | Implemented | `capd-app/tests/unit/storage-admin.test.ts` |
| SCR-013-STORAGE-ADMIN-FR-02 | AT-DEV-STORAGE-001 | UT-STORAGE-002 | `storage-admin.ts` | Implemented | `capd-app/tests/unit/storage-admin.test.ts` |
| SCR-013-STORAGE-ADMIN-FR-01 | AT-DEV-STORAGE-001 | UT-STORAGE-003 | `storage-admin.ts` | Implemented | `capd-app/tests/unit/storage-admin.test.ts` |
| SCR-013-STORAGE-ADMIN-FR-05 | AT-DEV-STORAGE-002 | UT-STORAGE-004 | `storage-admin.ts` | Implemented | `capd-app/tests/unit/storage-admin.test.ts` |
| SCR-013-STORAGE-ADMIN-FR-07 | AT-DEV-STORAGE-003 | UT-STORAGE-005 | `storage-admin.ts` | Implemented | `capd-app/tests/unit/storage-admin.test.ts` |
| FR-071 | - | UT-SESSION-001 | `session-service.ts` | Implemented | `capd-app/tests/unit/session-service.test.ts` |
| FR-071, FR-072 | - | UT-SESSION-002 | `session-service.ts` | Implemented | `capd-app/tests/unit/session-service.test.ts` |
| FR-072 | - | UT-SESSION-003 | `session-service.ts` | Implemented | `capd-app/tests/unit/session-service.test.ts`（画像Blob解決） |
| FR-050A, FR-056 | - | UT-TIMER-001 | `session-service.ts` | Implemented | `capd-app/tests/unit/session-service.test.ts` |
| FR-056 | - | UT-TIMER-002 | `session-service.ts` | Implemented | `capd-app/tests/unit/session-service.test.ts` |
| FR-050, FR-051 | - | UT-ALARM-001 | `session-service.ts` | Implemented | `capd-app/tests/unit/session-service.test.ts` |
| FR-050D, FR-056 | - | UT-ALARM-002 | `session-service.ts` | Implemented | `capd-app/tests/unit/session-service.test.ts` |
| FR-012, FR-013 | - | UT-HOME-001 | `home-note-query.ts` | Implemented | `capd-app/tests/unit/home-note-query.test.ts` |
| FR-012, FR-013 | - | UT-HOME-002 | `home-note-query.ts` | Implemented | `capd-app/tests/unit/home-note-query.test.ts` |
| FR-009E | - | UT-SLOT-001 | `session-slot-store.ts` | Implemented | `capd-app/tests/unit/session-slot-store.test.ts` |
| FR-009E | - | UT-SLOT-002 | `session-slot-store.ts` | Implemented | `capd-app/tests/unit/session-slot-store.test.ts` |
| FR-009E | - | UT-SLOT-003 | `session-slot-store.ts` | Implemented | `capd-app/tests/unit/session-slot-store.test.ts` |
| FR-009E | - | UT-SLOT-004 | `session-slot-store.ts` | Implemented | `capd-app/tests/unit/session-slot-store.test.ts` |
| FR-009E | - | UT-SLOT-005 | `session-slot-store.ts` | Implemented | `capd-app/tests/unit/session-slot-store.test.ts` |
| FR-009G | - | UT-SLOT-006 | `session-slot-store.ts` | Implemented | `capd-app/tests/unit/session-slot-store.test.ts` |
| FR-009G | - | UT-SLOT-007 | `session-slot-store.ts` | Implemented | `capd-app/tests/unit/session-slot-store.test.ts` |
| FR-009G | - | UT-SLOT-008 | `session-slot-store.ts` | Implemented | `capd-app/tests/unit/session-slot-store.test.ts` |
| FR-039F | - | UT-SLOT-009 | `session-slot-store.ts` | Implemented | `capd-app/tests/unit/session-slot-store.test.ts` |
| FR-009G | - | UT-SLOT-010 | `session-slot-store.ts` | Implemented | `capd-app/tests/unit/session-slot-store.test.ts` |
| FR-009E | - | UT-SLOT-011 | `session-slot-store.ts` | Implemented | `capd-app/tests/unit/session-slot-store.test.ts` |
| FR-009E | - | UT-SLOT-012 | `session-slot-store.ts` | Implemented | `capd-app/tests/unit/session-slot-store.test.ts` |
| FR-015A | - | UT-UF-001 | `capd-note-model.ts` | Implemented | `capd-app/tests/unit/capd-note-model.test.ts` |
| FR-015 | - | UT-UF-002 | `capd-note-model.ts` | Implemented | `capd-app/tests/unit/capd-note-model.test.ts` |
| FR-015 | - | UT-UF-003 | `capd-note-model.ts` | Implemented | `capd-app/tests/unit/capd-note-model.test.ts` |
| FR-015B | - | UT-UF-004 | `capd-note-model.ts` | Implemented | `capd-app/tests/unit/capd-note-model.test.ts` |
| FR-013 | - | UT-UF-005 | `capd-note-model.ts` | Implemented | `capd-app/tests/unit/capd-note-model.test.ts` |
| FR-013 | - | UT-UF-006 | `capd-note-model.ts` | Implemented | `capd-app/tests/unit/capd-note-model.test.ts` |
| FR-014 | - | UT-UF-007 | `capd-note-model.ts` | Implemented | `capd-app/tests/unit/capd-note-model.test.ts` |
| FR-014 | - | UT-UF-008 | `capd-note-model.ts` | Implemented | `capd-app/tests/unit/capd-note-model.test.ts` |

### 2.2 E2E / Acceptance
| 要件ID | 受入ID | テストID | 対象 | 状態 | 備考 |
|---|---|---|---|---|---|
| FR-020, FR-021 | AT-CSV-001 | E2E-CSV-001 | CSV取込 | Implemented | `capd-app/tests/e2e/csv-import.spec.ts`（`protocol_packages` 保存確認） |
| FR-022 | AT-CSV-002 | E2E-CSV-002 | CSV取込 | Implemented | `capd-app/tests/e2e/csv-import.spec.ts` |
| FR-022 | AT-CSV-003 | E2E-CSV-003 | CSV取込 | Implemented | `capd-app/tests/e2e/csv-import.spec.ts` |
| FR-022, FR-024 | AT-CSV-004 | E2E-CSV-004 | CSV取込 | Implemented | `capd-app/tests/e2e/csv-import.spec.ts`（不足警告 + 保存disabled） |
| FR-024 | AT-CSV-004 | E2E-CSV-006 | CSV取込 | Implemented | `capd-app/tests/e2e/csv-import.spec.ts`（フォルダ再選択で解消） |
| FR-023 | AT-CSV-005 | E2E-CSV-005 | CSV取込 | Deferred | Phase2（警告強化） |
| FR-008, FR-009B | AT-UI-HOME-002 | E2E-HOME-001 | Home | Implemented | `capd-app/tests/e2e/home-empty-state.spec.ts` |
| FR-009D | AT-FLOW-005 | E2E-FLOW-001 | Home | Implemented | `capd-app/tests/e2e/flow-left-priority.spec.ts` |
| FR-036, FR-009F | AT-FLOW-004 | E2E-FLOW-002 | Home | Implemented | `capd-app/tests/e2e/flow-active-session-lock.spec.ts` |
| FR-009G, FR-073 | AT-FLOW-006 | E2E-FLOW-003 | Home / Session | Implemented | `capd-app/tests/e2e/flow-resume-session.spec.ts`（snapshot再開） |
| FR-039D, FR-039E, FR-039F | AT-FLOW-007 | E2E-FLOW-004 | Session | Implemented | `capd-app/tests/e2e/flow-emergency-abort.spec.ts` |
| FR-031 | AT-FLOW-001 | E2E-FLOW-005 | Session | Implemented | `capd-app/tests/e2e/flow-session-gates.spec.ts` |
| FR-032 | AT-FLOW-002 | E2E-FLOW-006 | Session | Implemented | `capd-app/tests/e2e/flow-session-gates.spec.ts` |
| FR-033, FR-073 | AT-FLOW-003 | E2E-FLOW-007 | Session | Implemented | `capd-app/tests/e2e/flow-session-gates.spec.ts`（CSV/snapshot駆動） |
| FR-082A | AT-API-001 | E2E-API-001 | API境界 | Implemented | `capd-app/tests/e2e/sync-api.spec.ts` |
| FR-082A | AT-API-003 | E2E-API-002 | API境界 | Implemented | `capd-app/tests/e2e/csv-import.spec.ts` |
| FR-093 | AT-API-002 | E2E-API-003 | Home | Implemented | `capd-app/tests/e2e/home.smoke.spec.ts` |
| FR-104 | AT-API-004 | E2E-API-004 | Blob保存形式 | Implemented | `capd-app/tests/e2e/sync-api.spec.ts` |
| FR-080, FR-082 | AT-SYNC-001 | E2E-SYNC-001 | Sync | Implemented | `capd-app/tests/e2e/sync-api.spec.ts` |
| FR-081, FR-086 | AT-SYNC-005 | E2E-SYNC-002 | Sync | Implemented | `capd-app/tests/e2e/sync-api.spec.ts` |
| FR-080, FR-081 | AT-SYNC-002 | E2E-SYNC-003 | Sync | Implemented | `capd-app/tests/e2e/sync-api.spec.ts` |
| FR-083 | AT-SYNC-003 | E2E-SYNC-004 | Sync | Implemented | `capd-app/tests/e2e/sync-api.spec.ts` |
| FR-083, FR-084 | AT-SYNC-004 | E2E-SYNC-005 | Sync | Implemented | `capd-app/tests/e2e/sync-api.spec.ts` |
| FR-088 | AT-SYNC-006 | E2E-SYNC-006 | Sync | Implemented | `capd-app/tests/e2e/sync-api.spec.ts` |
| FR-087 | AT-RECOVERY-001 | E2E-RECOVERY-001 | Recovery | Implemented | `capd-app/tests/e2e/sync-api.spec.ts` |
| FR-087A, FR-087B, FR-087C | AT-RECOVERY-002 | E2E-RECOVERY-002 | Recovery | Implemented | `capd-app/tests/e2e/sync-api.spec.ts` |
| FR-087D | AT-RECOVERY-003 | E2E-RECOVERY-003 | Recovery | Implemented | `capd-app/tests/e2e/sync-api.spec.ts` |
| FR-050A, FR-051, FR-050 | AT-ALARM-001 | E2E-ALARM-001 | Alarm | Implemented | `capd-app/tests/e2e/alarm.spec.ts`（timer_end/step_enter） |
| FR-052A, FR-052B | AT-ALARM-002 | E2E-ALARM-002 | Alarm | Implemented | `capd-app/tests/e2e/alarm.spec.ts` |
| FR-053, FR-054 | AT-ALARM-003 | E2E-ALARM-003 | Alarm | Implemented | `capd-app/tests/e2e/alarm.spec.ts` |
| FR-058, FR-058A, FR-058B | AT-ALARM-004 | E2E-ALARM-004 | Alarm | Implemented | `capd-app/tests/e2e/alarm.spec.ts` |
| SCR-013-STORAGE-ADMIN-FR-01 | AT-DEV-STORAGE-001 | E2E-STORAGE-001 | Storage Admin | Implemented | `capd-app/tests/e2e/storage-admin.spec.ts` |
| SCR-013-STORAGE-ADMIN-FR-05 | AT-DEV-STORAGE-002 | E2E-STORAGE-002 | Storage Admin | Implemented | `capd-app/tests/e2e/storage-admin.spec.ts` |
| SCR-013-STORAGE-ADMIN-FR-05 | AT-DEV-STORAGE-002 | E2E-STORAGE-003 | Storage Admin | Implemented | `capd-app/tests/e2e/storage-admin.spec.ts` |
| SCR-013-STORAGE-ADMIN-FR-07 | AT-DEV-STORAGE-003 | E2E-STORAGE-004 | Storage Admin | Implemented | `capd-app/tests/e2e/storage-admin.spec.ts` |
| SCR-013-STORAGE-ADMIN-FR-08 | AT-DEV-STORAGE-004 | E2E-STORAGE-005 | Storage Admin | Implemented | `capd-app/tests/e2e/storage-admin.spec.ts` |
| FR-109, FR-112 | AT-PLAT-001 | E2E-PLAT-001 | Platform | Deferred | Phase2（iPhone利用） |
| FR-109, FR-110, FR-111 | AT-PLAT-002 | E2E-PLAT-002 | Platform | Deferred | Phase2（Macネイティブ） |
| FR-111, FR-113 | AT-SLEEP-001 | E2E-SLEEP-001 | Sleep | Deferred | Phase2（スリープ抑止） |
| FR-042B, FR-042C | AT-EXIT-001, AT-EXIT-002 | E2E-EXIT-001 | Exit Site Photo | Deferred | Phase2（表示前提） |
| FR-042D | AT-EXIT-003 | E2E-EXIT-002 | Exit Site Photo | Deferred | Phase2（両導線一貫性） |
| FR-042D | AT-EXIT-004 | E2E-EXIT-003 | Exit Site Photo | Deferred | Phase2（端末制約） |
| FR-042E, FR-042H | AT-EXIT-005, AT-EXIT-006, AT-EXIT-007, AT-EXIT-008 | E2E-EXIT-004 | Exit Site Photo | Deferred | Phase2（1枚固定状態遷移） |
| FR-042A, FR-089A | AT-EXIT-009, AT-EXIT-010 | E2E-EXIT-005 | Exit Site Photo / Sync | Deferred | Phase2（部分更新保全） |
| FR-042B, FR-044C | AT-EXIT-011 | E2E-EXIT-006 | Exit Site Photo | Deferred | Phase2（`both` 対応） |
| FR-091 | AT-EXIT-012 | E2E-EXIT-007 | Exit Site Photo | Deferred | Phase2（容量制御共通化） |
| FR-091 | AT-PHOTO-001 | E2E-PHOTO-001 | Photo容量 | Deferred | Phase2（1GB上限） |
| FR-092 | AT-BACKUP-001 | E2E-BACKUP-001 | Backup | Deferred | Phase2（日次バックアップ） |

### 2.3 Visual Regression
| 要件ID | 受入ID | テストID | 対象 | 状態 | 備考 |
|---|---|---|---|---|---|
| FR-009A, FR-009B, FR-005A | AT-UI-HOME-001 | VR-HOME-001 | Home | Implemented | `capd-app/tests/visual/home.visual.spec.ts` |
| FR-009A, FR-009B | - | VR-HOME-002 | Home | Executable | スロット設定モーダル |
| FR-009A, FR-009B | - | VR-HOME-003 | Home | Executable | 開始確認モーダル |
| FR-009D | AT-UI-HOME-002 | VR-HOME-004 | Home | Executable | 開始不可表示 |
| FR-030, FR-038 | AT-UI-SESSION-001 | VR-SESSION-001 | Session | Executable | Desktop初期表示 |
| FR-030, FR-038 | - | VR-SESSION-002 | Session | Executable | Mobile初期表示 |
| FR-032 | - | VR-SESSION-003 | Session | Executable | 記録モーダル |
| FR-039D, FR-039E | - | VR-SESSION-004 | Session | Executable | 非常中断ダイアログ |
| FR-010, FR-013, FR-014 | - | VR-HISTORY-001 | History | Executable | Desktop一覧 |
| FR-010, FR-013, FR-014 | - | VR-HISTORY-002 | History | Executable | Mobile一覧 |

## 3. 更新ルール
- 追加したテストコードは、同時に本表へ追記します。
- `状態` は `Planned -> Executable -> Implemented` を基本遷移とし、実行環境未整備のみ `Deferred` を使用します。
- 受入ID（`AT-*`）は、範囲記法（`~`）を使わず単独IDで記載します。
- `AGENTS.md` 7.1 のPhase1必須範囲は `Deferred` を使用しません。
- Phase2対象は `備考` に `Phase2` を明記して追跡します。
