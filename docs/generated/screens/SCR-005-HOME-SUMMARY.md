# SCR-005-HOME-SUMMARY マップ

```mermaid
flowchart LR
  %% SCR-005-HOME-SUMMARY
  subgraph JRN["Journeys"]
    N27["JRN-005-SYNC 同期と再試行"]
    N28["JRN-008-HISTORY 記録一覧閲覧と編集"]
    N29["JRN-009-EXITPHOTO 出口部写真登録/変更/削除"]
  end
  subgraph ACT["Actions"]
    N1["ACT-EXIT-001 iPhoneかつ対象summaryScope完了"]
    N2["ACT-EXIT-002 iPhoneかつ既存写真あり"]
    N3["ACT-EXIT-003 iPhoneかつ既存写真あり"]
  end
  subgraph SCR["Screens"]
    N30["SCR-005-HOME-SUMMARY 全体サマリ"]
    N31["SCR-009-HISTORY-DETAIL 記録詳細"]
    N32["SCR-010-HISTORY-PHOTO 写真詳細"]
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
    N18["E2E-BACKUP-001"]
    N19["E2E-EXIT-001"]
    N20["E2E-EXIT-002"]
    N21["E2E-EXIT-003"]
    N22["E2E-EXIT-004"]
    N23["E2E-EXIT-005"]
    N24["E2E-EXIT-006"]
    N25["E2E-EXIT-007"]
    N26["E2E-PHOTO-001"]
  end
  N1 --> N30
  N1 --> N31
  N2 --> N30
  N2 --> N31
  N3 --> N30
  N3 --> N31
  N4 --> N18
  N5 --> N19
  N6 --> N19
  N7 --> N20
  N8 --> N21
  N9 --> N22
  N10 --> N22
  N11 --> N22
  N12 --> N22
  N13 --> N23
  N14 --> N23
  N15 --> N24
  N16 --> N25
  N17 --> N26
  N28 --> N31
  N28 --> N32
  N29 --> N1
  N29 --> N2
  N29 --> N3
  N29 --> N4
  N29 --> N5
  N29 --> N6
  N29 --> N7
  N29 --> N8
  N29 --> N9
  N29 --> N10
  N29 --> N11
  N29 --> N12
  N29 --> N13
  N29 --> N14
  N29 --> N15
  N29 --> N16
  N29 --> N17
  N29 --> N18
  N29 --> N19
  N29 --> N20
  N29 --> N21
  N29 --> N22
  N29 --> N23
  N29 --> N24
  N29 --> N25
  N29 --> N26
  N29 --> N30
  N29 --> N31
  N29 --> N32
```

