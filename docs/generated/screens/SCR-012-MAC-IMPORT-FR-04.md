# SCR-012-MAC-IMPORT-FR-04 マップ

```mermaid
flowchart LR
  %% SCR-012-MAC-IMPORT-FR-04
  subgraph JRN["Journeys"]
    N4["JRN-001-CSV CSV取込（Mac）"]
  end
  subgraph ACT["Actions"]
    N1["ACT-HOME-007 CSV取り込み"]
  end
  subgraph SCR["Screens"]
    N5["SCR-012-MAC-IMPORT CSV取込I/F"]
    N6["SCR-012-MAC-IMPORT-FR-04"]
  end
  subgraph AT["Acceptance Tests"]
    N2["AT-CSV-005 警告検知"]
  end
  subgraph E2E["E2E Tests"]
    N3["E2E-CSV-005"]
  end
  N1 --> N5
  N2 --> N3
  N4 --> N1
  N4 --> N5
```

