# UI Preview Mockups

## ファイル一覧
- `index.html`
- `home.html`
- `history-list.html`
- `session.html`
- `style.css`

## 利用方法
- 現在は静的モックとして配置しています。
- `python -m http.server` でも `/ui-preview/*` パスで開けるように、`ui-preview/` 配下にルーティング用 `index.html` を配置しています。
- Next.js実装版（`/Users/sakanet/capd_navi/capd-app`）の本番ルートは `/capd/*` です。静的モックは参照専用です。
- Next.js実装時は次のルートへ対応させます。

| ルート | モック |
|---|---|
| `/ui-preview/home` | `home.html` |
| `/ui-preview/history-list` | `history-list.html` |
| `/ui-preview/session` | `session.html` |

補足:
- `status-patterns` は比較検討用の一時画面として廃止済みです。
