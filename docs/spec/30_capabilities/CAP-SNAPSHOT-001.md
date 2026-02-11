# CAP-SNAPSHOT-001

## 1. メタ情報（CAP ID, 名称, Owner, 対象Phase）
- CAP ID: CAP-SNAPSHOT-001
- 名称: スナップショット保存
- Owner: Session Domain
- 対象Phase: Phase1

## 2. 目的 / 非目的
- 目的: セッション開始時スナップショット固定と、記録保存のLWWメタ維持を保証します。
- 必要性: CSV再取込でテンプレートが更新されても、進行中/履歴セッションの表示内容が途中で変わる事故を防ぎます。
- 非目的: push/pull処理、写真バックアップポリシー。

## 3. 境界（対象画面あり/なし、責務分割）
- 対象画面あり: `../20_screens/SCR-006-SESSION.md`, `../20_screens/SCR-007-SESSION-RECORD.md`, `../20_screens/SCR-009-HISTORY-DETAIL.md`
- 画面責務: 入力収集と保存トリガー。
- CAP責務: Snapshot生成、Record保存、LWWメタ管理、再開時復元。

## 4. ドメインモデルと不変条件
- モデル: `SessionProtocolSnapshot`, `RecordEntity`, `LwwMeta`。
- 不変条件:
  - セッション開始時にスナップショットを同一トランザクションで保存。
  - 保存失敗時はセッション開始失敗。
  - 再開時はスナップショットを優先しテンプレートへフォールバックしない。
  - `updatedAt/updatedByDeviceId/mutationId` を保存時に更新。

## 5. 入出力I/F（Service, API, Event）
- Service: `SessionService.startSession`, `RecordService.saveRecord`, `RecordService.updateRecord`
- 入力: session id, record payload, patch
- 出力: snapshot hash, record id, updated meta
- Event: `session.started`, `record.saved`, `snapshot.saved`

## 6. 状態遷移（正常 / 禁止 / 再試行 / 復旧）
- 正常: `start -> snapshot_saved -> active -> completed|aborted`
- 禁止: `completed|aborted -> active`
- 再試行: 保存I/O失敗時にローカル再試行
- 復旧: 欠落/ハッシュ不整合時は表示停止して整合性エラー

## 7. 失敗モードと回復方針
- snapshot保存失敗: `SESSION_SNAPSHOT_CREATE_FAILED` で開始中止。
- record保存失敗: モーダルにエラー表示し再保存導線。
- hash不整合: 当該セッション表示停止 + ガイダンス表示。

## 8. セキュリティ・監査・保持
- 監査: 更新端末、更新時刻、対象フィールド。
- 保持: 監査要件に沿って履歴を保持。

## 9. 受入条件（GWT）
- Given セッション開始を実行する
- When スナップショット保存に失敗する
- Then セッション開始を失敗させる

## 10. トレーサビリティ（FR, AT, SCR, JRN）
- Local FR: `CAP-SNAPSHOT-001-FR-01` 〜 `CAP-SNAPSHOT-001-FR-12`
- 旧FR対応: FR-012, FR-031, FR-032, FR-033, FR-034, FR-044D, FR-070, FR-071, FR-072, FR-073, FR-074, FR-075
- AT: AT-FLOW-001, AT-FLOW-002, AT-FLOW-003, AT-FLOW-006
- SCR: SCR-SESSION-001, SCR-SESSION-RECORD-001, SCR-HISTORY-DETAIL-001
- JRN: JRN-003-SESSION, JRN-008-HISTORY

## 11. 機能要件（ローカルID）

- 採番規則: `<文書ID>-FR-yy`（yyはこの文書内連番）
- 旧FR IDは括弧内に残し、移行トレーサビリティを保持します。

- CAP-SNAPSHOT-001-FR-01: (旧: FR-012) 記録編集はLWWメタ（`updatedAt`, `updatedByDeviceId`, `mutationId`）を保持して競合解決可能な状態にします。
- CAP-SNAPSHOT-001-FR-02: (旧: FR-031) 必須チェック未完了時に次ステップ遷移を禁止します。
- CAP-SNAPSHOT-001-FR-03: (旧: FR-032) `record_event` 未完了時に次ステップ遷移を禁止します。
- CAP-SNAPSHOT-001-FR-04: (旧: FR-033) `next_step_id` に従い完全シリアルで遷移します。
- CAP-SNAPSHOT-001-FR-05: (旧: FR-034) 最終ステップ完了時にセッション完了状態へ遷移します。
- CAP-SNAPSHOT-001-FR-06: (旧: FR-044D) `summaryScope` が未指定または不正値でも保存拒否せず、`summaryScope` のみ破棄して他の妥当な入力値を保存します。
- CAP-SNAPSHOT-001-FR-07: (旧: FR-070) 新版取り込み後、テンプレート版として保存します。
- CAP-SNAPSHOT-001-FR-08: (旧: FR-071) セッション開始時は `SessionProtocolSnapshot` をローカル同一トランザクションで保存し、保存失敗時は開始自体を失敗させます。
- CAP-SNAPSHOT-001-FR-09: (旧: FR-072) スナップショットには `sourceProtocol(meta)`、step定義本文（通し番号/タイトル/文言/必須チェック/timer/alarm/record）、画像 `assetKey`、`assetManifest`、`snapshotHash` を含めます。
- CAP-SNAPSHOT-001-FR-10: (旧: FR-073) セッション表示/再開時は開始時スナップショットを常に優先し、現行テンプレート版へフォールバックしません。
- CAP-SNAPSHOT-001-FR-11: (旧: FR-074) スナップショット欠落またはハッシュ不整合は整合性エラーとして扱い、セッション表示を停止します。
- CAP-SNAPSHOT-001-FR-12: (旧: FR-075) テンプレート新版の取り込み後も、開始済みセッションの表示内容は開始時スナップショットから変化しません。
