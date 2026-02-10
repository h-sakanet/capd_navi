# Traceability Matrix

## 1. 目的
要件（`FR-*`）・受入（`AT-*`）・テスト仕様（`UT-*` / `E2E-*` / `VR-*`）の対応関係を固定します。  
本表は「1行1ケース（1テストID）」で更新し、未実装は `状態=Deferred` で明示します。

## 2. 対応表

### 2.1 Unit
| 要件ID | 受入ID | テストID | 対象 | 状態 | 備考 |
|---|---|---|---|---|---|
| FR-021 | AT-CSV-001 | UT-CSV-001 | `protocol-csv.ts` | Executable | 正常CSVの基本パース |
| FR-022 | - | UT-CSV-002 | `protocol-csv.ts` | Executable | ヘッダー/データ不足 |
| FR-021 | - | UT-CSV-003 | `protocol-csv.ts` | Executable | `row_type` 必須列検証 |
| FR-021 | - | UT-CSV-004 | `protocol-csv.ts` | Executable | 必須meta_key検証 |
| FR-021 | - | UT-CSV-005 | `protocol-csv.ts` | Executable | `format_version=3` 固定検証 |
| FR-022 | - | UT-CSV-006 | `protocol-csv.ts` | Executable | step行欠落時の中止 |
| FR-023 | AT-CSV-005 | UT-CSV-007 | `protocol-csv.ts` | Executable | 警告系入力（改行分割） |
| FR-021 | - | UT-CSV-008 | `protocol-csv.ts` | Executable | エスケープ引用符復元 |
| FR-021 | - | UT-CSV-009 | `protocol-csv.ts` | Executable | `alarm_duration_min` 空欄 |
| FR-021 | - | UT-CSV-010 | `protocol-csv.ts` | Executable | `alarm_duration_min` 非数値 |
| FR-022 | - | UT-CSV-011 | `protocol-csv.ts` | Executable | 無効step行の無視 |
| FR-009E | - | UT-SLOT-001 | `session-slot-store.ts` | Executable | localStorage未設定復帰 |
| FR-009E | - | UT-SLOT-002 | `session-slot-store.ts` | Executable | 不正JSON復帰 |
| FR-009E | - | UT-SLOT-003 | `session-slot-store.ts` | Executable | 配列長不正復帰 |
| FR-009E | - | UT-SLOT-004 | `session-slot-store.ts` | Executable | 要素型不正の正規化 |
| FR-009E | - | UT-SLOT-005 | `session-slot-store.ts` | Executable | 書込/復元の整合 |
| FR-009G | - | UT-SLOT-006 | `session-slot-store.ts` | Executable | active session未設定 |
| FR-009G | - | UT-SLOT-007 | `session-slot-store.ts` | Executable | `slotIndex` 範囲外 |
| FR-009G | - | UT-SLOT-008 | `session-slot-store.ts` | Executable | active session書込/復元 |
| FR-039F | - | UT-SLOT-009 | `session-slot-store.ts` | Executable | active session削除 |
| FR-009G | - | UT-SLOT-010 | `session-slot-store.ts` | Executable | preview sessionId生成 |
| FR-009E | - | UT-SLOT-011 | `session-slot-store.ts` | Executable | SSR時 `readProcedureSlots` |
| FR-009E | - | UT-SLOT-012 | `session-slot-store.ts` | Executable | SSR時 `readActiveSession` |
| FR-015A | - | UT-UF-001 | `mock-data.ts` | Executable | 初回交換は未計算 |
| FR-015 | - | UT-UF-002 | `mock-data.ts` | Executable | 交換除水量計算 |
| FR-015 | - | UT-UF-003 | `mock-data.ts` | Executable | 範囲外index |
| FR-015B | - | UT-UF-004 | `mock-data.ts` | Executable | 1日総除水量計算 |
| FR-013 | - | UT-UF-005 | `mock-data.ts` | Executable | 1日総排液量計算 |
| FR-013 | - | UT-UF-006 | `mock-data.ts` | Executable | 1日総注液量計算 |
| FR-014 | - | UT-UF-007 | `mock-data.ts` | Executable | 最初の写真ID取得 |
| FR-014 | - | UT-UF-008 | `mock-data.ts` | Executable | 写真なし時 `null` |

