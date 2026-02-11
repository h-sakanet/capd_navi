# 09. ユーザー動線定義（JRN）

## 1. 目的
本書は「誰が、どの端末で、どの順序で、何を完了させるか」を固定するための動線正本です。  
実装担当は `JRN-*` を起点に、`SCR-*` / `ACT-*` / `FC-*` / `AT-*` を逆引きして着手します。

## 2. ID規約
- 動線ID: `JRN-*`
- 画面ID: `SCR-*`（`10_screen_transition_and_actions.md`）
- 操作ID: `ACT-*`（`10_screen_transition_and_actions.md`）
- フォーム契約ID: `FC-*`（`11_form_contracts.md`）

## 3. 動線一覧（実装対象）
| JRN ID | 動線名 | 主端末 | 開始条件 | 完了条件 | 対応FR | 対応AT | Phase |
|---|---|---|---|---|---|---|---|
| JRN-CSV-001 | CSV取込（Mac） | Mac | Home表示済み、取込ディレクトリあり | テンプレート版が保存される | FR-020〜FR-024, FR-082A | AT-CSV-001〜AT-CSV-004, AT-API-003 | Phase1 |
| JRN-SLOT-001 | 当日スロット登録と開始 | Mac/iPhone | 当日4スロットが表示される | 対象スロットが `実施中` になる | FR-007〜FR-009H | AT-FLOW-004, AT-FLOW-005 | Phase1 |
| JRN-SESSION-001 | セッション進行と記録 | Mac/iPhone | 実施中セッションが存在する | 最終ステップ完了で `completed` になる | FR-030〜FR-044D | AT-FLOW-001〜AT-FLOW-003 | Phase1 |
| JRN-ABORT-001 | 非常中断と再開 | Mac/iPhone | セッション進行中 | 中断時は `未実施` に戻る、離脱時は再開できる | FR-009G, FR-039D〜FR-039G | AT-FLOW-006, AT-FLOW-007 | Phase1 |
| JRN-SYNC-001 | 同期と再試行 | Mac/iPhone | ローカル更新または手動同期要求あり | outboxが消し込まれ、同期状態が更新される | FR-080〜FR-089A | AT-SYNC-001〜AT-SYNC-006 | Phase1 |
| JRN-RECOVERY-001 | 復旧（DB消失/クラウド欠損） | Mac/iPhone | DB消失または `cloudState=missing` | ローカル正本を保持したまま復旧完了 | FR-087〜FR-087D | AT-RECOVERY-001〜AT-RECOVERY-003 | Phase1 |
| JRN-ALARM-001 | タイマー通知とACK | Mac/iPhone | `timer_event=end` 到達 | ACKで通知停止し `acked_at` 記録 | FR-050A〜FR-058B | AT-ALARM-001〜AT-ALARM-004 | Phase1 |
| JRN-HISTORY-001 | 記録一覧閲覧と編集 | Mac/iPhone | Homeから一覧へ遷移 | 直近30日記録を閲覧/編集できる | FR-010〜FR-019 | AT-UI-HOME-001 | Phase1 |
| JRN-EXITPHOTO-001 | 出口部写真登録/変更/削除 | iPhone（更新）/Mac（閲覧） | `summaryScope=both` または `first_of_day` 完了 | `payload.exit_site_photo` が更新され同期される | FR-042A〜FR-042H, FR-089A | AT-EXIT-001〜AT-EXIT-012 | Phase2 |

## 4. JRN詳細

### JRN-CSV-001 CSV取込（Mac）
1. `SCR-HOME-001` で `ACT-HOME-007`（CSV取り込み）を実行します。
2. `SCR-MAC-IMPORT-001` でディレクトリを選択します。
3. `protocol.csv` と画像群の検証を行い、エラーが1件でもあれば中止します。
4. 正規化JSONをローカルへ保存し outbox へ追記します。

### JRN-SLOT-001 当日スロット登録と開始
1. `SCR-HOME-001` で空スロットの `ACT-HOME-001`（`+`）を押します。
2. `SCR-HOME-SETUP-001` で `FC-SLOT-SETUP-001` を満たして保存します。
3. 登録済みカード本体の `ACT-HOME-005` で開始確認へ進みます。
4. `SCR-HOME-START-CONFIRM-001` で `ACT-HOME-008` を確定し `実施中` へ遷移します。

### JRN-SESSION-001 セッション進行と記録
1. `SCR-SESSION-001` で現在ステップを表示します。
2. 必須チェックがある場合は `ACT-SESSION-001` 実行前に完了します。
3. `record_event` がある場合は `ACT-SESSION-003` で記録保存します。
4. `ACT-SESSION-001` で `next_step_id` へ遷移し、最終ステップで完了処理を行います。

