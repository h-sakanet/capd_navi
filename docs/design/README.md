# CAPD設計ドキュメント

全体可視化の入口は `/Users/sakanet/capd_navi/docs/00_navigation.md` を参照してください。

## 読む順番
1. `01_architecture_overview.md`
2. `02_mac_shell_web_boundary.md`
3. `03_stack_decision.md`
4. `04_sync_conflict_policy.md`
5. `05_notifications_sleep.md`
6. `06_photo_backup_export.md`
7. `07_ui_spike_plan.md`
8. `08_ui_standard.md`
9. `11_state_machines.md`
10. `99_impl_handoff.md`

## 実装版UI（本番導線）
`/Users/sakanet/capd_navi/capd-app` に Next.js + shadcn/ui の実装版を配置しています。

起動:
`cd /Users/sakanet/capd_navi/capd-app && npm install && npm run dev -- -p 5181`

Routes:
- `http://localhost:5181/capd/home`
- `http://localhost:5181/capd/history-list`
- `http://localhost:5181/capd/session`
- `http://localhost:5181/ui-preview`（参照専用案内）

## UIスパイク静的モック（参考）
`ui-preview` 配下に静的モックも保持しています。
- `ui-preview/index.html`
- `ui-preview/home.html`
- `ui-preview/history-list.html`
- `ui-preview/session.html`

注記:
- UIの最新仕様は Next.js 実装版（`/Users/sakanet/capd_navi/capd-app`）を正とします。
- `docs/design/ui-preview/*.html` は参考用の旧モックです。本番実装対象は `/capd/*` のみです。
