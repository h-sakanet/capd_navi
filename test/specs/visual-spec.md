# Visual Regression Specification (Playwright)

## 1. 目的
本書は、将来のコード変更時にUI退行を検出するためのスクリーンショット回帰仕様です。  
`playwright-visual-regression` の運用に従い、`baseline -> check -> diff` のループを固定します。

## 2. 対象ルート
- `/ui-preview/home-a`
- `/ui-preview/session-a`
- `/ui-preview/history-list`
- `/ui-preview/status-patterns`

## 3. 撮影条件（固定）
- ビューポート:
  - Desktop: `1280x800`
  - Mobile: `390x844`
- タイムゾーン: `Asia/Tokyo`
- ロケール: `ja-JP`
- 乱数依存禁止（fixture固定）
- 動的要素（時刻等）がある場合はmask対象に明示します。

## 4. スナップショットケース一覧
| VR ID | 画面 | 状態 | Viewport | 期待 |
|---|---|---|---|---|
| VR-HOME-001 | Home A | 初期表示（#1-#4スロット表示） | Desktop | レイアウト崩れなし |
| VR-HOME-002 | Home A | スロット設定モーダル表示 | Desktop | モーダル位置/幅が安定 |
| VR-HOME-003 | Home A | 開始確認モーダル表示 | Mobile | ボタン配置が仕様どおり |
| VR-HOME-004 | Home A | 左未完了で右開始不可表示 | Desktop | ブロック文言が視認可能 |
| VR-SESSION-001 | Session A | 初期ステップ表示 | Desktop | 2カラム表示維持 |
| VR-SESSION-002 | Session A | 初期ステップ表示 | Mobile | 1カラム表示維持 |
| VR-SESSION-003 | Session A | 記録モーダル表示 | Mobile | 入力UIが表示崩れしない |
| VR-SESSION-004 | Session A | 非常中断確認ダイアログ表示 | Desktop | ダイアログ表示安定 |
| VR-HISTORY-001 | History | 記録一覧表示 | Desktop | 列崩れなし |
| VR-HISTORY-002 | History | 記録一覧表示 | Mobile | 横スクロール時表示崩れなし |
| VR-STATUS-001 | Status Patterns | 一覧表示 | Desktop | 全パターン表示維持 |

## 5. baseline運用ルール
- baseline更新は「意図したUI変更」のみ許可します。
- baseline更新時は変更理由をPR/報告に必須記載します。
- 不具合未分類のまま baseline を更新してはいけません。

## 6. 差分トリアージ手順
1. `check` 実行で失敗ケースを特定
2. `test-results` と `playwright-report` で差分確認
3. 原因分類:
   - テスト不備
   - データ非決定性
   - 意図しないUI退行
   - 意図したUI変更
4. 対応:
   - 意図しないUI退行: 実装修正
   - 意図したUI変更: baseline更新

## 7. コマンド契約（実装フェーズ）
- `test:e2e:baseline`: baseline更新
- `test:e2e:check`: 差分検査
- `test:e2e:diff`: 差分artifact収集

## 8. 成果物契約
- baseline: `*-snapshots`
- レポート: `playwright-report`
- 失敗artifact: `test-results`

## 9. 非対象
- パフォーマンス計測
- ピクセル完全一致を要しないアニメーション中間フレーム
