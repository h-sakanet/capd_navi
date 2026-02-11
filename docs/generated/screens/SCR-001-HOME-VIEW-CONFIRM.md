# SCR-001-HOME-VIEW-CONFIRM マップ

```mermaid
flowchart LR
  %% SCR-001-HOME-VIEW-CONFIRM
  subgraph JRN["Journeys"]
    N13["JRN-002-SLOT 当日スロット登録と開始"]
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
    N14["SCR-001-HOME Home"]
    N15["SCR-001-HOME-SETUP スロット設定"]
    N16["SCR-001-HOME-START-CONFIRM 開始確認"]
    N17["SCR-001-HOME-VIEW-CONFIRM 閲覧専用確認"]
    N18["SCR-001-SESSION Session"]
    N19["SCR-004-HOME-VIEW-CONFIRM"]
    N20["SCR-006-SESSION"]
  end
  subgraph UI["UI Elements"]
    N21["UI-HOME-006"]
  end
  subgraph AT["Acceptance Tests"]
    N8["AT-FLOW-004 端末内同時実行制限"]
    N9["AT-FLOW-005 左優先実行"]
  end
  subgraph E2E["E2E Tests"]
    N11["E2E-FLOW-001"]
    N12["E2E-FLOW-002"]
  end
  subgraph DATA["Data Paths"]
    N10["slots[n]"]
  end
  N1 --> N14
  N1 --> N15
  N2 --> N14
  N2 --> N15
  N3 --> N14
  N3 --> N17
  N3 --> N19
  N4 --> N14
  N4 --> N15
  N5 --> N14
  N5 --> N16
  N6 --> N17
  N6 --> N18
  N6 --> N20
  N6 --> N21
  N7 --> N16
  N7 --> N18
  N7 --> N20
  N8 --> N12
  N9 --> N11
  N13 --> N1
  N13 --> N2
  N13 --> N3
  N13 --> N4
  N13 --> N5
  N13 --> N6
  N13 --> N7
  N13 --> N8
  N13 --> N9
  N13 --> N11
  N13 --> N12
  N13 --> N14
  N13 --> N15
  N13 --> N16
  N13 --> N17
  N17 --> N21
  N21 --> N10
```

