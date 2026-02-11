# SCR-012-MAC-IMPORT マップ

```mermaid
flowchart LR
  %% SCR-012-MAC-IMPORT
  subgraph JRN["Journeys"]
    N12["JRN-001-CSV CSV取込（Mac）"]
  end
  subgraph ACT["Actions"]
    N1["ACT-HOME-007 CSV取り込み"]
  end
  subgraph SCR["Screens"]
    N13["SCR-001-HOME Home"]
    N14["SCR-012-MAC-IMPORT CSV取込I/F"]
  end
  subgraph UI["UI Elements"]
    N15["UI-HOME-007"]
  end
  subgraph AT["Acceptance Tests"]
    N2["AT-API-003 CSVローカル完結"]
    N3["AT-CSV-001 正常取込"]
    N4["AT-CSV-002 重複検出"]
    N5["AT-CSV-003 直列整合"]
    N6["AT-CSV-004 画像存在"]
  end
  subgraph E2E["E2E Tests"]
    N7["E2E-API-002"]
    N8["E2E-CSV-001"]
    N9["E2E-CSV-002"]
    N10["E2E-CSV-003"]
    N11["E2E-CSV-004"]
  end
  N1 --> N13
  N1 --> N14
  N1 --> N15
  N2 --> N7
  N3 --> N8
  N4 --> N9
  N5 --> N10
  N6 --> N11
  N12 --> N1
  N12 --> N2
  N12 --> N3
  N12 --> N4
  N12 --> N5
  N12 --> N6
  N12 --> N7
  N12 --> N8
  N12 --> N9
  N12 --> N10
  N12 --> N11
  N12 --> N13
  N12 --> N14
  N13 --> N15
```

