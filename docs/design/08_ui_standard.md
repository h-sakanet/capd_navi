# 08. UI標準（デザインルール/コンポーネント規約）

## 1. デザイン原則
- 安全優先: 警告・アラームは常に最上位視認
- 誤操作抑止: ブロック条件は状態と理由を明示
- 再開容易性: 現在地（フェーズ/状態/ステップ）を常時表示
- 低負荷操作: 主要操作は親指到達域に配置
- 一貫実装: コンポーネントは `shadcn/ui` を基盤に構成する

## 2. デザイントークン
- トークン正本は `/Users/sakanet/capd_navi/ui-preview-app/app/globals.css` の `:root` とします。差分がある場合は実装版を優先します。

### 2.1 カラー
- `--color-bg`: `hsl(240 4.8% 95.9% / 0.3)`（ページ背景）
- `--color-surface`: `hsl(0 0% 100%)`
- `--color-text`: `hsl(240 10% 3.9%)`
- `--color-primary`: `hsl(240 5.9% 10%)`
- `--color-warning`: `hsl(38 92% 50%)`（警告バナー等のセマンティック色）
- `--color-danger`: `hsl(0 84.2% 60.2%)`
- `--color-info`: `hsl(210 66% 42%)`（補助情報のセマンティック色）

### 2.2 余白
- `--space-1`: 4px
- `--space-2`: 8px
- `--space-3`: 12px
- `--space-4`: 16px
- `--space-5`: 24px
- `--space-6`: 32px

### 2.3 タイポ
- Font: `"Inter", "Hiragino Sans", "Noto Sans JP", sans-serif`
- `--font-title`: 24px/700
- `--font-h2`: 20px/700
- `--font-body`: 16px/500
- `--font-caption`: 13px/500

### 2.4 形状
- `--radius-card`: `0.5rem`
- `--radius-button`: `0.5rem`
- `--shadow-card`: `0 1px 2px rgba(0,0,0,0.05)`（`shadow-sm` 相当）

## 3. コンポーネント規約
- Header: 画面タイトル + 同期状態を表示
- StepCard: タイトル、画像、本文、警告帯を保持
- WarningBand: 高コントラスト固定、画面上部優先
- AlarmBanner: 確認操作まで非消去
- CheckList: 必須完了前は遷移ボタンを無効化
- RecordModal: 必須/任意ラベル明示
- HistoryRow: 日付、テンプレート名、状態、編集導線を固定
- DailyProcedureSlot: `#1〜#4` 固定スロット。未登録時は中央 `+` のみ表示
- DailyProcedureSlotAction: 登録済みカードは本体タップを開始操作に固定し、右上 `•••` から補助操作（確認/編集）を開く
- DailyProcedureSlotStatus: スロット表示は `未登録(+)` / `未実施` / `実施中` / `実施済み`。内部状態は `empty` / `planned(activeSessionId有無)` / `completed` に対応し、`実施中` は再開操作、`実施済み` は開始不可とする
- DailyProcedureSlotValidation: 推奨実施時間は左から右へ厳密昇順（同時刻不可）。右側スロット開始時は左側がすべて実施済みであること
- DailyCapdNoteTable: 当日分のみ、CAPD記録ノート互換レイアウト（交換列 `#1〜#5` + 日次サマリ）を表示
- DailyCapdNoteTableMapping: 記録系行は `record_exchange_no`、時間系行は `timer_exchange_no` で列決定する
- DailyCapdNoteTableDensity: ノート表は縦方向を圧縮し、セル余白は `py-1.5` を基準とする
- DailyCapdNoteTableUFRules: 交換#1の除水量は `未計算`、交換#2以降は `排液量-前回注液量`、総除水量は計算可能分のみ合算
- ProcedureSetupModal: CSV選択、推奨実施時間を1モーダルで編集
- ProcedureStartConfirmModal: 「手技の開始」確認用。開始確定前の確認用途
- ProcedureConfirmModal: 手技内容の閲覧専用。確認モードの「開始/再開」は手順表示のみで、記録保存/タイマー開始/通知生成/状態更新/DB更新を行わない
- NotificationTestAction: 30秒通知テストは手動実行（通知設定変更時/OS更新後/通知不調時）とし、毎日必須運用にはしない
- SessionSummaryModal: 最初完了セッションでは血圧上/下・体重・脈拍・体温・出口部状態を必須にする。出口部状態は複数選択チェックボックス（`正常/赤み/痛み/はれ/かさぶた/じゅくじゅく/出血/膿`）で入力する
- ExitSitePhotoAction: `session_summary.payload.exit_site_photo` を編集する操作行。表示状態は `未登録=登録`、`登録済み=変更/削除` とし、1枚固定で扱う
- ExitSitePhotoActionVisibility: 表示条件は当日 `summaryScope=both` または `summaryScope=first_of_day` の `session_summary` 入力完了後。対象レコードは `both` 優先、次に `first_of_day`、同値時は `completedAt` 昇順、さらに同値時は `recordId` 昇順で決定する
- ExitSitePhotoActionPlatform: iPhoneホーム全体サマリとiPhone記録詳細のみ `登録/変更/削除` を許可し、Macは閲覧のみ許可する
- SessionStateBadge: Compact Badge（Pattern A）を採用。`お腹-独立=slate`、`お腹-接続=emerald`、`お腹→廃液バッグ=amber`、`お腹←透析液バッグ=sky` とする
- SessionStepTitle: タイトルは `#通し番号 + タイトル` 形式（例: `#21 お腹のチューブのクランプを開ける`）
- SessionNavButtons: 「戻る」「次へ」はiPhone/Macとも横並び同幅で配置する
- SessionTransition: 「戻る/次へ/Enter(次へ)」時はメインパネルを左右スライド遷移させる
- SessionTransitionControls: カルーセルの左右ナビゲーションボタンは表示しない
- SessionEmergencyAbort: セッション右上 `•••` に `セッションを中断（非常用）` を配置し、確認ダイアログ後に実行する
- SessionEmergencyAbortResult: 非常中断後はホームへ戻し、該当スロットは `未実施` 表示へ戻す。ホーム上で `前回中断あり` バッジは表示しない
- 実装コンポーネント: `Card`, `Button`, `Badge`, `Dialog`, `Sheet`, `Table`, `Tabs`, `Alert`, `Separator` を優先利用
- アイコン: `MynaUI Icons`（`@mynaui/icons-react`）を使用し、画面内で他アイコンセットを混在させない

