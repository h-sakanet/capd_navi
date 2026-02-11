# SCR-004-HOME-VIEW-CONFIRM-FR-02 マップ

```mermaid
flowchart LR
  %% SCR-004-HOME-VIEW-CONFIRM-FR-02
  subgraph JRN["Journeys"]
    N3["JRN-002-SLOT 当日スロット登録と開始"]
  end
  subgraph ACT["Actions"]
    N1["ACT-HOME-003 ••• > 確認"]
    N2["ACT-HOME-006 確認モードで手順表示"]
  end
  subgraph SCR["Screens"]
    N4["SCR-001-HOME Home"]
    N5["SCR-001-HOME-FR-18"]
    N6["SCR-004-HOME-VIEW-CONFIRM-FR-02"]
  end
  N1 --> N4
  N3 --> N1
  N3 --> N2
  N3 --> N4
```

