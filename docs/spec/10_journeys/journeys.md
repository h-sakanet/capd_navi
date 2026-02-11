# Journeys Catalog

## 0. 概要
### 0.1 ゴール / 非ゴール
- ゴール: 実装担当がジャーニー起点で画面・機能・受入条件へ辿れること。
- 非ゴール: 画面UI詳細や型定義の重複記述。

### 0.2 前提（権限・データ・環境）
- 主端末は Mac、代替端末は iPhone。
- データ正本はローカル、クラウドは共有/バックアップ。

### 0.3 用語（参照リンク）
- `../02_glossary_and_id_rules.md`

### 0.4 レビュー手順（推奨順）
1. 一覧表で対象JRNを決める。
2. JRN個票の主フロー/例外フローを確認する。
3. 参照ScreenとCapabilityを開く。

## 1. ジャーニー一覧（カタログ）
| JRN ID | 名称 | 目的 | 主対象画面 | 主要ACT | 成功条件 | 個票 |
|---|---|---|---|---|---|---|
| JRN-001-CSV | CSV取込（Mac） | テンプレート取込 | SCR-HOME-001, SCR-MAC-IMPORT-001 | ACT-007-HOME | テンプレート版保存 | [link](./JRN-001-CSV.md) |
| JRN-002-SLOT | 当日スロット登録と開始 | 当日実施準備 | SCR-HOME-001, SCR-HOME-SETUP-001 | ACT-001-HOME, ACT-002-HOME, ACT-003-HOME, ACT-004-HOME, ACT-005-HOME, ACT-006-HOME, ACT-008-HOME | 対象スロットが実施中 | [link](./JRN-002-SLOT.md) |
| JRN-003-SESSION | セッション進行と記録 | 手技進行完了 | SCR-SESSION-001, SCR-SESSION-RECORD-001 | ACT-001-SESSION, ACT-002-SESSION, ACT-003-SESSION, ACT-004-SESSION | completed 到達 | [link](./JRN-003-SESSION.md) |
| JRN-004-ABORT | 非常中断と再開 | 安全中断と復帰 | SCR-SESSION-001, SCR-HOME-001 | ACT-006-SESSION | aborted / 再開成立 | [link](./JRN-004-ABORT.md) |
| JRN-005-SYNC | 同期と再試行 | 端末間整合 | SCR-SYNC-STATUS-001, SCR-HOME-001 | ACT-001-SYNC, ACT-011-HOME | outbox消し込み | [link](./JRN-005-SYNC.md) |
| JRN-006-RECOVERY | 復旧（DB消失/クラウド欠損） | 欠損復旧 | SCR-SYNC-STATUS-001 | ACT-001-SYNC | ローカル正本維持で復旧 | [link](./JRN-006-RECOVERY.md) |
| JRN-007-ALARM | タイマー通知とACK | 見逃し防止 | SCR-SESSION-001 | ACT-001-ALARM | ACKで通知停止 | [link](./JRN-007-ALARM.md) |
| JRN-008-HISTORY | 記録一覧閲覧と編集 | 履歴確認と編集 | SCR-HISTORY-001, SCR-HISTORY-DETAIL-001, SCR-HISTORY-PHOTO-001 | ACT-010-HOME, ACT-001-HISTORY | 30日閲覧編集可能 | [link](./JRN-008-HISTORY.md) |
| JRN-009-EXITPHOTO | 出口部写真登録/変更/削除 | 出口部写真運用 | SCR-HOME-SUMMARY-001, SCR-HISTORY-DETAIL-001, SCR-HISTORY-PHOTO-001 | ACT-001-EXIT, ACT-002-EXIT, ACT-003-EXIT | `exit_site_photo` 同期更新 | [link](./JRN-009-EXITPHOTO.md) |

## 2. 依存関係（前提ジャーニー）
- JRN-002-SLOT は JRN-001-CSV のテンプレート取り込みを前提とします。
- JRN-003-SESSION は JRN-002-SLOT の開始成立を前提とします。
- JRN-009-EXITPHOTO は JRN-003-SESSION の `session_summary` 完了を前提とします。

## 3. 全ジャーニー共通ポリシー
### 3.1 重複禁止
- 画面挙動は `../20_screens` を参照します。

### 3.2 実装原則
- 本書にない業務挙動は実装しません。

### 3.3 矛盾時優先
- `../01_governance.md` の優先順位に従います。
