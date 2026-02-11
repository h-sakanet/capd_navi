# SCR-011-SYNC-STATUS-FR-02 マップ

```mermaid
flowchart LR
  %% SCR-011-SYNC-STATUS-FR-02
  subgraph JRN["Journeys"]
    N6["JRN-005-SYNC 同期と再試行"]
  end
  subgraph ACT["Actions"]
    N1["ACT-SYNC-001 自動同期（起動/復帰/完了）"]
  end
  subgraph SCR["Screens"]
    N7["SCR-011-SYNC-STATUS 同期状態表示"]
    N8["SCR-011-SYNC-STATUS-FR-02"]
  end
  subgraph AT["Acceptance Tests"]
    N2["AT-SYNC-002 完了時push反映"]
    N3["AT-SYNC-005 手動同期消し込み"]
  end
  subgraph E2E["E2E Tests"]
    N4["E2E-SYNC-002"]
    N5["E2E-SYNC-003"]
  end
  N1 --> N7
  N2 --> N5
  N3 --> N4
  N6 --> N1
  N6 --> N2
  N6 --> N3
  N6 --> N4
  N6 --> N5
  N6 --> N7
```

