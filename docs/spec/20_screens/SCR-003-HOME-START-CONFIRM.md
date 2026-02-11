# SCR-003-HOME-START-CONFIRM

## 1. メタ情報
- SCR ID: SCR-HOME-START-CONFIRM-001
- 画面名: 開始確認モーダル
- Route/I/F: Home内Dialog
- 主JRN: JRN-002-SLOT
- Phase: Phase1

## 2. 目的と責務境界
- この画面で決めること: 開始/再開前の最終確認、開始不可条件の提示、実運用セッション開始。
- この画面で決めないこと: ステップ進行ロジック詳細、記録入力項目。

## 3. UIワイヤー・レイアウト制約
```text
+-----------------------------------------------+
| 手技の開始                                     |
| 手技: レギニュール1.5                          |
| ステータス: 未実施 or 実施中                   |
| 推奨実施: 20:00                                |
|                        [閉じる] [開始/再開]    |
+-----------------------------------------------+
```

- 表示項目は「手技名」「ステータス」「推奨実施時刻」を固定します。
- ボタンは `[閉じる] [開始/再開]` の順で横並び固定。

## 4. UI要素一覧
| UI ID | 要素 | 表示条件 | 入力制約 | セレクタ方針 |
|---|---|---|---|---|
| UI-001-START-CONFIRM | 手技情報表示 | 常時 | 読み取り専用 | role/dialog |
| UI-002-START-CONFIRM | 開始/再開ボタン | 開始可能時 | 不可時はdisabled | role/button + name |
| UI-003-START-CONFIRM | 開始不可理由 | 開始不可時 | 文言固定 | role/alert |

## 5. 操作契約
| ACT ID | Guard | Side Effect | Success遷移 | Failure表示 |
|---|---|---|---|---|
| ACT-008-HOME | 開始不可条件に該当しない | `Session` 開始/再開 + `activeSession` 更新 | SCR-006-SESSION | セッション開始失敗エラー |

## 6. データバインディング
| 区分 | Read | Write | Outbox | 反映タイミング |
|---|---|---|---|---|
| 表示 | `slots[n]`, `activeSession` | - | - | on dialog open |
| 開始/再開確定 | `slots[n].displayStatus` | `Session`, `activeSession` | `session` 追記 | on confirm |

## 7. バリデーション / エラー文言 / 空状態
- バリデーション:
  - 右側スロット開始時は左側全完了必須。
  - 同一端末で進行中セッションがある場合は新規開始不可。
- エラー文言:
  - `開始できません。左側スロットを完了してください。`
  - `開始に失敗しました。再度お試しください。`
- 空状態: 対象スロット未登録の場合は本モーダルを表示しません。

## 8. 権限・端末差分・フォールバック
- Mac/iPhoneともに開始可能。
- 開始失敗時はHomeへ戻さず、モーダル上で再試行可能にします。

## 9. アクセシビリティ / キーボード
- Enterで開始/再開、Escで閉じる。
- 開始不可理由は `aria-live=polite` で通知。

## 10. 受入条件（GWT）
- Given 進行中セッションがない
- When 開始/再開を確定する
- Then `SCR-006-SESSION` へ遷移し `activeSession` が更新される

## 11. 参照リンク
- Local FR: `SCR-003-HOME-START-CONFIRM-FR-01` 〜 `SCR-003-HOME-START-CONFIRM-FR-03`
- 旧FR対応: FR-009, FR-009D, FR-009G
- AT: AT-FLOW-004, AT-FLOW-005
- E2E/UT/VR: E2E-FLOW-001, E2E-FLOW-002, VR-HOME-003（`../50_quality/test-link-index.md` 参照）
- CAP: `../30_capabilities/CAP-SNAPSHOT-001.md`

## 12. 画面機能要件（ローカルID）

- 採番規則: `<文書ID>-FR-yy`（yyはこの文書内連番）
- 旧FR IDは括弧内に残し、移行トレーサビリティを保持します。

- SCR-003-HOME-START-CONFIRM-FR-01: (旧: FR-009) 手技設定後は「カード本体タップ=開始」とし、開始前に「手技の開始」確認ダイアログを表示します。
- SCR-003-HOME-START-CONFIRM-FR-02: (旧: FR-009D) 右側スロットの開始時は、左側スロットがすべて `実施済み` であることを必須条件にします（未登録/未実施が1件でもあれば開始不可）。
- SCR-003-HOME-START-CONFIRM-FR-03: (旧: FR-009G) `実施中` スロットをタップした場合は新規開始せず、進行中セッションを再開します。
