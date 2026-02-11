# CAP-PLATFORM-001

## 1. メタ情報（CAP ID, 名称, Owner, 対象Phase）
- CAP ID: CAP-PLATFORM-001
- 名称: 提供形態/セキュリティ基盤
- Owner: Platform
- 対象Phase: Phase1

## 2. 目的 / 非目的
- 目的: 提供形態、公開運用、接続前提、UI基盤など横断ポリシーを固定します。
- 非目的: 画面固有のUI動作、CSV解析、同期アルゴリズム詳細。

## 3. 境界（対象画面あり/なし、責務分割）
- 対象画面なし（全画面横断）。
- CAP責務: 運用・配布・接続・技術基盤の固定。

## 4. ドメインモデルと不変条件
- モデル: DeploymentPolicy, SecurityPolicy, PlatformPolicy。
- 不変条件:
  - v1は公開URL運用（アプリ内認証なし）。
  - データ正本はローカル保持。
  - UI基盤/アイコン基盤は固定採用。

## 5. 入出力I/F（Service, API, Event）
- Service: なし（方針契約）。
- API: `POST /sync/push`, `POST /sync/pull`（同期契約に委譲）。
- Event: なし。

## 6. 状態遷移（正常 / 禁止 / 再試行 / 復旧）
- 状態遷移を持たない固定ポリシーCAPです。

## 7. 失敗モードと回復方針
- URL漏えい時: URL再発行と共有範囲見直し。
- 接続断時: ローカル操作継続、復帰後同期。

## 8. セキュリティ・監査・保持
- HTTPS前提、端末側暗号化はv1非対応。
- 監査ログは機微情報平文を禁止。

## 9. 受入条件（GWT）
- Given v1運用ポリシーをレビューする
- When 本CAPを参照する
- Then 提供形態/接続/基盤方針が一意に判断できる

## 10. トレーサビリティ（FR, AT, SCR, JRN）
- Local FR: 本文の「11. 機能要件（ローカルID）」を参照
- 旧FR対応: FR-100, FR-101, FR-102, FR-103, FR-104, FR-105, FR-106, FR-109, FR-110, FR-111, FR-112, FR-113, FR-114, FR-115
- AT: AT-PLAT-001, AT-PLAT-002, AT-SLEEP-001
- SCR: SCR-001-HOME, SCR-006-SESSION
- JRN: JRN-005-SYNC, JRN-007-ALARM

## 11. 機能要件（ローカルID）

- 採番規則: `<文書ID>-FR-yy`（yyはこの文書内連番）
- 旧FR IDは括弧内に残し、移行トレーサビリティを保持します。

- CAP-PLATFORM-001-FR-01: (旧: FR-100) アプリ内認証は行いません（公開URL運用）。
- CAP-PLATFORM-001-FR-02: (旧: FR-101) オンライン接続は推奨とし、通信断中もローカル操作を継続可能とします。
- CAP-PLATFORM-001-FR-03: (旧: FR-102) 記録データの正本は端末ローカル保存とし、クラウドは共有/バックアップ用途とします。
- CAP-PLATFORM-001-FR-04: (旧: FR-103) iOSネイティブアプリ配布はv1対象外とします。
- CAP-PLATFORM-001-FR-05: (旧: FR-104) 同期データはHTTPS通信を前提に扱い、端末側暗号化は v1 で実装しません。
- CAP-PLATFORM-001-FR-06: (旧: FR-105) 公開URL運用リスクを受容し、URL管理手順（共有範囲制限・漏えい時の再発行）を運用要件とします。
- CAP-PLATFORM-001-FR-07: (旧: FR-106) 機微データを扱う運用時は、将来版での暗号化再導入を前提にします（v1では非対応）。
- CAP-PLATFORM-001-FR-08: (旧: FR-109) 提供形態は `Web本体 + Mac薄型ネイティブシェル（WKWebView）` で固定します。
- CAP-PLATFORM-001-FR-09: (旧: FR-110) MacネイティブシェルはOS通知連携を提供します。
- CAP-PLATFORM-001-FR-10: (旧: FR-111) Macネイティブシェルは画面スリープ抑止を提供します。
- CAP-PLATFORM-001-FR-11: (旧: FR-112) iPhoneはPWA通知対応時のみOS通知を利用します。
- CAP-PLATFORM-001-FR-12: (旧: FR-113) スリープ抑止が未対応/失敗の場合、注意表示と対処ガイダンスを表示します。
- CAP-PLATFORM-001-FR-13: (旧: FR-114) Web UIコンポーネント基盤は `shadcn/ui` を採用します。
- CAP-PLATFORM-001-FR-14: (旧: FR-115) Web UIのアイコンセットは `MynaUI Icons`（`@mynaui/icons-react`）を採用します。
