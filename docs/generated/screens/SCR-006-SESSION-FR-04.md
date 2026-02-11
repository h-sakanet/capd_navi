# SCR-006-SESSION-FR-04 マップ

```mermaid
flowchart LR
  %% SCR-006-SESSION-FR-04
  subgraph JRN["Journeys"]
    N4["JRN-003-SESSION セッション進行と記録"]
  end
  subgraph ACT["Actions"]
    N1["ACT-SESSION-001 次へ"]
  end
  subgraph SCR["Screens"]
    N5["SCR-006-SESSION Session"]
    N6["SCR-006-SESSION-FR-04"]
  end
  subgraph AT["Acceptance Tests"]
    N2["AT-FLOW-003 直列遷移"]
  end
  subgraph E2E["E2E Tests"]
    N3["E2E-FLOW-007"]
  end
  N1 --> N5
  N2 --> N3
  N4 --> N1
  N4 --> N2
  N4 --> N3
  N4 --> N5
```

