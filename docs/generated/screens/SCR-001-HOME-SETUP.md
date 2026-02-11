# SCR-001-HOME-SETUP マップ

```mermaid
flowchart LR
  %% SCR-001-HOME-SETUP
  subgraph JRN["Journeys"]
    N15["JRN-002-SLOT 当日スロット登録と開始"]
  end
  subgraph ACT["Actions"]
    N1["ACT-HOME-001 + で手技設定を開く"]
    N2["ACT-HOME-002 手技設定を保存"]
    N3["ACT-HOME-003 ••• > 確認"]
    N4["ACT-HOME-004 ••• > 編集"]
    N5["ACT-HOME-005 カード本体タップ"]
    N6["ACT-HOME-006 確認モードで手順表示"]
    N7["ACT-HOME-008 開始/再開を確定"]
  end
  subgraph SCR["Screens"]
    N16["SCR-001-HOME Home"]
    N17["SCR-001-HOME-SETUP スロット設定"]
    N18["SCR-001-HOME-START-CONFIRM 開始確認"]
    N19["SCR-001-HOME-VIEW-CONFIRM 閲覧専用確認"]
    N20["SCR-002-HOME-SETUP"]
  end
  subgraph FC["Forms"]
    N14["FC-SLOT-SETUP-001 手技設定"]
  end
  subgraph UI["UI Elements"]
    N21["UI-HOME-004"]
  end
  subgraph AT["Acceptance Tests"]
    N8["AT-FLOW-004 端末内同時実行制限"]
    N9["AT-FLOW-005 左優先実行"]
  end
  subgraph E2E["E2E Tests"]
    N12["E2E-FLOW-001"]
    N13["E2E-FLOW-002"]
  end
  subgraph DATA["Data Paths"]
    N10["daily_plan"]
    N11["slots[n]"]
  end
  N1 --> N16
  N1 --> N17
  N1 --> N20
  N2 --> N16
  N2 --> N17
  N2 --> N21
  N3 --> N16
  N3 --> N19
  N4 --> N16
  N4 --> N17
  N4 --> N20
  N5 --> N16
  N5 --> N18
  N6 --> N19
  N7 --> N18
  N8 --> N13
  N9 --> N12
  N14 --> N9
  N15 --> N1
  N15 --> N2
  N15 --> N3
  N15 --> N4
  N15 --> N5
  N15 --> N6
  N15 --> N7
  N15 --> N8
  N15 --> N9
  N15 --> N12
  N15 --> N13
  N15 --> N16
  N15 --> N17
  N15 --> N18
  N15 --> N19
  N17 --> N14
  N17 --> N21
  N21 --> N10
  N21 --> N11
```

