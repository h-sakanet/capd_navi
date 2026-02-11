# SCR-004-HOME-VIEW-CONFIRM

## 1. メタ情報
- SCR ID: SCR-HOME-VIEW-CONFIRM-001
- 画面名: 手技内容確認モーダル
- Route/I/F: Home内Dialog
- 主JRN: JRN-002-SLOT
- Phase: Phase1

## 2. 目的と責務境界
- この画面で決めること: 閲覧専用の手順確認導線。
- この画面で決めないこと: 記録保存、タイマー生成、通知生成、スロット/セッション状態更新。

## 3. UIワイヤー・レイアウト制約
- 参照: `../../../requirements/06_ui_wireframes_ab.md` 5.3。
- 注意文「確認モード。保存なし」を固定表示します。
- ボタンは `[閉じる] [手順を表示（保存なし）]` を固定。

## 4. UI要素一覧
| UI ID | 要素 | 表示条件 | 入力制約 | セレクタ方針 |
|---|---|---|---|---|
| UI-001-VIEW-CONFIRM | 手技情報表示 | 常時 | 読み取り専用 | role/dialog |
| UI-002-VIEW-CONFIRM | 手順を表示（保存なし）ボタン | 常時 | 副作用禁止 | role/button + name |
| UI-003-VIEW-CONFIRM | 確認モード注意文 | 常時 | 文言固定 | role/note |

## 5. 操作契約
| ACT ID | Guard | Side Effect | Success遷移 | Failure表示 |
|---|---|---|---|---|
| ACT-006-HOME | 対象スロット登録済み | 永続化・通知・タイマー生成を禁止 | SCR-006-SESSION（preview） | なし |

## 6. データバインディング
| 区分 | Read | Write | Outbox | 反映タイミング |
|---|---|---|---|---|
| 表示 | `slots[n]`, `ProtocolPackage.steps` | - | - | on dialog open |
| 手順表示（確認モード） | `ProtocolPackage.steps` | - | - | on click |

## 7. バリデーション / エラー文言 / 空状態
- バリデーション: 登録済みスロットでのみ表示。
- エラー文言: 対象スロット未登録時はHome側で遷移を抑止。
- 空状態: `表示可能な手順がありません。`

## 8. 権限・端末差分・フォールバック
- Mac/iPhoneともに閲覧可。
- 失敗時はHomeへ戻し、再表示導線のみ提供。

## 9. アクセシビリティ / キーボード
- Enterで手順表示、Escで閉じる。
- 「保存なし」注意文はスクリーンリーダーに読ませます。

## 10. 受入条件（GWT）
- Given `••• > 確認` から本モーダルを開く
- When 手順表示を実行する
- Then 記録保存・通知生成・状態更新が発生しない

## 11. 参照リンク
- FR: FR-009A, FR-009H, FR-056
- AT: （JRN-002-SLOTで一括管理）
- E2E/UT/VR: VR-HOME-001（`../50_quality/test-link-index.md` 参照）
- CAP: `../30_capabilities/CAP-SNAPSHOT-001.md`
