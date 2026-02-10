# 03. 技術スタック選定

## 1. 候補比較
| 案 | 構成 | 長所 | 短所 |
|---|---|---|---|
| A（採用） | Mac: SwiftUI+WKWebView / Web: Next.js / API: Netlify Functions（最小） / Local: IndexedDB / Shared: Netlify Blobs | ローカルファーストで軽量、Netlify中心運用、単一ユーザー要件に適合 | 厳密リアルタイム同期は弱い、競合は最終的整合 |
| B | Mac同等 / Web+API+DB+Storage: Supabase中心 / FrontのみNetlify | DB/Storage統合が強い | Netlify中心方針から外れる |
| C | Mac同等 / Cloudflare Pages+Workers+D1+R2 | エッジ配信に強い | 初期実装と運用の学習コストが高い |

## 2. 採用案
採用は案Aです。

### 2.1 採用理由
- 1日1〜4件、年間数百〜千数百件規模では RDB 運用が過剰になりやすく、ローカル正本の方が実装・運用コストを抑えられます。
- 単一ユーザー・2端末・非リアルタイム同期という前提に対し、IndexedDB + Blobs の最終的整合で要件を満たせます。
- Netlify Blobs を共有・バックアップ先として使うことで、Netlify中心の運用を維持できます。
- 競合解決・同期契機・バックアップを明示ルール化することで、RDBなしでも再現可能な運用品質を担保できます。

### 2.2 トレードオフ
- 同一データを別端末で更新した場合、即時整合ではなく同期時の LWW 解決になります。
- 端末ローカル消失（iOSストレージ回収）に備え、復元導線と同期運用の徹底が必要です。
- 同期データを非暗号化で扱うため、HTTPS通信前提とURL管理手順の徹底が必要です。

## 3. 採用スタック詳細
- Mac: Swift, SwiftUI, WKWebView, UNUserNotificationCenter, IOPM Assertion
- Frontend: Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui
- Local Store: IndexedDB（正本）
- Sync/API: Netlify Functions（`/sync/pull`, `/sync/push`）
- Shared Storage: Netlify Blobs（`index.json`, `days/*.json`, `photos/*.jpg`）
- Batch: Netlify Scheduled Functions（日次スナップショット保持）
- Hosting: Netlify

## 4. バージョン方針
- Node.js: LTS（20系以上）
- TypeScript: 安定版
- Next.js: 安定版（LTSポリシーに準拠）
- Swift: Xcode安定版に準拠

## 5. 不採用理由（要約）
- Neon PostgreSQL + ORM 案: データ規模と運用体制に対して過剰で、構成複雑性が増加するため不採用
- Supabase案: DB統合は魅力だが、Netlify中心の運用一貫性を優先
- Cloudflare案: 将来性はあるが初期実装・運用負荷が高い
