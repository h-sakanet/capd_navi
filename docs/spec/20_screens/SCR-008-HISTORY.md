# SCR-008-HISTORY

## 1. メタ情報
- SCR ID: SCR-HISTORY-001
- 画面名: 記録一覧
- Route/I/F: `/capd/history-list`
- 主JRN: JRN-008-HISTORY
- Phase: Phase1

## 2. 目的と責務境界
- この画面で決めること: 直近30日一覧表示、写真詳細/記録詳細への導線、一覧列の表示規則。
- この画面で決めないこと: 写真保存処理、記録保存処理、同期競合解決。

## 3. UIワイヤー・レイアウト制約
- 参照: `../../../requirements/06_ui_wireframes_ab.md` 6章。
- 表示列は `#1〜#5` 固定。
- 写真はサムネイル固定表示ではなくリンク遷移。

## 4. UI要素一覧
| UI ID | 要素 | 表示条件 | 入力制約 | セレクタ方針 |
|---|---|---|---|---|
| UI-001-HISTORY | 記録一覧テーブル | 記録あり | 直近30日固定 | role/table |
| UI-002-HISTORY | 写真詳細リンク | `photoId` あり | 対象photo必須 | role/link |
| UI-003-HISTORY | 出口部写真列 | 常時 | `未登録/表示` 切替 | role/cell |

## 5. 操作契約
| ACT ID | Guard | Side Effect | Success遷移 | Failure表示 |
|---|---|---|---|---|
| ACT-001-HISTORY | 対象`photoId`が存在 | なし | SCR-010-HISTORY-PHOTO | 写真未登録文言 |

## 6. データバインディング
| 区分 | Read | Write | Outbox | 反映タイミング |
|---|---|---|---|---|
| 一覧表示 | `DayBundle.records`, `sessions`, `dailyProcedurePlan` | - | - | on load |
| 列表示 | `record_exchange_no`, `timer_exchange_no`, `summary` | - | - | on load |
| 写真リンク | `photoRefs`, `payload.exit_site_photo` | - | - | on click |

## 7. バリデーション / エラー文言 / 空状態
- バリデーション:
  - `record_event` と `*_exchange_no` で列マッピング。
  - 除水量は `排液量 - 前回注液量`、#1は`未計算`。
- エラー文言: `写真が登録されていません。`
- 空状態: `表示できる記録がありません。`

## 8. 権限・端末差分・フォールバック
- Mac/iPhoneともに閲覧可。
- 編集導線は詳細画面で提供。

## 9. アクセシビリティ / キーボード
- テーブルヘッダを明示し列意味を読み上げ可能にします。
- 写真リンクはリンクテキストに状態（表示/未登録）を含めます。

## 10. 受入条件（GWT）
- Given 写真リンク付き記録がある
- When 写真詳細リンクを押下する
- Then 写真詳細画面へ遷移する

## 11. 参照リンク
- FR: FR-010〜FR-019, FR-014A, FR-015A〜FR-015C, FR-016
- AT: （JRN-008-HISTORYで一括管理）
- E2E/UT/VR: E2E-EXIT-002, VR-HISTORY-001, VR-HISTORY-002（`../50_quality/test-link-index.md` 参照）
- CAP: `../30_capabilities/CAP-SNAPSHOT-001.md`
