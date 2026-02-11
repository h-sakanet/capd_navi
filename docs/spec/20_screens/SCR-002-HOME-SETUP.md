# SCR-002-HOME-SETUP

## 1. メタ情報
- SCR ID: SCR-HOME-SETUP-001
- 画面名: 手技設定モーダル
- Route/I/F: Home内Dialog
- 主JRN: JRN-002-SLOT
- Phase: Phase1

## 2. 目的と責務境界
- この画面で決めること: スロットへの手技割り当て、推奨実施時間の入力、保存可否判定。
- この画面で決めないこと: セッション開始、実施中セッション再開、CSV取込処理。

## 3. UIワイヤー・レイアウト制約
- 参照: `../../../requirements/06_ui_wireframes_ab.md` 5.1。
- 入力項目は `CSV選択` -> `推奨実施時間` の順で固定します。
- 保存/キャンセルをフッター右側に配置します。

## 4. UI要素一覧
| UI ID | 要素 | 表示条件 | 入力制約 | セレクタ方針 |
|---|---|---|---|---|
| UI-001-SLOT-SETUP | 手技選択（Select） | 常時 | 有効 `protocolId` 必須 | role/combobox |
| UI-002-SLOT-SETUP | 推奨実施時間（Time） | 常時 | 左から右へ厳密昇順 | role/spinbutton |
| UI-003-SLOT-SETUP | 保存ボタン | 必須入力充足時 | 実施中セッション時は無効 | role/button + name |
| UI-004-SLOT-SETUP | エラー表示 | 検証失敗時 | 文言固定 | role/alert |

## 5. 操作契約
| ACT ID | Guard | Side Effect | Success遷移 | Failure表示 |
|---|---|---|---|---|
| ACT-002-HOME | `protocolId` と `recommendedAtLocal` が妥当 | `DailyProcedurePlan.slots[n]` 更新 | SCR-001-HOME | 時間順序違反エラー |

## 6. データバインディング
| 区分 | Read | Write | Outbox | 反映タイミング |
|---|---|---|---|---|
| 編集初期値 | `DailyProcedurePlan.slots[n]` | - | - | on dialog open |
| 保存 | `protocolId`, `recommendedAtLocal` | `DailyProcedurePlan.slots[n]` | `daily_plan` 追記 | on save |

## 7. バリデーション / エラー文言 / 空状態
- バリデーション:
  - `protocolId` 必須。
  - 推奨実施時間は左から右へ厳密昇順（同時刻不可）。
- エラー文言:
  - `推奨実施時間は左から右へ遅くなるように設定してください。`
- 空状態:
  - スロット未登録時は空フォームを表示。

## 8. 権限・端末差分・フォールバック
- Mac/iPhoneともに表示可。
- 進行中セッションがある場合は保存禁止（モーダルを閉じず理由を表示）。

## 9. アクセシビリティ / キーボード
- Enterで保存、Escでキャンセル。
- 最初のフォーカスは `CSV選択` に固定。

## 10. 受入条件（GWT）
- Given #1=20:00, #2を19:00で登録する
- When 保存する
- Then 順序違反で保存されない

## 11. 参照リンク
- FR: FR-008, FR-009C, FR-009E, FR-009F
- AT: AT-FLOW-005
- E2E/UT/VR: E2E-FLOW-001, UT-SLOT-001〜UT-SLOT-012, VR-HOME-002（`../50_quality/test-link-index.md` 参照）
- CAP: `../30_capabilities/CAP-SYNC-001.md`
