# Mock Data Replacement Plan (Phase1)

## 1. 目的
`/capd/*` 本番ルートから `mock-data.ts` 正本依存を排除し、仕様どおりに「初期空状態 -> 実データ反映」へ移行するための置換方針を固定します。

## 2. 依存洗い出し結果
- 置換前依存:
  - `capd-app/app/capd/home/page.tsx`
  - `capd-app/components/capd/today-capd-note-table.tsx`
  - `capd-app/components/capd/history-records-table.tsx`
- 置換後:
  - 上記3ファイルの `mock-data.ts` 参照を削除済み
  - `/capd/*` 本番ルート配下の `mock-data` 参照は 0 件

## 3. 置換方針（データ源）
1. スロット表示:
   - `DailyProcedurePlan`（現行実装は `session-slot-store.ts` を補助キャッシュとして使用）
2. 当日ノート/履歴:
   - `records`, `timer_event`, `photoRefs` を正本想定
   - 現段階は `capd-note-store.ts`（`capd-support:daily-notes:v1`）で読み込み
3. テンプレート:
   - CSV取込の `ProtocolPackage` を起点
4. 同期反映:
   - `push/pull`、必要時 `full_reseed`

## 4. 実装メモ
- 型/計算ロジックは `capd-note-model.ts` へ分離し、`mock-data.ts` を本番表示データ源として使わない構成に変更。
- Home/History はデータ未投入時に空表示（`表示できる記録がありません。`）を返す。
- 初期状態検証として `E2E-HOME-001` を追加し、`AT-UI-HOME-002` に接続。
