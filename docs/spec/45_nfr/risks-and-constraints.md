# Risks And Constraints

## 1. 目的
v1運用で顕在化しうる主要リスクと、実装・運用で固定する制約を明示します。

## 2. 主要リスク
| ID | リスク | 対策 |
|---|---|---|
| R-001 | CSV文言の未確定値 | 取込警告 + 事前レビュー |
| R-004 | 同期失敗の継続 | 手動同期導線 + 復帰時再試行 |
| R-006 | iPhone通知制約 | Mac主チャネル + 段階再通知 |
| R-012 | スナップショット欠落/不整合 | 開始時原子的保存 + hash検証 |
| R-017 | 非暗号化同期データ | HTTPS前提 + URL管理 |
| R-023 | Blobs欠損 | `cloudState=missing` + `full_reseed` |

## 3. 制約
- 提供形態は Web + Macネイティブシェル固定。
- アプリ内認証は導入しません（公開URL運用）。
- 同期暗号化は v1 で導入しません（HTTPS前提）。
- 手順遷移は完全シリアルのみです。
- リアルタイム同期/手動エクスポートは v1 対象外です。

## 4. 将来拡張（参考）
- 医療者共有出力（PDF/CSV）
- 家族見守り/代理記録
- 異常判定強化
- 多言語対応

## 5. 参照リンク
- `./non-functional.md`
- `./observability.md`
- `../30_capabilities/CAP-SYNC-001.md`
- `../30_capabilities/CAP-RECOVERY-001.md`
- `../30_capabilities/CAP-ALARM-001.md`
