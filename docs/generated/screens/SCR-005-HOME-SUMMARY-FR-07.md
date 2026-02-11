# SCR-005-HOME-SUMMARY-FR-07 マップ

```mermaid
flowchart LR
  %% SCR-005-HOME-SUMMARY-FR-07
  subgraph JRN["Journeys"]
    N4["JRN-009-EXITPHOTO 出口部写真登録/変更/削除"]
  end
  subgraph SCR["Screens"]
    N5["SCR-005-HOME-SUMMARY 全体サマリ"]
    N6["SCR-005-HOME-SUMMARY-FR-07"]
    N7["SCR-007-SESSION-RECORD-FR-06"]
    N8["SCR-009-HISTORY-DETAIL-FR-06"]
  end
  subgraph AT["Acceptance Tests"]
    N1["AT-EXIT-001 表示前提（未完了）"]
    N2["AT-EXIT-002 表示前提（完了後）"]
  end
  subgraph E2E["E2E Tests"]
    N3["E2E-EXIT-001"]
  end
  N1 --> N3
  N2 --> N3
  N4 --> N1
  N4 --> N2
  N4 --> N3
  N4 --> N5
```

