# 03. 技術スタック選定

## 1. 候補比較
| 案 | 構成 | 長所 | 短所 |
|---|---|---|---|
| A（採用） | Mac: SwiftUI+WKWebView / Web: Next.js / API: Netlify Functions / DB: Neon PG + Drizzle / Storage: Netlify Blobs | Netlify運用に寄せられ、導入が速い | DBが別ベンダになる |
| B | Mac同等 / Web+API+DB+Storage: Supabase中心 / FrontのみNetlify | DB/Storage統合が強い | Netlify中心方針から外れる |
| C | Mac同等 / Cloudflare Pages+Workers+D1+R2 | エッジ配信に強い | 現在要件の実装負荷が高い |

## 2. 採用案
採用は案Aです。

### 2.1 採用理由
- ユーザー希望の Netlify を中心に据えられる
- Scheduled Functions で日次バックアップ設計と整合する
- Macネイティブ層をWeb実装から明確に分離できる
- Next.js + TypeScript はUIスパイクから本実装へ移行しやすい

### 2.2 トレードオフ
- DB運用が Netlify + Neon の2面管理になる
- 認証なし公開URLのため、運用上のアクセス管理が必要

## 3. 採用スタック詳細
- Mac: Swift, SwiftUI, WKWebView, UNUserNotificationCenter, IOPM Assertion
- Frontend: Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui
- Backend: Netlify Functions（REST）
- Batch: Netlify Scheduled Functions（日次バックアップ）
- DB: Neon PostgreSQL
- ORM: Drizzle ORM
- Blob Storage: Netlify Blobs
- Hosting: Netlify

## 4. バージョン方針
- Node.js: LTS（20系以上）
- TypeScript: 安定版
- Next.js: 安定版（LTSポリシーに準拠）
- Swift: Xcode安定版に準拠

## 5. 不採用理由（要約）
- Supabase案: DB統合は魅力だが、Netlify中心の運用一貫性を優先
- Cloudflare案: 将来性は高いが初期実装の学習コストが高い
