# 04. データ同期と競合解決ポリシー

## 1. 目的
Mac/iPhone 併用時に、手技実行の整合と履歴閲覧の利便性を両立します。

## 2. 前提ルール
- 同一セッション中は開始端末のみ更新可能
- 別端末は進行中セッションを閲覧しない（v1対象外）
- セッション完了後に遅延同期で記録を反映
- 同時実行セッションは全端末合計で1件
- ホームスロットは左から右の順序実行を強制（左未完了時は右開始不可）
- スロット推奨時刻は左から右へ厳密昇順（同時刻不可）
- 予期せぬ離脱時はセッションを `active` のまま保持し、`activeSessionId` で再開
- 明示中断（非常手段）時はセッションを `aborted` とし、スロットを `planned`（UI: 未実施）へ戻す
- セッション再開時の表示内容は開始時スナップショット固定（現行テンプレート版へフォールバックしない）

## 3. セッション所有権
- `POST /sessions` で `ownerDevice` と `executionToken` を発行
- 更新系APIは `X-Execution-Token` を必須化
- トークン不一致は `403` を返却
- スロット編集系API（`PUT/DELETE /daily-procedure-slots/{slotNo}`）は `baseRevision` を必須化
- `baseRevision` 不一致は `409 SLOT_PLAN_REVISION_MISMATCH`

## 4. 同期モデル
- 差分取得API: `GET /sync/changes?sinceCursor=...`
- 同期タイミング:
  - ホーム表示時
  - アプリ復帰時
  - 120秒間隔ポーリング
- 同期対象:
  - 日次スロット計画
  - セッション状態
  - 記録データ更新
  - テンプレート更新
- 補足:
  - 進行中セッション（`active`）は同期対象外
  - 別端末で必要なのは完了/中断後の結果閲覧のみ
  - `sessionId` 解決は完了/中断セッションの差分のみで行う

## 5. 競合解決

### 5.1 セッション進行
- 単一書き込みのため競合は発生させない
- ownerDevice以外の更新は拒否
- `POST /sessions/{id}/steps/{stepId}/enter` は `(sessionId, stepId)` と `clientTransitionId` で冪等化し、再開/再送で `timer/alarm` 副作用を重複させない
- アラーム通知は `(sessionId, alarmId)` を一意キーとして1回のみ登録する

### 5.2 履歴編集
- `baseRevision` を使った optimistic lock
- 不一致は `409 CONFLICT`
- クライアントは再取得して編集内容を再適用

### 5.3 日次スロット編集
- `daily_procedure_plans.revision` を使った optimistic lock
- 不一致は `409 SLOT_PLAN_REVISION_MISMATCH`
- `completed` スロット更新は `409 SLOT_ALREADY_COMPLETED`
- 対象日に active セッションがある間は `409 ACTIVE_SESSION_EXISTS`

## 6. 監査ログ
- セッション進行イベント、記録編集イベントは append-only で保存
- ログ項目: actorDeviceId, action, payloadHash, serverTimestamp

## 7. 障害時動作
- 同期失敗時はホームに「同期失敗」バナー表示
- 手動再試行ボタンを提供
- 同一端末での進行中セッション表示は維持し、復旧後に再送
