# SCR-007-SESSION-RECORD マップ

```mermaid
flowchart LR
  %% SCR-007-SESSION-RECORD
  subgraph JRN["Journeys"]
    N20["JRN-003-SESSION セッション進行と記録"]
  end
  subgraph ACT["Actions"]
    N1["ACT-SESSION-001 必須チェック完了かつrecord_event完了"]
    N2["ACT-SESSION-002 先頭ステップ以外"]
    N3["ACT-SESSION-003 FC-* 必須条件充足"]
    N4["ACT-SESSION-004 最終ステップ到達"]
  end
  subgraph SCR["Screens"]
    N21["SCR-006-SESSION セッション進行"]
    N22["SCR-007-SESSION-RECORD 記録入力"]
    N23["SCR-009-HISTORY-DETAIL 記録詳細"]
  end
  subgraph FC["Forms"]
    N14["FC-BAG-WEIGHT-001"]
    N15["FC-DRAIN-APPEARANCE-001"]
    N16["FC-DRAIN-WEIGHT-001"]
    N17["FC-SUMMARY-001"]
    N18["FC-SUMMARY-002"]
    N19["FC-SUMMARY-003"]
  end
  subgraph UI["UI Elements"]
    N24["UI-001-RECORD"]
    N25["UI-002-RECORD"]
    N26["UI-003-RECORD"]
    N27["UI-004-RECORD"]
  end
  subgraph AT["Acceptance Tests"]
    N5["AT-EXIT-001 表示前提（未完了）"]
    N6["AT-EXIT-002 表示前提（完了後）"]
    N7["AT-EXIT-011 both 対応"]
    N8["AT-FLOW-001 必須チェック"]
    N9["AT-FLOW-002 記録ゲート"]
    N10["AT-FLOW-003 直列遷移"]
  end
  subgraph E2E["E2E Tests"]
    N11["E2E-FLOW-005"]
    N12["E2E-FLOW-006"]
    N13["E2E-FLOW-007"]
  end
  N1 --> N21
  N2 --> N21
  N3 --> N21
  N3 --> N22
  N8 --> N11
  N9 --> N12
  N10 --> N13
  N14 --> N9
  N14 --> N26
  N15 --> N9
  N15 --> N24
  N16 --> N9
  N16 --> N25
  N17 --> N6
  N17 --> N27
  N18 --> N5
  N18 --> N27
  N19 --> N7
  N19 --> N27
  N20 --> N1
  N20 --> N2
  N20 --> N3
  N20 --> N4
  N20 --> N8
  N20 --> N9
  N20 --> N10
  N20 --> N11
  N20 --> N12
  N20 --> N13
  N20 --> N21
  N20 --> N22
  N20 --> N23
  N22 --> N14
  N22 --> N15
  N22 --> N16
  N22 --> N17
  N22 --> N18
  N22 --> N19
```

