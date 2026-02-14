# capd-app

CAPD支援アプリの実装用 Next.js アプリです。

## 起動
```bash
cd /Users/sakanet/capd_navi/capd-app
npm install
npm run dev -- -p 5181
```

## App URLs
- http://localhost:5181/capd/home
- http://localhost:5181/capd/history-list
- http://localhost:5181/capd/session


## ドキュメント可視化
```bash
cd /Users/sakanet/capd_navi/capd-app
npm run docs:map
npm run docs:map:check
```

## テスト実行
```bash
cd /Users/sakanet/capd_navi/capd-app
npm run test:unit
npm run test:e2e
npm run test:e2e:check
npm run test:e2e:baseline
npm run test:e2e:diff
```

主な生成物:
- `/Users/sakanet/capd_navi/docs/generated/index.md`
- `/Users/sakanet/capd_navi/docs/generated/html/index.html`（JRN起点のHTMLナビ入口）

注記:
- `docs:map` は Markdown/JSON/HTML を生成します。
- `docs:map:check` は整合性チェックのみを実行し、HTMLは生成しません。