### JRN-ABORT-001 非常中断と再開
1. 中断時は `SCR-SESSION-001` の `ACT-SESSION-006` を実行します。
2. セッションは `aborted` で終了し、対応スロットを `未実施` に戻します。
3. 予期せぬ離脱時は `active` 維持のまま `SCR-HOME-001` から再開します。

### JRN-SYNC-001 同期と再試行
1. `startup/resume/session_complete/manual` の契機で同期を開始します。
2. `push` 成功後に `pull` を実行し差分適用します。
3. 失敗時は `SCR-SYNC-STATUS-001` に再試行導線を表示します。

### JRN-RECOVERY-001 復旧（DB消失/クラウド欠損）
1. `JRN-RECOVERY-001` では、DB消失時に `ACT-SYNC-001` の復旧処理として `restoreFromCloud` を実行します。
2. `pull` で `cloudState=missing` を検知した場合は `syncMode=full_reseed` を実行します。
3. 再シード後に再度 `pull` し `cloudState=ok` を確認して完了します。

### JRN-ALARM-001 タイマー通知とACK
1. `timer_event=end` かつ `timer_segment=dwell/drain` 到達で通知ジョブを生成します。
2. `T0`、`T+2分`、`T+5分以降3分` のルールで再通知します。
3. `ACT-ALARM-001` でACKした時点で通知停止し `acked_at` を保存します。

### JRN-HISTORY-001 記録一覧閲覧と編集
1. `SCR-HOME-001` から `ACT-HOME-010` で記録一覧へ遷移します。
2. `SCR-HISTORY-001` で30日範囲の一覧を確認します。
3. 写真リンクを押した場合は `ACT-HISTORY-001` で `SCR-HISTORY-PHOTO-001` を表示します。
4. 詳細表示で編集した項目はLWWメタ付きで保存します。

### JRN-EXITPHOTO-001 出口部写真登録/変更/削除（Phase2）
1. 対象 `session_summary` の完了後、`SCR-HOME-SUMMARY-001` または `SCR-HISTORY-DETAIL-001` に操作を表示します。
2. `ACT-EXIT-001/002/003` で登録・変更・削除します。
3. 保存は `patch_path=payload.exit_site_photo` の部分更新として同期します。

## 5. 完了判定
- 実装タスクは、着手前に対象 `JRN-*` を明示します。
- `JRN-*` ごとに `AT-*` のPassを完了条件とします。
- `JRN-*` 未接続の画面追加・機能追加は禁止します。

## 6. 動線可視化（Mermaid）
本図は `## 3` のメタ情報と `## 4` の手順を統合した参照図です。

