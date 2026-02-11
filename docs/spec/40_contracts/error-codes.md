# Error Codes Contract

## 1. 対象契約のスコープ
本書はUI表示する失敗コードと回復導線を定義します。

## 2. 用語・列挙・値域
- 区分: `IMPORT`, `SESSION`, `SYNC`, `RECOVERY`, `ALARM`, `PHOTO`
- 形式: `<区分>-<3桁>`

## 3. 厳密な型定義
| コード | 区分 | 意味 | 回復導線 |
|---|---|---|---|
| `IMPORT-001` | IMPORT | 必須列不足/形式不正 | CSV修正後に再取込 |
| `IMPORT-002` | IMPORT | step参照不整合 | CSV修正後に再取込 |
| `IMPORT-003` | IMPORT | 画像欠損 | 画像配置修正後に再取込 |
| `SESSION-001` | SESSION | 必須チェック未完了 | チェック実施後に再試行 |
| `SESSION-002` | SESSION | `record_event` 未保存 | 記録保存後に再試行 |
| `SESSION-003` | SESSION | snapshot保存失敗 | セッション開始をやり直し |
| `SYNC-001` | SYNC | push失敗 | 自動/手動再試行 |
| `SYNC-002` | SYNC | pull失敗 | 自動/手動再試行 |
| `RECOVERY-001` | RECOVERY | `cloudState=missing` | full_reseed 実行 |
| `RECOVERY-002` | RECOVERY | full_reseed失敗 | ローカル保持で再試行 |
| `ALARM-001` | ALARM | ACK保存失敗 | ACK再試行 |
| `PHOTO-001` | PHOTO | 容量上限超過 | 古い順削除後に再保存 |

## 4. 不変条件
- 未定義コードをUI表示しません。
- `status=ok` と `error_code` の同時返却を禁止します。
- 同一エラーコードの意味変更を禁止します。

## 5. 禁止値・禁止遷移
- `UNKNOWN` の恒久運用を禁止します。
- 区分外コード（例: `X-999`）を禁止します。

## 6. バージョニング方針
- 既存コード意味変更は互換破壊。
- 新規追加は後方互換を維持。

## 7. 参照元リンク
- `../30_capabilities/CAP-CSV-IMPORT-001.md`
- `../30_capabilities/CAP-SNAPSHOT-001.md`
- `../30_capabilities/CAP-SYNC-001.md`
- `../30_capabilities/CAP-RECOVERY-001.md`
- `../30_capabilities/CAP-ALARM-001.md`
- `../30_capabilities/CAP-PHOTO-BACKUP-001.md`
