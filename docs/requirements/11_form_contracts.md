# 11. フォーム契約（FC）

## 1. 目的
本書は、フォーム項目の表示順・必須条件・エラー文言・保存先を固定し、実装差分をなくすための契約です。  
画面配置は `06_ui_wireframes_ab.md`、操作遷移は `10_screen_transition_and_actions.md` を参照します。

## 2. 共通ルール
- フォームIDは `FC-*` を使用します。
- 未入力時のラベルは `未入力` に統一します。
- 単位は数値直後に表示します（例: `120 mmHg`, `500 g`）。
- 保存成功時は `Record` または `DailyProcedurePlan` への反映を必須とします。

## 3. FC一覧
| FC ID | 対象フォーム | 主画面 | 保存先 | 対応FR | 対応AT |
|---|---|---|---|---|---|
| FC-SLOT-SETUP-001 | 手技設定 | SCR-HOME-SETUP-001 | `DailyProcedurePlan.slots[n]` | FR-008, FR-009C, FR-009E | AT-FLOW-005 |
| FC-DRAIN-APPEARANCE-001 | 排液の確認 | SCR-SESSION-RECORD-001 | `Record(record_event=drain_appearance)` | FR-040〜FR-042 | AT-FLOW-002 |
| FC-DRAIN-WEIGHT-001 | 排液量 | SCR-SESSION-RECORD-001 | `Record(record_event=drain_weight_g)` | FR-043 | AT-FLOW-002 |
| FC-BAG-WEIGHT-001 | 注液量 | SCR-SESSION-RECORD-001 | `Record(record_event=bag_weight_g)` | FR-043 | AT-FLOW-002 |
| FC-SUMMARY-001 | `summaryScope=first_of_day` | SCR-SESSION-RECORD-001 | `Record(record_event=session_summary)` | FR-044, FR-044B, FR-044C | AT-EXIT-002 |
| FC-SUMMARY-002 | `summaryScope=last_of_day` | SCR-SESSION-RECORD-001 | `Record(record_event=session_summary)` | FR-044, FR-044C | AT-EXIT-001 |
| FC-SUMMARY-003 | `summaryScope=both` | SCR-SESSION-RECORD-001 | `Record(record_event=session_summary)` | FR-044A, FR-044C | AT-EXIT-011 |

## 4. フォーム詳細

### FC-SLOT-SETUP-001 手技設定
| 表示順 | 項目 | 型 | 必須 | 検証 |
|---|---|---|---|---|
| 1 | CSV選択（手技） | Select | 必須 | 有効な `protocolId` |
| 2 | 推奨実施時間 | Time | 必須 | 左から右で厳密昇順（同時刻不可） |

エラー文言:
- `推奨実施時間は左から右へ遅くなるように設定してください。`

### FC-DRAIN-APPEARANCE-001 排液の確認
| 表示順 | 項目 | 型 | 必須 | 検証 |
|---|---|---|---|---|
| 1 | 見た目分類 | Radio | 必須 | `透明/やや混濁/混濁/血性/その他` |
| 2 | 任意メモ | TextArea | 任意 | 文字数上限のみ |
| 3 | 排液写真 | File | 任意 | JPEG再圧縮 |

### FC-DRAIN-WEIGHT-001 排液量
| 表示順 | 項目 | 型 | 必須 | 検証 |
|---|---|---|---|---|
| 1 | 排液量(g) | Number | 必須 | 正の数値 |

エラー文言:
- `排液量を入力してください。`
- `排液量は0より大きい値を入力してください。`

### FC-BAG-WEIGHT-001 注液量
| 表示順 | 項目 | 型 | 必須 | 検証 |
|---|---|---|---|---|
| 1 | 注液量(g) | Number | 必須 | 正の数値 |

エラー文言:
- `注液量を入力してください。`
- `注液量は0より大きい値を入力してください。`

### FC-SUMMARY-001 `summaryScope=first_of_day`
必須項目:
- 血圧上
- 血圧下
- 体重
- 脈拍
- 体温
- 出口部状態（複数選択）

表示順:
1. 血圧上（mmHg）
2. 血圧下（mmHg）
3. 体重（kg）
4. 脈拍（回/分）
5. 体温（℃）
6. 出口部状態（`正常/赤み/痛み/はれ/かさぶた/じゅくじゅく/出血/膿`）
7. 症状メモ（任意）
8. 備考（任意）

### FC-SUMMARY-002 `summaryScope=last_of_day`
必須項目:
- 飲水量
- 尿量
- 排便回数

表示順:
1. 飲水量（ml）
2. 尿量（ml）
3. 排便回数（回）
4. 症状メモ（任意）
5. 備考（任意）

### FC-SUMMARY-003 `summaryScope=both`
1日1回運用時の最終フォームは、以下の固定順で表示します。  
この順序を変更してはいけません。

1. 血圧上（mmHg）【必須】
2. 血圧下（mmHg）【必須】
3. 体重（kg）【必須】
4. 脈拍（回/分）【必須】
5. 体温（℃）【必須】
6. 出口部状態（複数選択）【必須】
7. 飲水量（ml）【必須】
8. 尿量（ml）【必須】
9. 排便回数（回）【必須】
10. 症状メモ（任意）
11. 備考（任意）

エラー文言:
- `必須項目が未入力です。`
- `出口部状態を1つ以上選択してください。`

## 5. 出口部写真操作契約
`session_summary` 保存後に以下を表示します。

- 未登録: `登録`
- 登録済み: `変更` / `削除`

保存先:
- `session_summary.payload.exit_site_photo`

制約:
- iPhone: 更新可
- Mac: 閲覧のみ
- 削除時は `exit_site_photo=null`

## 6. 完了判定
- `FC-*` ごとに保存先データの更新確認をUnitまたはE2Eで担保します。
- 表示順変更は本書改訂を先行し、無改訂でUI変更してはいけません。
