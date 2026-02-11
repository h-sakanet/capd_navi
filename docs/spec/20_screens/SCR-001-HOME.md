# SCR-001-HOME

## 1. メタ情報
- SCR ID: SCR-HOME-001
- 画面名: Home
- Route/I/F: `/capd/home`
- 主JRN: JRN-001-CSV, JRN-002-SLOT, JRN-004-ABORT, JRN-005-SYNC, JRN-008-HISTORY
- Phase: Phase1

## 2. 目的と責務境界
- この画面で決めること: 当日4スロット表示、開始/再開導線、CSV取込導線、記録一覧導線、当日ノート表示、手動同期導線。
- この画面で決めないこと: CSVパース規則、同期競合解決アルゴリズム、記録フォームの詳細入力仕様。

## 3. UIワイヤー・レイアウト制約
```text
+------------------------------------------------+
| 02/10 (火)                                      |
| 手技開始通知は外部アラーム運用（時計アプリ等）   |
+------------------------------------------------+
| [ + ] [ + ] [ + ] [ + ]                         |
+------------------------------------------------+
| #1 登録後                                  [•••]|
| レギニュール1.5                                  |
| ステータス：未実施 / 実施中 / 実施済み          |
| 推奨実施 20:00                                  |
| （カード本体タップで開始/再開ダイアログを表示）  |
+------------------------------------------------+
| 交換列 | #1 | #2 | #3 | #4 | #5                 |
| 貯留時間(timer:dwell start-end)                  |
| 透析液濃度(CSVタイトル: レギニュール1.5)         |
| 排液量(record:drain_weight_g)                    |
| 注液量(record:bag_weight_g)                      |
| 除水量(自動) / 排液時間(timer:drain start-end)   |
| 排液の確認(record:drain_appearance)              |
| 1日の総除水量(自動), 尿量, 飲水量, 体重, 排便,    |
| 血圧, 排液写真(記録写真), 出口部状態, 出口部写真(記録写真), 備考 |
+------------------------------------------------+
| [CSV取り込み(Mac)] [記録一覧を開く] [手動同期]    |
+------------------------------------------------+
```

```text
+-----------------------------------------------+
| [確認] -> SCR-004-HOME-VIEW-CONFIRM           |
| [編集] -> SCR-002-HOME-SETUP                  |
+-----------------------------------------------+
```

- 先頭に日付・曜日を表示し、4スロットと当日ノート表を同一パネルに配置します。
- 「手技開始通知は外部アラーム運用」の注記を固定表示します。
- 右上 `•••` メニューは `確認/編集` の2項目のみ許可します。
- `••• > 確認` は `ACT-003-HOME` で `SCR-004-HOME-VIEW-CONFIRM` へ遷移します。
- `••• > 編集` は `ACT-004-HOME` で `SCR-002-HOME-SETUP` へ遷移します。
- `••• > 編集` で開く `SCR-002-HOME-SETUP` は、対象スロットの `protocolId` / `recommendedAtLocal` を初期値として表示します。
- `••• > 編集` 後、保存までは Home の表示値は変更せず、保存時のみ当該スロットの設定を更新します。

## 4. UI要素一覧
| UI ID | 要素 | 表示条件 | 入力制約 | セレクタ方針 |
|---|---|---|---|---|
| UI-001-HOME | 日付ヘッダ | 常時 | なし | role/heading |
| UI-002-HOME | #1〜#4スロット状態 | 常時 | 4件固定 | data-testid |
| UI-003-HOME | スロットカード本体 | `displayStatus != empty` | `実施済み` はタップ無効 | role/button + name |
| UI-004-HOME | `•••` メニュー | `displayStatus != empty` | `確認/編集` のみ | role/menu |
| UI-005-HOME | CSV取り込みボタン | 常時 | Macのみ有効 | role/button + name |
| UI-006-HOME | 記録一覧ボタン | 常時 | なし | role/link + name |
| UI-007-HOME | 手動同期ボタン | 常時 | なし | role/button + name |
| UI-008-HOME | 当日ノート（貯留時間） | 記録あり | 読み取り専用 | role/table |
| UI-009-HOME | 当日ノート（排液量/注液量/排液確認） | 記録あり | 読み取り専用 | role/table |
| UI-010-HOME | 当日ノート（総除水量） | 計算可能交換あり | #2以降のみ合算 | role/status |
| UI-011-HOME | 同期失敗バナー | `lastSyncStatus=failed` | 再試行導線を必須表示 | role/alert |
| UI-012-HOME | 当日ノート（排液写真） | `photo_kind=drain` あり | サムネイル固定表示なし、リンク遷移のみ | role/link |

