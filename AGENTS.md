# AGENTS.md

## 1. 目的
本ファイルは、CAPD支援アプリにおけるTDD（テスト駆動開発）の実行規約を固定するための運用文書です。  
実装担当・試験担当は、本書と `/Users/sakanet/capd_navi/test/specs` を正本として扱います。

## 2. 適用範囲
- 対象リポジトリ: `/Users/sakanet/capd_navi`
- 対象フェーズ: 実装開始後のテストコード作成、実装、回帰確認
- 対象レイヤー: Unit / E2E (Playwright) / Visual Regression (Playwright)

## 3. 必読ドキュメント
- `/Users/sakanet/capd_navi/docs/requirements/05_functional_requirements.md`
- `/Users/sakanet/capd_navi/docs/requirements/07_acceptance_tests.md`
- `/Users/sakanet/capd_navi/docs/design/04_sync_conflict_policy.md`
- `/Users/sakanet/capd_navi/test/specs/unit-spec.md`
- `/Users/sakanet/capd_navi/test/specs/e2e-spec.md`
- `/Users/sakanet/capd_navi/test/specs/visual-spec.md`
- `/Users/sakanet/capd_navi/test/specs/traceability-matrix.md`

## 4. TDD運用原則（固定）
1. Red: まず失敗するテストを最小単位で追加します。
2. Green: テストを通す最小実装のみ追加します。
3. Refactor: すべてのテストが緑のままコードを整理します。
4. 1ケースずつ完結させ、複数ケースを同時着手しません。
5. コンパイル不能状態を長時間維持しません。  
   テストコード追加後は、できるだけ早く「実行可能な失敗テスト（Red）」へ移行します。

## 5. テストレイヤー責務
- Unit:
  - 純粋ロジック、変換、検証、計算、永続化境界（localStorage復帰）を検証します。
  - 外部依存はモックし、1テスト1責務で記述します。
- E2E:
  - ユーザー導線と受入要件（`AT-*`）の成立を検証します。
  - 安定セレクタ（role/name優先）で操作します。
- Visual Regression:
  - 主要画面の見た目回帰を検知します。
  - baseline更新は意図変更時のみ許可します。

## 6. テスト運用I/F契約（実行場所固定）
テスト実行の作業ディレクトリは `/Users/sakanet/capd_navi/ui-preview-app` とし、同ディレクトリの `package.json` を唯一の実行I/Fとします。  
実装フェーズで以下 script 名を必須契約とします。

- `test:unit`
- `test:e2e`
- `test:e2e:check`
- `test:e2e:baseline`
- `test:e2e:diff`

TDD開始前ゲート:
- 上記 script が `package.json` に存在しない状態では、テストケース実装・実装着手を開始しません。
- 不足している場合は、最初の作業で script を追加してから Red に入ります。

成果物ディレクトリ契約:

- `*-snapshots`（baseline）
- `playwright-report`（HTMLレポート）
- `test-results`（失敗時artifact）

## 7. テスト状態契約
`traceability-matrix` の `状態` 列は以下のみ使用します。
- `Planned`: 仕様は定義済み、テストコード未作成
- `Executable`: 現行実装/環境で実行可能（テストコード作成後は通常スイートに含める）
- `Implemented`: テストコード作成済み・定常実行対象
- `Deferred`: 依存I/Fや実行環境未整備のため保留（仕様とトレーサビリティのみ先行管理）

運用ルール:
- `Executable` / `Implemented` のテストを `skip/disable` で回避してはいけません。
- `Deferred` はテストコードを無理に作成せず、仕様書と `traceability-matrix` で管理します。
- 依存条件が満たされたら `Deferred -> Executable` へ更新してから着手します。

## 8. テストID契約
- Unit: `UT-*`
- E2E: `E2E-*`（`AT-*` と必ず紐付ける）
- 受入要件ID: `AT-*`（要件/受入側の識別子として使用）
- Visual: `VR-*`
- `TODO-E2E-*` のような暫定接頭辞IDは禁止し、未実装は `状態=Deferred` で表現します。

`/Users/sakanet/capd_navi/test/specs/traceability-matrix.md` に、要件IDとの対応を「1行1ケース（1テストID）」で管理します。

## 9. Playwright運用規約
- deterministicデータを必須にします。
- ランダム依存のアサーションを禁止します。
- セレクタは role/name を優先し、曖昧箇所のみ `data-testid` を導入します。
- Visual差分が出た場合は、次の順で処理します。
  1. テストバグかUI変更かを分類
  2. UIバグなら修正して再実行
  3. 意図変更のみ baseline 更新

## 10. 禁止事項
- 失敗テストのskip/disableでの回避
- 原因分類前のbaseline更新
- 要件にないアサーションの追加
- 仕様と無関係な大規模リファクタを同時混在
- `AT-*` 未接続のE2Eケース追加

## 11. 完了条件（DoD）
- 変更対象のUnitテストがすべて通過していること
- 該当するE2Eケースが通過していること
- Visual差分が意図変更として説明可能であること
- `traceability-matrix` が「1行1ケース」「正しい状態遷移（Planned/Executable/Implemented/Deferred）」で更新されていること
- テスト実行結果と未解決事項を作業報告に明記していること

## 12. 実装担当の報告フォーマット
- 変更ファイル一覧
- 追加/更新したテストケースID一覧（UT/E2E/VR）
- 実行コマンドと結果（Pass/Fail）
- 未対応ケース（理由と次アクション）
