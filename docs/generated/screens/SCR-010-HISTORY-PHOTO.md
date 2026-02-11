# SCR-010-HISTORY-PHOTO マップ

```mermaid
flowchart LR
  %% SCR-010-HISTORY-PHOTO
  subgraph JRN["Journeys"]
    N32["JRN-008-HISTORY 記録一覧閲覧と編集"]
    N33["JRN-009-EXITPHOTO 出口部写真登録/変更/削除"]
  end
  subgraph ACT["Actions"]
    N1["ACT-EXIT-001 出口部写真登録"]
    N2["ACT-EXIT-002 出口部写真変更"]
    N3["ACT-EXIT-003 出口部写真削除"]
    N4["ACT-HISTORY-001 写真詳細を開く"]
    N5["ACT-HOME-010 なし"]
  end
  subgraph SCR["Screens"]
    N34["SCR-001-HOME Home"]
    N35["SCR-005-HOME-SUMMARY 全体サマリ"]
    N36["SCR-008-HISTORY 記録一覧"]
    N37["SCR-009-HISTORY-DETAIL 記録詳細"]
    N38["SCR-010-HISTORY-PHOTO 写真詳細"]
  end
  subgraph UI["UI Elements"]
    N39["UI-HISTORY-002"]
  end
  subgraph AT["Acceptance Tests"]
    N6["AT-BACKUP-001 日次バックアップ"]
    N7["AT-EXIT-001 表示前提（未完了）"]
    N8["AT-EXIT-002 表示前提（完了後）"]
    N9["AT-EXIT-003 両導線一貫性"]
    N10["AT-EXIT-004 端末制約"]
    N11["AT-EXIT-005 状態遷移（登録後）"]
    N12["AT-EXIT-006 1枚固定置換"]
    N13["AT-EXIT-007 削除挙動"]
    N14["AT-EXIT-008 保存後表示"]
    N15["AT-EXIT-009 同期反映"]
    N16["AT-EXIT-010 部分更新競合"]
    N17["AT-EXIT-011 both 対応"]
    N18["AT-EXIT-012 容量制御共通化"]
    N19["AT-PHOTO-001 容量上限"]
    N20["AT-UI-HOME-001 Home表示確認"]
  end
  subgraph E2E["E2E Tests"]
    N23["E2E-BACKUP-001"]
    N24["E2E-EXIT-001"]
    N25["E2E-EXIT-002"]
    N26["E2E-EXIT-003"]
    N27["E2E-EXIT-004"]
    N28["E2E-EXIT-005"]
    N29["E2E-EXIT-006"]
    N30["E2E-EXIT-007"]
    N31["E2E-PHOTO-001"]
  end
  subgraph DATA["Data Paths"]
    N21["photoRefs"]
    N22["photos/*"]
  end
  N1 --> N35
  N1 --> N37
  N2 --> N35
  N2 --> N37
  N3 --> N35
  N3 --> N37
  N4 --> N36
  N4 --> N38
  N4 --> N39
  N5 --> N34
  N5 --> N36
  N6 --> N23
  N7 --> N24
  N8 --> N24
  N9 --> N25
  N10 --> N26
  N11 --> N27
  N12 --> N27
  N13 --> N27
  N14 --> N27
  N15 --> N28
  N16 --> N28
  N17 --> N29
  N18 --> N30
  N19 --> N31
  N32 --> N4
  N32 --> N5
  N32 --> N20
  N32 --> N34
  N32 --> N36
  N32 --> N37
  N32 --> N38
  N33 --> N1
  N33 --> N2
  N33 --> N3
  N33 --> N6
  N33 --> N7
  N33 --> N8
  N33 --> N9
  N33 --> N10
  N33 --> N11
  N33 --> N12
  N33 --> N13
  N33 --> N14
  N33 --> N15
  N33 --> N16
  N33 --> N17
  N33 --> N18
  N33 --> N19
  N33 --> N23
  N33 --> N24
  N33 --> N25
  N33 --> N26
  N33 --> N27
  N33 --> N28
  N33 --> N29
  N33 --> N30
  N33 --> N31
  N33 --> N35
  N33 --> N37
  N33 --> N38
  N38 --> N39
  N39 --> N21
  N39 --> N22
```