### 2.2 E2E / Acceptance
| 要件ID | 受入ID | テストID | 対象 | 状態 | 備考 |
|---|---|---|---|---|---|
| FR-020, FR-021 | AT-CSV-001 | E2E-CSV-001 | CSV取込 | Planned | Phase1必須（取込成立） |
| FR-022 | AT-CSV-002 | E2E-CSV-002 | CSV取込 | Planned | Phase1必須（重複検知） |
| FR-022 | AT-CSV-003 | E2E-CSV-003 | CSV取込 | Planned | Phase1必須（直列整合） |
| FR-022, FR-024 | AT-CSV-004 | E2E-CSV-004 | CSV取込 | Planned | Phase1必須（画像存在） |
| FR-023 | AT-CSV-005 | E2E-CSV-005 | CSV取込 | Deferred | Phase2（警告強化） |
| FR-009D | AT-FLOW-005 | E2E-FLOW-001 | Home | Executable | 左優先制約 |
| FR-036, FR-009F | AT-FLOW-004 | E2E-FLOW-002 | Home | Executable | 同時実行制限 |
| FR-009G | AT-FLOW-006 | E2E-FLOW-003 | Home / Session | Executable | 離脱再開 |
| FR-039D, FR-039E, FR-039F | AT-FLOW-007 | E2E-FLOW-004 | Session | Executable | 非常中断 |
| FR-031 | AT-FLOW-001 | E2E-FLOW-005 | Session | Executable | 必須チェックゲート |
| FR-032 | AT-FLOW-002 | E2E-FLOW-006 | Session | Executable | `record_event` ゲート |
| FR-033 | AT-FLOW-003 | E2E-FLOW-007 | Session | Executable | `next_step_id` 遷移 |
| FR-082A | AT-API-001 | E2E-API-001 | API境界 | Planned | Phase1必須（公開API最小化） |
| FR-082A | AT-API-003 | E2E-API-002 | API境界 | Planned | Phase1必須（CSVローカル完結） |
| FR-093 | AT-API-002 | E2E-API-003 | Home | Executable | 手動エクスポート非表示 |
| FR-104 | AT-API-004 | E2E-API-004 | Blob保存形式 | Planned | Phase1必須（非暗号化キー形式） |
| FR-080, FR-082 | AT-SYNC-001 | E2E-SYNC-001 | Sync | Planned | Phase1必須（起動時pull復元） |
| FR-081, FR-086 | AT-SYNC-005 | E2E-SYNC-002 | Sync | Planned | Phase1必須（outbox消し込み） |
| FR-080, FR-081 | AT-SYNC-002 | E2E-SYNC-003 | Sync | Planned | Phase1必須（完了時push反映） |
| FR-083 | AT-SYNC-003 | E2E-SYNC-004 | Sync | Planned | Phase1必須（LWW内部適用） |
| FR-083, FR-084 | AT-SYNC-004 | E2E-SYNC-005 | Sync | Planned | Phase1必須（同日同スロット競合） |
| FR-088 | AT-SYNC-006 | E2E-SYNC-006 | Sync | Planned | Phase1必須（再試行導線） |
| FR-087 | AT-RECOVERY-001 | E2E-RECOVERY-001 | Recovery | Planned | Phase1必須（DB消失復元） |
| FR-087A, FR-087B, FR-087C | AT-RECOVERY-002 | E2E-RECOVERY-002 | Recovery | Planned | Phase1必須（欠損再シード） |
| FR-087D | AT-RECOVERY-003 | E2E-RECOVERY-003 | Recovery | Planned | Phase1必須（失敗時保全） |
| FR-050A, FR-051 | AT-ALARM-001 | E2E-ALARM-001 | Alarm | Planned | Phase1必須（T0通知） |
| FR-052A, FR-052B | AT-ALARM-002 | E2E-ALARM-002 | Alarm | Planned | Phase1必須（段階再通知） |
| FR-053, FR-054 | AT-ALARM-003 | E2E-ALARM-003 | Alarm | Planned | Phase1必須（ACK停止） |
| FR-058, FR-058A, FR-058B | AT-ALARM-004 | E2E-ALARM-004 | Alarm | Planned | Phase1必須（見逃し状態） |
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
| FR-009A, FR-009B, FR-005A | AT-UI-HOME-001 | VR-HOME-001 | Home | Executable | 初期表示 |
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
