# 01. アーキテクチャ概要

## 1. 目的
CAPD v1 を「共通Web + Macネイティブシェル」で実装する際の全体構成を固定します。

## 2. システム構成
```mermaid
flowchart LR
  subgraph Client
    M[Mac Native Shell\nSwiftUI + WKWebView]
    I[iPhone Web/PWA\nSafari]
  end

  subgraph Web
    FE[Next.js Frontend]
    API[Netlify Functions API]
    SCH[Scheduled Functions]
  end

  subgraph Data
    DB[(Neon PostgreSQL)]
    BLOB[(Netlify Blobs)]
    BK[(Backup Storage)]
  end

  M --> FE
  I --> FE
  FE --> API
  API --> DB
  API --> BLOB
  SCH --> DB
  SCH --> BK
  API --> BK
```

## 3. 設計原則
- セッション進行ロジックはWeb共通で一元化する
- OS依存機能（通知、スリープ抑止、ローカル取り込み）はMacネイティブで扱う
- セッション整合は「単一書き込み」を強制して競合を回避する
- iPhoneは代替運用として必要機能を確保する

## 4. 主要コンポーネント
- Web UI: Next.js（ホーム、セッション、履歴、取り込み結果、設定）
- API: Netlify Functions（REST）
- 同期: `GET /sync/changes` + `syncCursor`
- DB: セッション、日次スロット計画（daily_procedure_plans / daily_procedure_slots）、記録、開始時スナップショット（session_protocol_snapshots）、監査ログ
- オブジェクト保存: 写真、手順画像
- バックアップ: 日次Scheduled Function + 手動エクスポート

## 5. ランタイムシーケンス（セッション開始〜完了）
```mermaid
sequenceDiagram
  participant Mac
  participant Web
  participant API
  participant DB

  Mac->>Web: ホーム表示
  Web->>API: GET /daily-procedure-slots?date=...
  API->>DB: 当日スロット取得（未作成は初期化）
  API-->>Web: slots + revision
  Mac->>Web: セッション開始
  Web->>API: POST /sessions (protocolId, slotNo, deviceId)
  API->>DB: active session有無確認 + 作成
  API->>DB: session_protocol_snapshots作成（step定義 + assetManifest + hash）
  API->>DB: slotNo紐付け更新
  API-->>Web: sessionId + executionToken + slotPlanRevision + snapshotHash
  loop 各ステップ
    Web->>API: POST /sessions/{id}/steps/{stepId}/enter (X-Execution-Token)
    API->>DB: step到達記録 + timer/alarm副作用を冪等確定
    API-->>Web: alarmDispatch (必要時)
    Web->>Mac: scheduleLocalAlarm(alarmId, fireAt)
    Web->>API: POST /sessions/{id}/steps/{stepId}/complete (X-Execution-Token)
    API->>DB: 進行更新（必須チェック完了後）
    Web->>API: POST /records (必要時)
    API->>DB: 記録保存
  end
  opt 非常中断
    Web->>API: POST /sessions/{id}/abort (X-Execution-Token)
    API->>DB: status=aborted + slotNoをplannedへ戻す
    API-->>Web: 中断完了
  end
  Web->>API: セッション完了更新
  API->>DB: status=completed
  API->>DB: 対応slotNoをcompletedへ更新
```

## 6. 非機能方針
- セキュリティ: アプリ内認証なし（公開URL運用）
- 可用性: オンライン必須、同期失敗時は再試行UI
- 拡張性: `record_event` 追加を想定した列駆動設計
- 保守性: API契約とUI標準を文書で固定

## 7. 開始時スナップショット契約
- 固定対象:
  - `sourceProtocol`（`protocolId`, `protocolVersion`, `importedAt`）
  - step定義本文（通し番号、`step_id/next_step_id`、フェーズ/状態、タイトル、表示/警告文、必須チェック、`timer/alarm/record` 指示）
  - `assetManifest`（`sourceRelativePath` と `assetKey` 対応、`contentSha256`、`sizeBytes`）
  - `snapshotHash`（正規化JSONの `sha256`）
- 保存方式:
  - `POST /sessions` 内で `sessions` と `session_protocol_snapshots` を同一トランザクション保存
  - いずれか失敗時はロールバックし、`SESSION_SNAPSHOT_CREATE_FAILED` を返却
- 復元方式:
  - `GET /sessions/{id}` は `session_protocol_snapshots` のみを参照
  - 現行テンプレート版へのフォールバックは禁止
  - 欠落またはハッシュ不整合は `SESSION_SNAPSHOT_INTEGRITY_ERROR` を返却