## 5. 操作契約
| ACT ID | Guard | Side Effect | Success遷移 | Failure表示 |
|---|---|---|---|---|
| ACT-001-HOME | 進行中セッションなし | なし | SCR-002-HOME-SETUP | 編集不可メッセージ |
| ACT-003-HOME | `••• > 確認` かつ対象スロット登録済み | なし | SCR-004-HOME-VIEW-CONFIRM | なし |
| ACT-004-HOME | `••• > 編集` かつ`displayStatus!=completed` かつ進行中なし | `editSlotIndex` 設定 + `slots[n]` を編集初期値として引き渡し | SCR-002-HOME-SETUP | 編集不可メッセージ |
| ACT-005-HOME | 右側開始時に左側全完了 | なし（確認表示のみ） | SCR-003-HOME-START-CONFIRM | 開始不可理由 |
| ACT-007-HOME | `platform=mac` | `ProtocolPackage` 保存 + outbox追記 | SCR-012-MAC-IMPORT -> SCR-001-HOME | 検証エラー一覧 |
| ACT-010-HOME | なし | なし | SCR-008-HISTORY | なし |
| ACT-011-HOME | なし | `sync(push,pull)` 実行 | 同一画面維持 | 同期失敗バナー |

## 6. データバインディング
| 区分 | Read | Write | Outbox | 反映タイミング |
|---|---|---|---|---|
| スロット表示 | `DailyProcedurePlan.dateLocal`, `slots[*].displayStatus`, `slots[*].protocolTitle` | - | - | on load / after sync |
| 編集モーダル起点 | `slots[n].protocolId`, `slots[n].recommendedAtLocal` | - | - | on menu edit |
| 開始確認起点 | `slots[n].displayStatus`, `activeSession` | - | - | on tap |
| CSV取込導線 | `platform` | `ProtocolPackage` | `protocol` | on import success |
| 当日ノート表示 | `Record(record_event, *_exchange_no)`, `timer_event` | - | - | on load / after save |
| 当日ノート表示（排液写真） | `photoRefs(photo_kind=drain)`, `Record(record_event=drain_appearance).payload` | - | - | on load / after sync |
| 手動同期 | `SyncState` | `SyncState.lastSyncStatus` | push対象に応じる | on manual sync |

## 7. バリデーション / エラー文言 / 空状態
- バリデーション:
  - 右側開始時は左側スロット全完了必須。
  - `実施済み` スロットは編集/削除不可。
  - 同一端末で進行中セッションがある間は全スロット編集不可。
- エラー文言（例）:
  - `実施中セッションがあるため編集できません。`
  - `右側スロットを開始するには左側のスロットを完了してください。`
- 空状態:
  - 初期は #1〜#4 が `+`（未登録）表示。
  - 排液写真未登録時は `未登録` 表示とし、画像プレースホルダは表示しません。

## 8. 権限・端末差分・フォールバック
- Mac: CSV取込可。出口部写真は閲覧のみ。
- iPhone: CSV取込不可（案内表示）。
- オフライン時はローカル表示を継続し、同期操作は失敗バナーへフォールバック。

## 9. アクセシビリティ / キーボード
- 主要操作（`+`, 記録一覧, 手動同期）はキーボード操作可能にします。
- バナー/エラーは `role=alert` で読み上げます。
- スロット状態は視覚色だけでなく文言（未実施/実施中/実施済み）でも表現します。

## 10. 受入条件（GWT）
- Given #1未完了で#2を開始しようとする
- When `ACT-005-HOME` を実行する
- Then 開始不可理由を表示し遷移しない
- Given outboxにpendingがある
- When `ACT-011-HOME` を実行する
- Then push/pull完了後に同期状態を更新する
- Given #1スロットに既存設定がある
- When `••• > 編集` でモーダルを開く
- Then #1の既存設定を初期値表示し、保存前はHome表示値を変更しない

## 11. 参照リンク
- Local FR: `SCR-001-HOME-FR-01` 〜 `SCR-001-HOME-FR-25`
- 旧FR対応: FR-004A, FR-005, FR-005A, FR-006, FR-007, FR-008, FR-009A〜FR-009H, FR-016, FR-017, FR-018, FR-019, FR-042, FR-086, FR-088
- AT: AT-FLOW-004, AT-FLOW-005, AT-FLOW-006, AT-SYNC-005, AT-SYNC-006
- E2E/UT/VR: E2E-FLOW-001, E2E-FLOW-002, E2E-FLOW-003, E2E-SYNC-002, E2E-SYNC-006, VR-HOME-001〜VR-HOME-004（`../50_quality/test-link-index.md` 参照）
- CAP: `../30_capabilities/CAP-SYNC-001.md`, `../30_capabilities/CAP-SNAPSHOT-001.md`, `../30_capabilities/CAP-CSV-IMPORT-001.md`

## 12. 画面機能要件（ローカルID）