## 4. 状態規約
- default: 通常
- empty: まだ手技未設定（`+` で登録可能）
- disabled: 条件未達で操作不可
- error: 入力不正/送信失敗
- alarm: 待機終了通知中
- unsupported: 端末機能未対応

## 5. 文言規約
- 単位は数値直後に表示（例: `120 mmHg`, `500 g`）
- 除水量は `排液量 - 前回注液量` で自動計算し、`+/-` 符号付きで表示
- 交換#1の除水量は `未計算` と表示し、総除水量は交換#2以降の計算可能分のみを合算する
- 透析液濃度欄はCSVタイトル（例: `レギニュール1.5`）を表示する
- 貯留時間は `timer_segment=dwell` の `start-end`、排液時間は `timer_segment=drain` の `start-end` を表示する
- 排液量/注液量/排液確認は `record_event`（`drain_weight_g` / `bag_weight_g` / `drain_appearance`）を表示する
- `手順画像` はセッション手順表示で使用する `imageAssetKey` 由来の正方形表示画像を指す
- `記録写真` は記録データに紐づく写真を指し、`排液写真(drain)` と `出口部写真(exit_site)` を含む
- セッション実行タイトルは `#通し番号 + タイトル` の形式で表示する
- 時刻は `YYYY-MM-DD HH:mm` 形式
- 未入力は `未入力` で統一
- ブロック理由はボタン直上に短文表示

## 6. アクセシビリティ
- 文字コントラスト比は4.5:1以上
- 最小タップ領域は44x44px
- 警告/アラームは色 + アイコン + 文言の3要素で表現
- 主要UIに読み上げラベルを付与

## 7. 端末差分規約
- Mac shell: 左右余白を広く、情報密度を高める
- iPhone: 1カラム固定、主要操作を下部に寄せる
- 機能差（通知/スリープ）は状態バッジで明示する
- セッション画面: iPhoneは1カラム、Macは2カラム固定
- セッション画像: 1:1正方形を必須とし、`object-fit: cover` で表示
- セッション操作ボタン: iPhone/Macとも「戻る」「次へ」を横並び同幅で表示する
- 出口部写真操作: iPhoneのみ登録/変更/削除を表示し、Macは閲覧リンクのみ表示する

## 8. UI変更レビュー手順
1. 変更対象コンポーネントを列挙
2. デザイントークン準拠を確認
3. A11yチェックを実施
4. セッション画面で警告帯視認性を再確認
5. スクリーンショットを添えてレビュー記録
