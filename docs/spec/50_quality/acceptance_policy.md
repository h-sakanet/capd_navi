# Acceptance Policy

## 1. 目的
受入条件（GWT）と実行テスト（E2E/Unit/Visual）の責務境界を固定します。

## 2. ポリシー
- `SCR-*` は受入観点（GWT）を一次仕様として保持します。
- 実行ケースID、実行手順、結果管理は `test/specs/*` を正本とします。
- `AT-*` は必ず1つ以上のE2Eに接続します。

## 3. Phase運用
- Phase1必須ATはDeferred禁止。
- Phase2対象ATはDeferred許可（着手時にPlannedへ変更）。

## 4. 参照
- `../../../test/specs/traceability-matrix.md`
- `../../../test/specs/e2e-spec.md`
- `../../../test/specs/unit-spec.md`
- `../../../test/specs/visual-spec.md`
