# SCR-007-SESSION-RECORD-FR-17 マップ

```mermaid
flowchart LR
  %% SCR-007-SESSION-RECORD-FR-17
  subgraph JRN["Journeys"]
    N2["JRN-003-SESSION セッション進行と記録"]
  end
  subgraph ACT["Actions"]
    N1["ACT-SESSION-003 記録保存"]
  end
  subgraph SCR["Screens"]
    N3["SCR-007-SESSION-RECORD 記録入力"]
    N4["SCR-007-SESSION-RECORD-FR-17"]
  end
  N1 --> N3
  N2 --> N1
  N2 --> N3
```

