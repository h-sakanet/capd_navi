# ADR-001: Stack Decision

## 1. 背景
v1は単一利用者・2端末・最終的整合の運用で、過剰なサーバー構成を避ける必要がありました。

## 2. 選択肢
1. Netlify中心（Web + Functions + Blobs + IndexedDB）
2. Supabase中心
3. Cloudflare中心

## 3. 採用理由
採用: 1
- ローカル正本で低遅延操作を維持できる
- Netlify中心運用と整合する
- v1の規模で実装/運用コストが最小

## 4. 影響範囲
- 同期は最終的整合（LWW）
- 復旧は `cloudState=missing` + `full_reseed`
- 公開APIは `/sync/push`, `/sync/pull` の最小構成
