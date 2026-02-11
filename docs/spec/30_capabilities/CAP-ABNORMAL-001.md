# CAP-ABNORMAL-001

## 1. メタ情報（CAP ID, 名称, Owner, 対象Phase）
- CAP ID: CAP-ABNORMAL-001
- 名称: 異常判定（見た目分類ベース）
- Owner: Session Domain
- 対象Phase: Phase1

## 2. 目的 / 非目的
- 目的: `drain_appearance` 入力値に基づき、アプリ内で簡易異常判定を行い警告表示へ接続します。
- 非目的: 医療判断の自動化、病院連絡/緊急通報導線の提供。

## 3. 境界（対象画面あり/なし、責務分割）
- 対象画面あり: `../20_screens/SCR-006-SESSION.md`, `../20_screens/SCR-007-SESSION-RECORD.md`
- 画面責務: 入力と警告表示。
- CAP責務: 判定ルール管理、判定結果生成、表示レベルの決定。

## 4. ドメインモデルと不変条件
- モデル: `Record(record_event=drain_appearance)`, `DrainAppearanceCategory`, `AbnormalJudgeResult`
- 不変条件:
  - 判定入力は `drain_appearance` の分類値のみを使用。
  - 判定結果は警告表示に限定し、セッション遷移は阻害しない。

## 5. 入出力I/F（Service, API, Event）
- Service: `AbnormalJudgeService.evaluateDrainAppearance`
- 入力: `drain_appearance` 分類
- 出力: `{ level: info|warning, message }`
- Event: `abnormal.judged`

## 6. 状態遷移（正常 / 禁止 / 再試行 / 復旧）
- 正常: `入力待ち -> 判定済み -> 表示済み`
- 禁止: 判定結果を保存せずに上書きする遷移
- 再試行: 入力修正時に再判定
- 復旧: 判定失敗時は `警告なし` へフォールバックしログ記録

## 7. 失敗モードと回復方針
- 判定失敗: セッション継続を優先し、警告表示なしで保存を継続。
- 分類不正値: `その他` として扱い警告表示を抑止。

## 8. セキュリティ・監査・保持
- 判定結果は監査ログへ保存可能（分類値・時刻・端末）。
- 個人特定情報は判定ロジックに含めません。

## 9. 受入条件（GWT）
- Given `drain_appearance=混濁`
- When 判定を実行する
- Then 警告レベルで表示する

## 10. トレーサビリティ（FR, AT, SCR, JRN）
- Local FR: `CAP-ABNORMAL-001-FR-01` 〜 `CAP-ABNORMAL-001-FR-03`
- 旧FR対応: FR-060, FR-061, FR-062
- AT: （v1では専用AT未定義。既存セッション系ATの範囲で確認）
- SCR: SCR-SESSION-001, SCR-SESSION-RECORD-001
- JRN: JRN-003-SESSION

## 11. 機能要件（ローカルID）

- 採番規則: `<文書ID>-FR-yy`（yyはこの文書内連番）
- 旧FR IDは括弧内に残し、移行トレーサビリティを保持します。

- CAP-ABNORMAL-001-FR-01: (旧: FR-060) 見た目分類ベースの簡易判定を行います。
- CAP-ABNORMAL-001-FR-02: (旧: FR-061) 異常時は警告表示のみ行います。
- CAP-ABNORMAL-001-FR-03: (旧: FR-062) 連絡ボタン等の導線はv1対象外とします。
