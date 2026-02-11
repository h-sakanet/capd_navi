# Deletion Gate

## 1. 目的
旧 `docs/requirements`, `docs/design`, `test/specs` の削除可否を機械的に判定する基準を定義します。

## 2. 削除判定基準（全満たし必須）
1. `docs/spec` 側に対象仕様の一次仕様が存在し、リンク切れがない。
2. `docs/spec/50_quality/traceability.md` で `JRN -> SCR/CAP -> FR -> AT -> Test` を辿れる。
3. `docs:map` / `docs:map:check` が成功し `issues: none` を維持する。
4. Phase1必須ATの実行テストが `Implemented` で、`test:e2e` がPassする。
5. 変更レビューで「仕様抜け/重複/矛盾なし」が承認される。

## 3. 削除実行手順
1. 対象文書を `source_mapping.md` で新参照先に紐付け確認。
2. リンク切れ検査を実行。
3. 削除PRに削除理由と代替参照を明記。
4. 削除後に `docs:map` とテスト最小セットを再実行。

## 4. ロールバック方針
- 削除後に欠落が判明した場合は即時復元し、`docs/spec` 側へ補完後に再判定します。
