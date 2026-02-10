# Unit Test Specification

## 1. 目的
本書は、TDDで先行実装するUnitテストの正本です。  
対象は純粋ロジックとローカル永続化境界に限定し、UI描画差分は扱いません。

## 2. 対象モジュール（固定）
1. `/Users/sakanet/capd_navi/capd-app/lib/protocol-csv.ts`
2. `/Users/sakanet/capd_navi/capd-app/components/capd/session-slot-store.ts`
3. `/Users/sakanet/capd_navi/capd-app/components/capd/mock-data.ts`

実装順序:
1. `protocol-csv.ts`
2. `session-slot-store.ts`
3. `mock-data.ts`

## 3. 共通ルール
- テストIDは `UT-*` を使用します。
- 1テスト1責務で記述します。
- `session-slot-store.ts` のテストでは `window.localStorage` をモックし、ケースごとに初期化します。
- エラーメッセージは現仕様の文言を厳密一致で検証します。

## 4. テストケース一覧

### 4.1 `protocol-csv.ts`
| テストID | 対象関数 | 入力/前提 | 期待結果 |
|---|---|---|---|
| UT-CSV-001 | `parseProtocolCsv` | 正常CSV（`meta` + `step` 複数行） | `ProtocolStep[]` を返し、`sequenceNo` 昇順で整列される |
| UT-CSV-002 | `parseProtocolCsv` | ヘッダー/データ不足（1行未満） | `Error(\"CSVにヘッダー/データ行がありません。\")` |
| UT-CSV-003 | `parseProtocolCsv` | `row_type` 列なし | `Error(\"CSV v3の必須列 row_type がありません。\")` |
| UT-CSV-004 | `parseProtocolCsv` | `meta` の必須キー欠落（`format_version` など） | `Error(\"CSV v3の必須meta_keyが不足しています: <key>\")` |
| UT-CSV-005 | `parseProtocolCsv` | `format_version != 3` | `Error(\"format_versionは3のみ対応です。\")` |
| UT-CSV-006 | `parseProtocolCsv` | `step` 行なし | `Error(\"CSVにstep行がありません。\")` |
| UT-CSV-007 | `parseProtocolCsv` | `必須チェック` に改行を含む値 | `requiredChecks` が改行分割され、空文字が除去される |
| UT-CSV-008 | `parseProtocolCsv` | セル内エスケープ引用符（`\"\"`）含有 | 値が正しくデコードされる |
| UT-CSV-009 | `parseProtocolCsv` | `alarm_duration_min` 空文字 | `alarmDurationMin === null` |
| UT-CSV-010 | `parseProtocolCsv` | `alarm_duration_min` 非数値（例: `abc`） | `alarmDurationMin === 0`（現実装仕様） |
| UT-CSV-011 | `parseProtocolCsv` | `step_id` 空の `step` 行を含む | 当該行は無視され、有効行のみ結果に含まれる |

### 4.2 `session-slot-store.ts`
| テストID | 対象関数 | 入力/前提 | 期待結果 |
|---|---|---|---|
| UT-SLOT-001 | `readProcedureSlots` | localStorage未設定 | `defaultProcedureSlots` 相当（4要素、全`null`） |
| UT-SLOT-002 | `readProcedureSlots` | 不正JSON | 例外を投げず `defaultProcedureSlots` を返す |
| UT-SLOT-003 | `readProcedureSlots` | 配列長が4以外 | `defaultProcedureSlots` を返す |
| UT-SLOT-004 | `readProcedureSlots` | 要素の型不正を含む配列 | 不正要素は `null` に正規化される |
| UT-SLOT-005 | `writeProcedureSlots` + `readProcedureSlots` | 正常スロットを書き込み後に読み取り | 書き込み値が復元される |
| UT-SLOT-006 | `readActiveSession` | localStorage未設定 | `null` |
| UT-SLOT-007 | `readActiveSession` | `slotIndex` が範囲外（-1, 4, 999） | `null` |
| UT-SLOT-008 | `writeActiveSession` + `readActiveSession` | 正常値を書き込み後に読み取り | 同一内容が復元される |
| UT-SLOT-009 | `clearActiveSession` | active session あり | 削除後 `readActiveSession() === null` |
| UT-SLOT-010 | `createSessionId` | `slotIndex=0` | `ses_1_<timestamp>` 形式 |
| UT-SLOT-011 | `readProcedureSlots` | `window` 未定義（SSR相当） | 例外を投げず `defaultProcedureSlots` を返す |
| UT-SLOT-012 | `readActiveSession` | `window` 未定義（SSR相当） | `null` |

### 4.3 `mock-data.ts`
| テストID | 対象関数 | 入力/前提 | 期待結果 |
|---|---|---|---|
| UT-UF-001 | `calculateExchangeUfG` | `exchangeIndex=0` | `null`（#1は未計算） |
| UT-UF-002 | `calculateExchangeUfG` | #2以降の正常データ | `drainWeightG - previousInfuseWeightG` |
| UT-UF-003 | `calculateExchangeUfG` | 範囲外index | `null` |
| UT-UF-004 | `calculateDailyUfTotalG` | 正常ノート | #1を除外したUF合計値 |
| UT-UF-005 | `calculateDailyDrainTotalG` | 正常ノート | `drainWeightG` 総和 |
| UT-UF-006 | `calculateDailyInfuseTotalG` | 正常ノート | `infuseWeightG` 総和 |
| UT-UF-007 | `findFirstPhotoId` | `photoId` あり | 最初の `photoId` を返す |
| UT-UF-008 | `findFirstPhotoId` | `photoId` なし | `null` |

## 5. 必須fixture
基準ディレクトリを `/Users/sakanet/capd_navi/test/fixtures` に固定します。
- `fixtures/unit/protocol/valid-min.csv`
- `fixtures/unit/protocol/missing-row-type.csv`
- `fixtures/unit/protocol/missing-meta-format-version.csv`
- `fixtures/unit/protocol/invalid-format-version.csv`
- `fixtures/unit/protocol/no-step.csv`
- `fixtures/unit/protocol/multiline-required-checks.csv`
- `fixtures/unit/protocol/escaped-quotes.csv`

fixtures は deterministic に固定し、テストケース間で共有する場合でも入力値の変更を禁止します。

## 6. 実装上の注意
- `UT-CSV-010` は現行実装（非数値を0に変換）を仕様として固定しています。  
  仕様変更する場合は要件と本書を先に改訂してください。
- `session-slot-store.ts` は `isBrowser()` に依存するため、SSR相当テストでは `window` 未定義ケースも含めます。
