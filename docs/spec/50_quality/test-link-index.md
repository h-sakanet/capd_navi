# Test Link Index

## 1. テスト仕様（正本）
- `../../../test/specs/unit-spec.md`
- `../../../test/specs/e2e-spec.md`
- `../../../test/specs/visual-spec.md`
- `../../../test/specs/traceability-matrix.md`

## 2. 実行I/F
作業ディレクトリ: `capd-app`

- `npm run test:unit`
- `npm run test:e2e`
- `npm run test:e2e:check`
- `npm run test:e2e:baseline`
- `npm run test:e2e:diff`

## 3. レビュー導線
1. `traceability-matrix` で対象ATを確認
2. 対応 `E2E-*` を確認
3. 参照 `SCR-*` のGWTと突合
