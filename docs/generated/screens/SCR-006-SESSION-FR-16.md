# SCR-006-SESSION-FR-16 マップ

```mermaid
flowchart LR
  %% SCR-006-SESSION-FR-16
  subgraph JRN["Journeys"]
    N4["JRN-004-ABORT 非常中断と再開"]
  end
  subgraph ACT["Actions"]
    N1["ACT-SESSION-006 非常中断"]
  end
  subgraph SCR["Screens"]
    N5["SCR-006-SESSION Session"]
    N6["SCR-006-SESSION-FR-16"]
  end
  subgraph AT["Acceptance Tests"]
    N2["AT-FLOW-007 非常中断"]
  end
  subgraph E2E["E2E Tests"]
    N3["E2E-FLOW-004"]
  end
  N1 --> N5
  N2 --> N3
  N4 --> N1
  N4 --> N2
  N4 --> N3
  N4 --> N5
```

