# SCR-012-MAC-IMPORT-FR-01 マップ

```mermaid
flowchart LR
  %% SCR-012-MAC-IMPORT-FR-01
  subgraph JRN["Journeys"]
    N8["JRN-001-CSV CSV取込（Mac）"]
  end
  subgraph ACT["Actions"]
    N1["ACT-HOME-007 CSV取り込み"]
  end
  subgraph SCR["Screens"]
    N9["SCR-012-MAC-IMPORT CSV取込I/F"]
    N10["SCR-012-MAC-IMPORT-FR-01"]
  end
  subgraph AT["Acceptance Tests"]
    N2["AT-API-003 CSVローカル完結"]
    N3["AT-CSV-001 正常取込"]
    N4["AT-CSV-002 重複検出"]
    N5["AT-CSV-003 直列整合"]
    N6["AT-CSV-004 画像存在"]
  end
  subgraph E2E["E2E Tests"]
    N7["E2E-CSV-001"]
  end
  N1 --> N9
  N3 --> N7
  N8 --> N1
  N8 --> N2
  N8 --> N3
  N8 --> N4
  N8 --> N5
  N8 --> N6
  N8 --> N7
  N8 --> N9
```

