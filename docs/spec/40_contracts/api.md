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

### 2.1 入出力例（固定）
`POST /sync/push` 入力例:
```json
{
  "deviceId": "macbook-main",
  "syncMode": "delta",
  "baseCloudRevision": 100,
  "mutations": [
    {
      "mutationId": "mut_01J...",
      "entityType": "record",
      "entityId": "rec_01H...",
      "operation": "patch",
      "patch_path": "payload.exit_site_photo",
      "payload": {
        "exit_site_photo": {
          "photo_id": "pho_exit_01H...",
          "captured_at": "2026-02-09T21:15:00+09:00",
          "uploaded_at": "2026-02-09T21:16:00+09:00",
          "source_device_id": "iphone-main"
        }
      }
    }
  ]
}
```

`POST /sync/push` 出力例:
```json
{
  "acceptedMutations": ["mut_01J..."],
  "rejectedMutations": [],
  "newCloudRevision": 102,
  "reseedApplied": false
}
```

`POST /sync/pull` 入力例:
```json
{
  "deviceId": "iphone-main",
  "knownCloudRevision": 100,
  "knownDayRevisions": {
    "2026-02-09": "sha256:old"
  }
}
```

`POST /sync/pull` 出力例:
```json
{
  "cloudState": "ok",
  "cloudRevision": 102,
  "manifestDiff": {},
  "dayBundles": [],
  "photoRefs": [
    {
      "photoId": "pho_exit_01H...",
      "blobKey": "photos/pho_exit_01H....jpg",
      "photo_kind": "exit_site",
      "sizeBytes": 202114,
      "sha256": "7af1...",
      "updatedAt": "2026-02-09T21:16:00+09:00"
    }
  ]
}
```

`cloudState=missing` の返却条件（いずれか該当で返却）:
- `index.json` が存在しない
- `index.json` の必須フィールド（`cloudRevision`, `dayRefs`, `photoRefs`, `tombstones`, `integrityHash`）が欠落または不正
- `index.json` が参照する `days/*.json` の必須オブジェクトが1件でも欠損
- `index.json` が参照する `photos/*` が1件でも欠損
- `integrityHash` 検証が失敗し、整合性を回復できない

## 3. エラーコード
- UI表示コードは `./error-codes.md` を参照。
- API内の詳細失敗理由は `SyncState.lastError` に集約します。

## 4. クライアント公開I/F（ローカルサービス契約）

### 4.1 `SessionService`
```ts
interface SessionService {
  startSession(input: { slotNo: ProcedureSlotNo; protocolId: string }): Promise<{ sessionId: string }>;
  enterStep(input: { sessionId: string; stepId: string }): Promise<void>;
  completeStep(input: { sessionId: string; stepId: string }): Promise<void>;
  abortSession(input: { sessionId: string }): Promise<void>;
  getSession(sessionId: string): Promise<Session>;
}
```

### 4.2 `RecordService`
```ts
interface RecordService {
  saveRecord(input: {
    sessionId: string;
    recordEvent: RecordEvent;
    payload: Record<string, unknown>;
  }): Promise<{ recordId: string }>;
  updateRecord(input: {
    recordId: string;
    patch: Record<string, unknown>;
    patch_path?: "payload.exit_site_photo";
  }): Promise<void>;
  listRecords(input: { fromDate: string; toDate: string }): Promise<RecordEntity[]>;
}
```

### 4.3 `DailyPlanService`
```ts
interface DailyPlanService {
  getPlan(dateLocal: string): Promise<DailyProcedurePlan>;
  upsertSlot(input: {
    dateLocal: string;
    slotNo: ProcedureSlotNo;
    protocolId: string;
    recommendedAtLocal: string;
  }): Promise<void>;
  deleteSlot(input: { dateLocal: string; slotNo: ProcedureSlotNo }): Promise<void>;
}
```

### 4.4 `ProtocolImportService`
```ts
interface ProtocolImportService {
  importFromDirectory(input: { basePath: string }): Promise<{
    status: "success" | "failed";
    errors: Array<{ row?: number; field?: string; message: string }>;
    warnings: Array<{ row?: number; field?: string; message: string }>;
    summary: { stepCount: number; timerCount: number; alarmCount: number; recordEventCount: number };
  }>;
}
```

### 4.5 `SyncService`
```ts
interface SyncService {
  sync(trigger: SyncTrigger): Promise<{ applied: number; failed: number; reseedApplied: boolean }>;
  restoreFromCloud(): Promise<{ restoredDays: number; restoredRecords: number }>;
  getSyncState(): Promise<SyncState>;
}
```

## 5. 参照元リンク
- `./storage-model.md`
- `./types.md`
- `./functional-requirements.md`
- `../30_capabilities/CAP-SYNC-001.md`
- `../30_capabilities/CAP-RECOVERY-001.md`
