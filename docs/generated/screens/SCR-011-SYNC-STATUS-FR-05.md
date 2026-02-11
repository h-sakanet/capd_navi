# SCR-011-SYNC-STATUS-FR-05 マップ

```mermaid
flowchart LR
  %% SCR-011-SYNC-STATUS-FR-05
  subgraph JRN["Journeys"]
    N6["JRN-005-SYNC 同期と再試行"]
  end
  subgraph ACT["Actions"]
    N1["ACT-SYNC-001 自動同期（起動/復帰/完了）"]
  end
  subgraph SCR["Screens"]
    N7["SCR-011-SYNC-STATUS 同期状態表示"]
    N8["SCR-011-SYNC-STATUS-FR-05"]
  end
  subgraph AT["Acceptance Tests"]
    N2["AT-SYNC-003 LWW内部適用"]
    N3["AT-SYNC-004 同日同スロット競合"]
  end
  subgraph E2E["E2E Tests"]
    N4["E2E-SYNC-004"]
    N5["E2E-SYNC-005"]
  end
  N1 --> N7
  N2 --> N4
  N3 --> N5
  N6 --> N1
  N6 --> N2
  N6 --> N3
  N6 --> N4
  N6 --> N5
  N6 --> N7
```

