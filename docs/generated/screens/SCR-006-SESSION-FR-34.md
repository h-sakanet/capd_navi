# SCR-006-SESSION-FR-34 マップ

```mermaid
flowchart LR
  %% SCR-006-SESSION-FR-34
  subgraph JRN["Journeys"]
    N3["JRN-007-ALARM タイマー通知とACK"]
  end
  subgraph SCR["Screens"]
    N4["SCR-006-SESSION Session"]
    N5["SCR-006-SESSION-FR-34"]
  end
  subgraph AT["Acceptance Tests"]
    N1["AT-ALARM-004 見逃し状態"]
  end
  subgraph E2E["E2E Tests"]
    N2["E2E-ALARM-004"]
  end
  N1 --> N2
  N3 --> N1
  N3 --> N2
  N3 --> N4
```