```mermaid
flowchart LR
  START["CAPD v1 ユーザー動線"]

  subgraph JRN001["JRN-CSV-001 CSV取込（Mac）"]
    J001_META["META: Mac / Home表示済み&取込ディレクトリあり / テンプレート保存 / Phase1<br/>FR: FR-020〜FR-024, FR-082A<br/>AT: AT-CSV-001〜AT-CSV-004, AT-API-003"]
    J001_STEP1["SCR-HOME-001でACT-HOME-007"]
    J001_STEP2["SCR-MAC-IMPORT-001でディレクトリ選択"]
    J001_STEP3["protocol.csv+画像検証(エラーで中止)"]
    J001_STEP4["正規化JSON保存+outbox追記"]
    J001_META --> J001_STEP1 --> J001_STEP2 --> J001_STEP3 --> J001_STEP4
  end

  subgraph JRN002["JRN-SLOT-001 当日スロット登録と開始"]
    J002_META["META: Mac/iPhone / 当日4スロット表示 / 実施中化 / Phase1<br/>FR: FR-007〜FR-009H<br/>AT: AT-FLOW-004, AT-FLOW-005"]
    J002_STEP1["ACT-HOME-001(+)"]
    J002_STEP2["SCR-HOME-SETUP-001でFC-SLOT-SETUP-001保存"]
    J002_STEP3["ACT-HOME-005"]
    J002_STEP4["SCR-HOME-START-CONFIRM-001でACT-HOME-008"]
    J002_META --> J002_STEP1 --> J002_STEP2 --> J002_STEP3 --> J002_STEP4
  end

  subgraph JRN003["JRN-SESSION-001 セッション進行と記録"]
    J003_META["META: Mac/iPhone / 実施中セッションあり / completed到達 / Phase1<br/>FR: FR-030〜FR-044D<br/>AT: AT-FLOW-001〜AT-FLOW-003"]
    J003_STEP1["SCR-SESSION-001表示"]
    J003_STEP2["必要時チェック完了"]
    J003_STEP3["必要時ACT-SESSION-003"]
    J003_STEP4["ACT-SESSION-001でnext_step遷移&最終完了"]
    J003_META --> J003_STEP1 --> J003_STEP2 --> J003_STEP3 --> J003_STEP4
  end

  subgraph JRN004["JRN-ABORT-001 非常中断と再開"]
    J004_META["META: Mac/iPhone / セッション進行中 / 中断=未実施戻し or 離脱再開 / Phase1<br/>FR: FR-009G, FR-039D〜FR-039G<br/>AT: AT-FLOW-006, AT-FLOW-007"]
    J004_STEP1["ACT-SESSION-006"]
    J004_STEP2["aborted+未実施戻し"]
    J004_STEP3["離脱時はSCR-HOME-001から再開"]
    J004_META --> J004_STEP1 --> J004_STEP2 --> J004_STEP3
  end

  subgraph JRN005["JRN-SYNC-001 同期と再試行"]
    J005_META["META: Mac/iPhone / ローカル更新or手動同期要求 / outbox消し込み+同期状態更新 / Phase1<br/>FR: FR-080〜FR-089A<br/>AT: AT-SYNC-001〜AT-SYNC-006"]
    J005_STEP1["startup/resume/session_complete/manualで開始"]
    J005_STEP2["push成功後pull"]
    J005_STEP3["失敗時SCR-SYNC-STATUS-001再試行導線"]
    J005_META --> J005_STEP1 --> J005_STEP2 --> J005_STEP3
  end

  subgraph JRN006["JRN-RECOVERY-001 復旧（DB消失/クラウド欠損）"]
    J006_META["META: Mac/iPhone / DB消失orcloudState=missing / ローカル正本維持で復旧完了 / Phase1<br/>FR: FR-087〜FR-087D<br/>AT: AT-RECOVERY-001〜AT-RECOVERY-003"]
    J006_STEP1["ACT-SYNC-001内restoreFromCloud"]
    J006_STEP2["missing検知でfull_reseed"]
    J006_STEP3["再pullでcloudState=ok確認"]
    J006_META --> J006_STEP1 --> J006_STEP2 --> J006_STEP3
  end

  subgraph JRN007["JRN-ALARM-001 タイマー通知とACK"]
    J007_META["META: Mac/iPhone / timer_event=end到達 / ACKで停止+acked_at記録 / Phase1<br/>FR: FR-050A〜FR-058B<br/>AT: AT-ALARM-001〜AT-ALARM-004"]
    J007_STEP1["通知ジョブ生成"]
    J007_STEP2["T0,T+2,T+5以降3分再通知"]
    J007_STEP3["ACT-ALARM-001でACK保存"]
    J007_META --> J007_STEP1 --> J007_STEP2 --> J007_STEP3
  end

  subgraph JRN008["JRN-HISTORY-001 記録一覧閲覧と編集"]
    J008_META["META: Mac/iPhone / Homeから一覧遷移 / 直近30日閲覧編集 / Phase1<br/>FR: FR-010〜FR-019<br/>AT: AT-UI-HOME-001"]
    J008_STEP1["ACT-HOME-010でSCR-HISTORY-001"]
    J008_STEP2["30日一覧確認"]
    J008_STEP3["ACT-HISTORY-001でSCR-HISTORY-PHOTO-001"]
    J008_STEP4["詳細編集をLWWメタで保存"]
    J008_META --> J008_STEP1 --> J008_STEP2 --> J008_STEP3 --> J008_STEP4
  end

  subgraph JRN009["JRN-EXITPHOTO-001 出口部写真登録/変更/削除"]
    J009_META["META: iPhone更新/Mac閲覧 / summaryScope完了 / exit_site_photo更新同期 / Phase2<br/>FR: FR-042A〜FR-042H, FR-089A<br/>AT: AT-EXIT-001〜AT-EXIT-012"]
    J009_STEP1["SCR-HOME-SUMMARY-001 or SCR-HISTORY-DETAIL-001表示"]
    J009_STEP2["ACT-EXIT-001/002/003"]
    J009_STEP3["patch_path=payload.exit_site_photoで同期"]
    J009_META --> J009_STEP1 --> J009_STEP2 --> J009_STEP3
  end

  START --> J001_META
  START --> J002_META
  START --> J003_META
  START --> J004_META
  START --> J005_META
  START --> J006_META
  START --> J007_META
  START --> J008_META
  START --> J009_META

  classDef phase1 fill:#e8f5e9,stroke:#2e7d32,color:#1b5e20;
  classDef phase2 fill:#fff3e0,stroke:#ef6c00,color:#e65100;
  class J001_META,J002_META,J003_META,J004_META,J005_META,J006_META,J007_META,J008_META phase1;
  class J009_META phase2;
```
