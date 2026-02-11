# API Contract

## 1. エンドポイント一覧
公開HTTP APIは以下2つのみです。

| Method | Path | 目的 | 主入力 | 主出力 |
|---|---|---|---|---|
| POST | `/sync/push` | outbox mutation反映 | `deviceId`, `syncMode`, `baseCloudRevision`, `mutations[]` | `acceptedMutations[]`, `newCloudRevision`, `reseedApplied` |
| POST | `/sync/pull` | revision以降差分取得 | `deviceId`, `knownCloudRevision`, `knownDayRevisions` | `cloudState`, `cloudRevision`, `manifestDiff`, `dayBundles[]`, `photoRefs[]` |

ローカルI/F（公開HTTP API対象外）:
- `ProtocolImportService.importFromDirectory`（CSV取込）
- `RecordService.updateRecord(..., patch_path=payload.exit_site_photo)`

## 2. リクエスト/レスポンス
- 共通入力: `deviceId`, `request timestamp`
- 共通出力: `status相当`, `error情報`, `cloudRevision`
- `syncMode`: `delta | full_reseed`
- `cloudState`: `ok | missing`

`cloudState=missing` 判定条件:
- `index.json` 欠損
- 必須フィールド欠落/不正
- `dayRefs` / `photoRefs` 参照先欠損
- `integrity` 検証失敗

## 3. エラーコード
- UI表示コードは `./error-codes.md` を参照。
- API内の詳細失敗理由は `SyncState.lastError` に集約します。

## 4. 参照元リンク
- `../../../requirements/04_domain_model_and_interfaces.md`
- `../../../design/04_sync_conflict_policy.md`
- `../30_capabilities/CAP-SYNC-001.md`
- `../30_capabilities/CAP-RECOVERY-001.md`
