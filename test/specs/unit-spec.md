# Unit Test Specification

## 1. 目的
Phase1のCSV駆動セッション基盤を、ロジック単位で固定化するUnitテスト仕様です。

## 2. 対象モジュール
1. `/Users/sakanet/capd_navi/capd-app/lib/storage/capd-db.ts`
2. `/Users/sakanet/capd_navi/capd-app/lib/protocol-csv.ts`
3. `/Users/sakanet/capd_navi/capd-app/lib/csv-import.ts`
4. `/Users/sakanet/capd_navi/capd-app/lib/services/session-service.ts`
5. `/Users/sakanet/capd_navi/capd-app/lib/services/home-note-query.ts`
6. `/Users/sakanet/capd_navi/capd-app/lib/storage-admin.ts`
7. `/Users/sakanet/capd_navi/capd-app/components/capd/session-slot-store.ts`
8. `/Users/sakanet/capd_navi/capd-app/components/capd/capd-note-model.ts`

## 3. 共通ルール
- テストIDは `UT-*`。
- 1テスト1責務。
- `session-service` / `home-note-query` は repository 層をモックし、入出力契約を固定する。
- エラー文言は仕様定義済み文言のみ厳密一致で検証する。

## 4. テストケース一覧

### 4.1 DBスキーマ
| テストID | 対象 | 期待結果 |
|---|---|---|
| UT-DB-001 | `capd-db.ts` | DB名/version/store一覧がPhase1契約どおり |

### 4.2 CSV取込
| テストID | 対象 | 期待結果 |
|---|---|---|
| UT-CSV-001 | `parseProtocolCsv` | 正常CSVをstep配列へ変換 |
| UT-CSV-002 | `parseProtocolCsv` | `step_id` 重複をエラー中止 |
| UT-CSV-004 | `parseProtocolCsv` | 旧ヘッダー（meta列含む）を拒否 |
| UT-CSV-006 | `parseProtocolCsv` | `next_step_id` 不整合をエラー中止 |
| UT-CSV-008 | `normalizeImageList` | 画像一覧を正規化 |
| UT-CSV-011 | `validateCsvImport` | CSV解析結果と参照画像一覧を返す |
| UT-CSV-012 | `parseProtocolCsv` | `必須チェック数` 欠落ヘッダーを拒否 |
| UT-CSV-013 | `collectDirectChildFiles` | フォルダ直下ファイルのみ抽出 |
| UT-CSV-014 | `validateReferencedImages` | 参照画像と不足画像を分類 |
| UT-CSV-015 | `validateReferencedImages` | 一致画像のみ保存対象へ抽出 |

### 4.3 セッションサービス
| テストID | 対象 | 期待結果 |
|---|---|---|
| UT-SESSION-001 | `startSessionFromSlot` | テンプレート未登録時に開始失敗 |
| UT-SESSION-002 | `startSessionFromSlot` | session/snapshot保存 + slot実施中反映 |
| UT-SESSION-003 | `resolveSessionStepImage` | `protocolId + assetKey` で画像Blob解決 |
| UT-TIMER-001 | `advanceStep` | ACT-001成功時にtimer_event + timer_end alarm生成 |
| UT-TIMER-002 | `advanceStep` | timer dedupe時にアラーム重複生成なし |
| UT-ALARM-001 | `ensureStepEnterAlarm` | step_enter初回表示でアラーム生成 |
| UT-ALARM-002 | `ensureStepEnterAlarm` | dedupe時は既存ジョブを返す |

### 4.4 Homeノート集計
| テストID | 対象 | 期待結果 |
|---|---|---|
| UT-HOME-001 | `readTodayHomeNote` | completedセッション無しで `null` |
| UT-HOME-002 | `readTodayHomeNote` | `records + timer_events` から当日ノート生成 |

### 4.5 ストレージ管理画面
| テストID | 対象 | 期待結果 |
|---|---|---|
| UT-STORAGE-001 | `listStoragePreview` | localStorage一覧取得 |
| UT-STORAGE-002 | `listStoragePreview` | JSON整形/非JSON raw表示 |
| UT-STORAGE-003 | `listStoragePreview` | IndexedDB DB/storeメタ列挙 |
| UT-STORAGE-004 | `deleteStorageTargets` | 指定キーのみ削除 |
| UT-STORAGE-005 | `clearAllStorage` | localStorage + IndexedDB 全削除 |

### 4.6 セッションスロット補助キャッシュ
| テストID | 対象 | 期待結果 |
|---|---|---|
| UT-SLOT-001 | `readProcedureSlots` | localStorage未設定で4スロット空配列を返す |
| UT-SLOT-002 | `readProcedureSlots` | 不正JSON時も安全にデフォルト復帰 |
| UT-SLOT-003 | `readProcedureSlots` | 配列長不正時にデフォルト復帰 |
| UT-SLOT-004 | `readProcedureSlots` | 不正要素を `null` 正規化 |
| UT-SLOT-005 | `writeProcedureSlots/readProcedureSlots` | 書込値を復元できる |
| UT-SLOT-006 | `readActiveSession` | 未設定で `null` |
| UT-SLOT-007 | `readActiveSession` | `slotIndex` 範囲外を拒否 |
| UT-SLOT-008 | `writeActiveSession/readActiveSession` | 書込値を復元できる |
| UT-SLOT-009 | `clearActiveSession` | 削除後に `null` |
| UT-SLOT-010 | `createSessionId` | `ses_<slotNo>_<timestamp>` 形式を返す |
| UT-SLOT-011 | `readProcedureSlots` | SSR相当（`window`未定義）で安全に実行 |
| UT-SLOT-012 | `readActiveSession` | SSR相当（`window`未定義）で `null` |

### 4.7 UF計算ユーティリティ
| テストID | 対象 | 期待結果 |
|---|---|---|
| UT-UF-001 | `calculateExchangeUfG` | #1交換は `null` |
| UT-UF-002 | `calculateExchangeUfG` | #2以降のUFを計算 |
| UT-UF-003 | `calculateExchangeUfG` | 範囲外indexで `null` |
| UT-UF-004 | `calculateDailyUfTotalG` | 1日総除水量を計算 |
| UT-UF-005 | `calculateDailyDrainTotalG` | 1日総排液量を計算 |
| UT-UF-006 | `calculateDailyInfuseTotalG` | 1日総注液量を計算 |
| UT-UF-007 | `findFirstPhotoId` | 最初の `photoId` を返す |
| UT-UF-008 | `findFirstPhotoId` | 写真なしで `null` |

## 5. 実行コマンド
- `/Users/sakanet/capd_navi/capd-app` で `npm run test:unit`
