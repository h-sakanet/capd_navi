# SCR-003-HOME-START-CONFIRM マップ

```mermaid
flowchart LR
  %% SCR-003-HOME-START-CONFIRM
  subgraph JRN["Journeys"]
    N12["JRN-002-SLOT 当日スロット登録と開始"]
  end
  subgraph ACT["Actions"]
    N1["ACT-HOME-001 進行中セッションなし"]
    N2["ACT-HOME-002 protocolId と recommendedAtLocal が妥当"]
    N3["ACT-HOME-003 ••• > 確認 かつ対象スロット登録済み"]
    N4["ACT-HOME-004 ••• > 編集 かつdisplayStatus!=completed かつ進行中なし"]
    N5["ACT-HOME-005 右側開始時に左側全完了"]
    N6["ACT-HOME-006 対象スロット登録済み"]
    N7["ACT-HOME-008 開始不可条件に該当しない"]
  end
  subgraph SCR["Screens"]
    N13["SCR-001-HOME 手技開始ハブ"]
    N14["SCR-002-HOME-SETUP スロット設定"]
    N15["SCR-003-HOME-START-CONFIRM 開始確認"]
    N16["SCR-004-HOME-VIEW-CONFIRM 閲覧専用確認"]
  end
  subgraph AT["Acceptance Tests"]
    N8["AT-FLOW-004 端末内同時実行制限"]
    N9["AT-FLOW-005 左優先実行"]
  end
  subgraph E2E["E2E Tests"]
    N10["E2E-FLOW-001"]
    N11["E2E-FLOW-002"]
  end
  N1 --> N14
  N2 --> N13
  N3 --> N16
  N4 --> N14
  N5 --> N15
  N8 --> N11
  N9 --> N10
  N12 --> N1
  N12 --> N2
  N12 --> N3
  N12 --> N4
  N12 --> N5
  N12 --> N6
  N12 --> N7
  N12 --> N8
  N12 --> N9
  N12 --> N10
  N12 --> N11
  N12 --> N13
  N12 --> N14
  N12 --> N15
  N12 --> N16
```