- 採番規則: `<文書ID>-FR-yy`（yyはこの文書内連番）
- 旧FR IDは括弧内に残し、移行トレーサビリティを保持します。

- SCR-001-HOME-FR-01: (旧: FR-001) 複数手技テンプレート一覧を表示します。
- SCR-001-HOME-FR-02: (旧: FR-002) テンプレートごとに名称、版、有効開始日を表示します。
- SCR-001-HOME-FR-03: (旧: FR-003) 選択した1手技でセッションを開始します。
- SCR-001-HOME-FR-04: (旧: FR-004) 手技開始通知は本アプリ対象外とし、Mac/iPhoneの時計アプリ等の外部アラームで運用します。
- SCR-001-HOME-FR-05: (旧: FR-004A) ホームに「手技開始通知は外部アラーム運用」の注記を表示します。
- SCR-001-HOME-FR-06: (旧: FR-005) ホームには手技開始情報に加え、当日分のみCAPD記録ノート互換表を表示します（過去分は一覧画面で表示）。
- SCR-001-HOME-FR-07: (旧: FR-005A) ホームAの先頭見出しは日付と曜日を表示し、手技スロットと当日ノート表は同一パネル内に配置します。
- SCR-001-HOME-FR-08: (旧: FR-006) ホームから「記録一覧」画面へ遷移できる導線を提供します。
- SCR-001-HOME-FR-09: (旧: FR-007) ホームAスパイクでは、1日あたり4件の手技スロットを横並びで表示します。
- SCR-001-HOME-FR-10: (旧: FR-008) 手技スロットの初期状態は「`+` のみ表示」とし、`+` 押下で手技設定モーダル（CSV選択、推奨実施時間）を開きます。
- SCR-001-HOME-FR-11: (旧: FR-009A) 右上 `•••` メニューから「確認/編集」を開きます。確認モーダルは閲覧専用とし、ここからの「開始/再開」は手順表示のみ（確認モード）とします。確認モードでは記録保存、タイマー開始、通知ジョブ生成、アラーム設定、スロット/セッション状態更新、同期対象更新を行いません。
- SCR-001-HOME-FR-12: (旧: FR-009B) 手技スロットの表示状態は `未登録(+)` / `未実施` / `実施中` / `実施済み` とします。`実施済み` のカード本体タップは無効化します。
- SCR-001-HOME-FR-13: (旧: FR-009C) スロット登録時は、右隣スロットほど推奨実施時間が遅くなるように検証します（左から右へ厳密昇順、同時刻不可）。
- SCR-001-HOME-FR-14: (旧: FR-009D) 右側スロットの開始時は、左側スロットがすべて `実施済み` であることを必須条件にします（未登録/未実施が1件でもあれば開始不可）。
- SCR-001-HOME-FR-15: (旧: FR-009E) 4スロット設定は `dateLocal` 単位でローカル永続化し、同期時に `localRevision` と `cloudRevision` を更新します。
- SCR-001-HOME-FR-16: (旧: FR-009F) `実施済み` スロットは編集/削除不可とします。同一端末で進行中セッションがある間は全スロット編集を禁止します。
- SCR-001-HOME-FR-17: (旧: FR-009G) `実施中` スロットをタップした場合は新規開始せず、進行中セッションを再開します。
- SCR-001-HOME-FR-18: (旧: FR-009H) 記録やタイマーを伴う実運用セッション開始/再開はカード本体タップ導線で実行し、`••• > 確認` 導線は閲覧専用（確認モード）とします。
- SCR-001-HOME-FR-19: (旧: FR-016) 当日ノート表と記録一覧の交換列は `#1〜#5` の5列固定とし、列位置は `*_exchange_no` で決定します。
- SCR-001-HOME-FR-20: (旧: FR-017) 透析液濃度欄は、取り込みCSVのタイトル（例: `レギニュール1.5`）を表示します。
- SCR-001-HOME-FR-21: (旧: FR-018) `record_event` の値は `record_exchange_no` で列マッピングし、`drain_weight_g` は排液量、`bag_weight_g` は注液量、`drain_appearance` は排液の確認に表示します。
- SCR-001-HOME-FR-22: (旧: FR-019) `timer_event` の値は `timer_exchange_no` で列マッピングし、`timer_segment=dwell` の `start/end` は貯留時間、`timer_segment=drain` の `start/end` は排液時間に表示します。
- SCR-001-HOME-FR-23: (旧: FR-042) 廃液の記録写真（`drain`）は任意入力です。
- SCR-001-HOME-FR-24: (旧: FR-086) 手動同期ボタンを提供し、失敗時は再試行導線を表示します。
- SCR-001-HOME-FR-25: (旧: FR-088) 同期失敗時は直近同期状態（成功/失敗）を更新し、再試行導線を表示します。
