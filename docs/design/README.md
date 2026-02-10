# CAPD設計ドキュメント

## 読む順番
1. `01_architecture_overview.md`
2. `02_mac_shell_web_boundary.md`
3. `03_stack_decision.md`
4. `04_sync_conflict_policy.md`
5. `05_notifications_sleep.md`
6. `06_photo_backup_export.md`
7. `07_ui_spike_plan.md`
8. `08_ui_standard.md`
9. `99_impl_handoff.md`

## UIスパイク実装版（推奨）
`/Users/sakanet/bp_navi/ui-preview-app` に Next.js + shadcn/ui の実装版を配置しています。

起動:
`cd /Users/sakanet/bp_navi/ui-preview-app && npm install && npm run dev -- -p 5181`

Preview:
- `http://localhost:5181/ui-preview/home-a`
- `http://localhost:5181/ui-preview/history-list`
- `http://localhost:5181/ui-preview/session-a`
- `http://localhost:5181/ui-preview/status-patterns`

## UIスパイク静的モック（参考）
`ui-preview` 配下に静的モックも保持しています。
- `ui-preview/index.html`
- `ui-preview/home-a.html`
- `ui-preview/history-list.html`
- `ui-preview/session-a.html`

注記:
- UIの最新仕様は Next.js 実装版（`/Users/sakanet/bp_navi/ui-preview-app`）を正とします。
- `docs/design/ui-preview/*.html` は参考用の旧モックを含むため、差分がある場合は Next.js 実装版を優先します。
