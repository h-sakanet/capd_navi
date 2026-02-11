# SCR-005-HOME-SUMMARY マップ

```mermaid
flowchart LR
  %% SCR-005-HOME-SUMMARY
  subgraph JRN["Journeys"]
    N34["JRN-005-SYNC 同期と再試行"]
    N35["JRN-008-HISTORY 記録一覧閲覧と編集"]
    N36["JRN-009-EXITPHOTO 出口部写真登録/変更/削除"]
  end
  subgraph ACT["Actions"]
    N1["ACT-EXIT-001 出口部写真登録"]
    N2["ACT-EXIT-002 出口部写真変更"]
    N3["ACT-EXIT-003 出口部写真削除"]
  end
  subgraph SCR["Screens"]
    N37["SCR-005-HOME-SUMMARY 全体サマリ"]
    N38["SCR-009-HISTORY-DETAIL 記録詳細"]
    N39["SCR-010-HISTORY-PHOTO 写真詳細"]
  end
  subgraph FC["Forms"]
    N31["FC-SUMMARY-001 summaryScope=first_of_day"]
    N32["FC-SUMMARY-002 summaryScope=last_of_day"]
    N33["FC-SUMMARY-003 summaryScope=both"]
  end
  subgraph UI["UI Elements"]
    N40["UI-HOME-010"]
    N41["UI-HOME-011"]
  end
  subgraph AT["Acceptance Tests"]
    N4["AT-BACKUP-001 日次バックアップ"]
    N5["AT-EXIT-001 表示前提（未完了）"]
    N6["AT-EXIT-002 表示前提（完了後）"]
    N7["AT-EXIT-003 両導線一貫性"]
    N8["AT-EXIT-004 端末制約"]
    N9["AT-EXIT-005 状態遷移（登録後）"]
    N10["AT-EXIT-006 1枚固定置換"]
    N11["AT-EXIT-007 削除挙動"]
    N12["AT-EXIT-008 保存後表示"]
    N13["AT-EXIT-009 同期反映"]
    N14["AT-EXIT-010 部分更新競合"]
    N15["AT-EXIT-011 both 対応"]
    N16["AT-EXIT-012 容量制御共通化"]
    N17["AT-PHOTO-001 容量上限"]
  end
  subgraph E2E["E2E Tests"]
    N22["E2E-BACKUP-001"]
    N23["E2E-EXIT-001"]
    N24["E2E-EXIT-002"]
    N25["E2E-EXIT-003"]
    N26["E2E-EXIT-004"]
    N27["E2E-EXIT-005"]
    N28["E2E-EXIT-006"]
    N29["E2E-EXIT-007"]
    N30["E2E-PHOTO-001"]
  end
  subgraph DATA["Data Paths"]
    N18["payload.exit_site_photo"]
    N19["record"]
    N20["Record"]
    N21["Record(session_summary.payload.exit_site_photo)"]
  end
  N1 --> N37
  N1 --> N38
  N1 --> N41
  N2 --> N37
  N2 --> N38
  N2 --> N41
  N3 --> N37
  N3 --> N38
  N3 --> N41
  N4 --> N22
  N5 --> N23
  N6 --> N23
  N7 --> N24
  N8 --> N25
  N9 --> N26
  N10 --> N26
  N11 --> N26
  N12 --> N26
  N13 --> N27
  N14 --> N27
  N15 --> N28
  N16 --> N29
  N17 --> N30
  N31 --> N6
  N32 --> N5
  N33 --> N15
  N35 --> N38
  N35 --> N39
  N36 --> N1
  N36 --> N2
  N36 --> N3
  N36 --> N4
  N36 --> N5
  N36 --> N6
  N36 --> N7
  N36 --> N8
  N36 --> N9
  N36 --> N10
  N36 --> N11
  N36 --> N12
  N36 --> N13
  N36 --> N14
  N36 --> N15
  N36 --> N16
  N36 --> N17
  N36 --> N22
  N36 --> N23
  N36 --> N24
  N36 --> N25
  N36 --> N26
  N36 --> N27
  N36 --> N28
  N36 --> N29
  N36 --> N30
  N36 --> N37
  N36 --> N38
  N36 --> N39
  N37 --> N40
  N37 --> N41
  N40 --> N20
  N41 --> N18
  N41 --> N19
  N41 --> N21
```

