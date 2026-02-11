# SCR-HISTORY-001 マップ

```mermaid
flowchart LR
  %% SCR-HISTORY-001
  subgraph JRN["Journeys"]
    N9["JRN-008-HISTORY 記録一覧閲覧と編集"]
  end
  subgraph ACT["Actions"]
    N1["ACT-HISTORY-001 写真詳細を開く"]
    N2["ACT-HOME-010 なし"]
  end
  subgraph SCR["Screens"]
    N10["SCR-HISTORY-001 記録一覧"]
    N11["SCR-HISTORY-DETAIL-001 記録詳細"]
    N12["SCR-HISTORY-PHOTO-001 写真詳細"]
    N13["SCR-HOME-001 Home"]
  end
  subgraph UI["UI Elements"]
    N14["UI-HISTORY-001"]
    N15["UI-HISTORY-002"]
  end
  subgraph AT["Acceptance Tests"]
    N3["AT-UI-HOME-001 Home表示確認"]
  end
  subgraph DATA["Data Paths"]
    N4["dailyProcedurePlan"]
    N5["DayBundle.records"]
    N6["record"]
    N7["Record"]
    N8["sessions"]
  end
  N1 --> N10
  N1 --> N12
  N1 --> N15
  N2 --> N10
  N2 --> N13
  N2 --> N14
  N9 --> N1
  N9 --> N2
  N9 --> N3
  N9 --> N10
  N9 --> N11
  N9 --> N12
  N9 --> N13
  N10 --> N14
  N12 --> N15
  N14 --> N4
  N14 --> N5
  N14 --> N6
  N14 --> N7
  N14 --> N8
```

