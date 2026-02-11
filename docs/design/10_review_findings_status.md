# 10. 第三者レビュー指摘トラッキング（2026-02-10）

> 移行メモ（2026-02-11）: 本文の正本は `docs/spec/90_decisions/ADR-002-review-findings-2026-02-10.md` / `docs/spec/50_quality/traceability.md` へ再構成済みです。  
> 本書は旧体系参照用として残置し、更新は `docs/spec` 側を優先します。


## 1. 目的
第三者レビューで挙がった10件（P0/P1/P2）の解消状況を、実装セッション開始前に固定します。

## 2. 解消状況一覧

| ID | 指摘概要 | 判定 | 根拠（主要反映先） | 備考 |
|---|---|---|---|---|
| P0-1 | 日次ノート表示項目のデータ定義不足（飲水量/出口部状態/初期注液量） | 解消済み | `docs/requirements/05_functional_requirements.md:32`, `docs/requirements/05_functional_requirements.md:69`, `docs/requirements/04_domain_model_and_interfaces.md:191`, `docs/requirements/02_operational_flow.md:30` | `opening_infuse_weight_g` は v1 空欄許容・計算不使用で確定 |
| P0-2 | Home 4スロット要件に対する永続化モデル/API不足 | 解消済み | `docs/requirements/04_domain_model_and_interfaces.md:321`, `docs/requirements/04_domain_model_and_interfaces.md:331`, `docs/requirements/04_domain_model_and_interfaces.md:517`, `docs/requirements/05_functional_requirements.md:19` | `dateLocal + revision + slots[4]` モデルで固定 |
| P0-3 | 別端末で進行中セッションを閲覧する実現経路不足 | 解消済み（方針確定） | `docs/requirements/05_functional_requirements.md:109`, `docs/requirements/04_domain_model_and_interfaces.md:373`, `docs/requirements/04_domain_model_and_interfaces.md:467`, `docs/requirements/README.md:85` | v1では「進行中の別端末閲覧」を対象外に明確化 |
| P0-4 | 開始時スナップショット保存契約が不十分 | 解消済み | `docs/requirements/05_functional_requirements.md:101`, `docs/requirements/05_functional_requirements.md:102`, `docs/requirements/04_domain_model_and_interfaces.md:360`, `docs/design/01_architecture_overview.md:99` | 固定範囲、原子性、整合性エラーを定義 |
| P1-1 | CSV v3仕様とUIスパイク実装の入力前提不一致（row_type/meta） | 解消済み | `docs/requirements/03_protocol_csv_v3_spec.md:32`, `capd-app/lib/protocol-csv.ts:93`, `capd-app/public/protocols/session.csv:1` | UIスパイク側も `row_type/meta` 必須前提へ統一 |
| P1-2 | アラーム時刻算出/再送時の冪等仕様不足 | 解消済み | `docs/requirements/05_functional_requirements.md:77`, `docs/requirements/04_domain_model_and_interfaces.md:380`, `docs/requirements/04_domain_model_and_interfaces.md:390`, `docs/requirements/README.md:88` | `timer_event=end` 基準、`(sessionId, alarmId)` 冪等を固定 |
| P1-3 | 状態語彙不一致（session:aborted と Home表示） | 解消済み | `docs/requirements/05_functional_requirements.md:16`, `docs/requirements/05_functional_requirements.md:61`, `docs/requirements/04_domain_model_and_interfaces.md:167`, `docs/requirements/04_domain_model_and_interfaces.md:497` | Home表示語彙と内部状態マッピングを定義 |
| P1-4 | 1日1回リマインド設定のI/F不足 | 解消済み（非対象化＋代替定義） | `docs/requirements/05_functional_requirements.md:7`, `docs/requirements/05_functional_requirements.md:94`, `docs/requirements/04_domain_model_and_interfaces.md:515`, `docs/requirements/07_acceptance_tests.md:162` | 手技開始通知は本アプリ非対象、手動30秒テスト（必要時実施）を要件化 |
| P2-1 | drain_appearance 語彙不一致（要件とスパイク差） | 解消済み | `docs/requirements/05_functional_requirements.md:66`, `docs/requirements/04_domain_model_and_interfaces.md:153`, `capd-app/components/capd/mock-data.ts:1` | 要件・型・スパイクを同一語彙に統一 |
| P2-2 | UI標準書と最新スパイクの差分（列見出し/トークン） | 解消済み（実装版準拠） | `docs/design/08_ui_standard.md:53`, `docs/design/08_ui_standard.md:55`, `capd-app/components/capd/today-capd-note-table.tsx:42`, `capd-app/app/globals.css:6` | 交換列は `#1〜#5` に統一、表密度は画面側クラスで調整 |

## 3. 補足（実装引き継ぎで迷いやすい点）
- UIスパイクは検証目的のため、サーバー通信/永続化/厳密バリデーションの一部は簡略化しています。実装時は `docs/requirements/04_domain_model_and_interfaces.md` の契約を正とします。
- 通知仕様は「手技開始通知を本アプリ非対象」「貯留/廃液終了通知のみ対象」で固定です。開始時刻の運用通知は外部アラーム（時計アプリ）で行います。
- `opening_infuse_weight_g` は v1 で `null` 許容です。初回交換の除水量は `未計算` 表示を正とします。
