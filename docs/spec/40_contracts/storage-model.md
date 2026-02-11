# Storage Model Contract

## 1. 目的
- データモデルと保存先（IndexedDB / localStorage / Cloud）を明確化し、実装時の解釈ズレを防ぎます。
- FR-102（ローカル正本）、FR-091/FR-092（写真容量とバックアップ）の保存対象を固定します。

## 2. 正本ストレージ（IndexedDB）
- 正本は IndexedDB です。`localStorage` を正本として扱ってはいけません。
- オブジェクトストア（v1）:
  - `protocol_packages`: `ProtocolPackage`（CSV取込済みテンプレート）
  - `daily_procedure_plans`: `DailyProcedurePlan`（当日4スロット）
  - `sessions`: `Session`
  - `records`: `RecordEntity`
  - `session_protocol_snapshots`: `SessionProtocolSnapshot`
  - `outbox_mutations`: `OutboxMutation`
  - `sync_state`: `SyncState`
  - `alarm_dispatch_jobs`: `AlarmDispatchJob`
  - `photo_meta`: `photoRefs` 相当メタ

### 2.1 `ProtocolPackage` 保存形（v1）
- `protocol_packages` の保存オブジェクトは、次の構造を必須とします。

```json
{
  "meta": {
    "formatVersion": 3,
    "protocolId": "capd_onebag",
    "protocolName": "ワンバッグ手技",
    "protocolVersion": "v3.0.0",
    "effectiveFromLocal": "2026-02-10T00:00:00+09:00"
  },
  "steps": [],
  "source": {
    "importMode": "mac_directory",
    "basePath": "protocol_package"
  },
  "importedAt": "2026-02-09T13:00:00+09:00",
  "validationReport": {
    "errors": [],
    "warnings": []
  }
}
```

- `meta.effectiveFromLocal`: テンプレート有効開始日時（端末ローカル日時文字列）。
- `source.importMode`: v1では `mac_directory` 固定。
- `source.basePath`: 取り込みディレクトリ基準パス（`protocol.csv` 配置基準）。
- `validationReport`: 取り込み時の検証結果（`errors` / `warnings`）を保持。

## 3. Cloud共有/バックアップ（Netlify Blobs）
- `index.json`: `cloudRevision`, `dayRefs`, `photoRefs`, `tombstones`, `integrityHash`
- `days/{dateLocal}.json`: `DayBundle`
- `photos/{photoId}.jpg`: JPEGバイナリ
- FR-092 の「日次バックアップ」は、上記 `index.json + days/* + photos/*` の世代バックアップを指します。

## 4. localStorage（補助用途）
- 目的: 一時的なUI復元。正本ではありません。
- 現行キー（実装）:
  - `capd-support:home:slots:v1`
    - 値: `Array<ProcedureSlot | null>`（4スロット）
    - 要素: `{ protocolId, protocolLabel, recommendedTime, status }`
  - `capd-support:home:active-session:v1`
    - 値: `{ sessionId, slotIndex, currentStepId, updatedAtIso }`
- この領域は将来的に IndexedDB へ統合可能な補助キャッシュとして扱います。

## 5. 保存ルール
- `Session.start` 時は `sessions` と `session_protocol_snapshots` を同一トランザクションで保存します。
- `Record` 更新時は `records` 更新と `outbox_mutations` 追記を同時に実行します。
- `exit_site_photo` 更新は `patch_path=payload.exit_site_photo` の部分パッチで保存します。
- `cloudState=missing` 判定時にローカル正本（IndexedDB）を削除してはいけません。

## 6. 参照リンク
- `./types.md`
- `./api.md`
- `./events.md`
- `./functional-requirements.md`
- `../30_capabilities/CAP-SNAPSHOT-001.md`
- `../30_capabilities/CAP-SYNC-001.md`
- `../30_capabilities/CAP-PHOTO-BACKUP-001.md`
