# UI Preview Mockups

## ファイル一覧
- `index.html`
- `home-a.html`
- `history-list.html`
- `session-a.html`
- `style.css`

## 利用方法
- 現在は静的モックとして配置しています。
- `python -m http.server` でも `/ui-preview/*` パスで開けるように、`ui-preview/` 配下にルーティング用 `index.html` を配置しています。
- Next.js実装版（`/Users/sakanet/capd_navi/ui-preview-app`）が最新仕様です。静的モックと差分がある場合は Next.js 実装版を優先します。
- Next.js実装時は次のルートへ対応させます。

| ルート | モック |
|---|---|
| `/ui-preview/home-a` | `home-a.html` |
| `/ui-preview/history-list` | `history-list.html` |
| `/ui-preview/session-a` | `session-a.html` |

補足:
- `/ui-preview/status-patterns` は Next.js 実装版のみで提供します（静的モックは未作成）。
