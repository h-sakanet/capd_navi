# capd-app

CAPD支援アプリの実装用 Next.js アプリです。UIスパイク資産（`/ui-preview`）は参照専用です。

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
- http://localhost:5181/ui-preview（参照専用案内）

## ドキュメント可視化
```bash
cd /Users/sakanet/capd_navi/capd-app
npm run docs:map
npm run docs:map:check
```

主な生成物:
- `/Users/sakanet/capd_navi/docs/generated/index.md`
- `/Users/sakanet/capd_navi/docs/generated/html/index.html`（JRN起点のHTMLナビ入口）

注記:
- `docs:map` は Markdown/JSON/HTML を生成します。
- `docs:map:check` は整合性チェックのみを実行し、HTMLは生成しません。
