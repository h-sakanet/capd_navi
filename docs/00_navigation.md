# 00. ドキュメントナビゲーション

## 1. 目的
ドキュメント群の整合性・一貫性・網羅性を、人間が短時間でレビューできる入口を提供します。

## 2. 可視化の使い方
生成コマンド（実行ディレクトリ固定: `/Users/sakanet/capd_navi/capd-app`）:

```bash
npm run docs:map
```

整合性チェック（P0指摘がある場合は非0終了）:

```bash
npm run docs:map:check
```

## 3. 生成物
- `/Users/sakanet/capd_navi/docs/generated/index.md`
- `/Users/sakanet/capd_navi/docs/generated/overview.md`
- `/Users/sakanet/capd_navi/docs/generated/traceability.md`
- `/Users/sakanet/capd_navi/docs/generated/consistency-report.md`
- `/Users/sakanet/capd_navi/docs/generated/journeys/*.md`
- `/Users/sakanet/capd_navi/docs/generated/screens/*.md`
- `/Users/sakanet/capd_navi/docs/generated/graph.json`
- `/Users/sakanet/capd_navi/docs/generated/html/index.html`
- `/Users/sakanet/capd_navi/docs/generated/html/journeys/JRN-*.html`
- `/Users/sakanet/capd_navi/docs/generated/html/screens/SCR-*.html`
- `/Users/sakanet/capd_navi/docs/generated/html/ids/FR-*.html`
- `/Users/sakanet/capd_navi/docs/generated/html/ids/AT-*.html`
- `/Users/sakanet/capd_navi/docs/generated/html/sources/docs/**/*.html`
- `/Users/sakanet/capd_navi/docs/generated/html/sources/test/specs/**/*.html`

`npm run docs:map:check` は整合性判定のみを実行し、HTML生成は行いません。

## 4. レビューの順序
1. `generated/html/index.html` を開き、JRN起点レビューへ入る
2. `generated/consistency-report.md` でP0/P1を確認
3. 対象 `JRN-*` のHTMLページから `FR/AT` 詳細へ遷移
4. `FR/AT` 詳細から原文HTML（`sources/...`）へ遷移し定義行を確認
5. `generated/traceability.md` で FR -> AT -> Test の抜け漏れ確認
