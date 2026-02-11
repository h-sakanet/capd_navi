# JRN-004-ABORT マップ

```mermaid
flowchart LR
  %% JRN-004-ABORT
  subgraph JRN["Journeys"]
    N95["JRN-004-ABORT 非常中断と再開"]
  end
  subgraph ACT["Actions"]
    N1["ACT-SESSION-006 確認ダイアログ承認"]
  end
  subgraph SCR["Screens"]
    N96["SCR-001-HOME 手技開始ハブ"]
    N97["SCR-006-SESSION セッション進行"]
  end
  subgraph FR["Functional Requirements"]
    N31["FR-001"]
    N32["FR-002"]
    N33["FR-003"]
    N34["FR-004"]
    N35["FR-004A"]
    N36["FR-005"]
    N37["FR-005A"]
    N38["FR-006"]
    N39["FR-007"]
    N40["FR-008"]
    N41["FR-009A"]
    N42["FR-009B"]
    N43["FR-009C"]
    N44["FR-009D"]
    N45["FR-009E"]
    N46["FR-009F"]
    N47["FR-009G"]
    N48["FR-009H"]
    N49["FR-016"]
    N50["FR-017"]
    N51["FR-018"]
    N52["FR-019"]
    N53["FR-030"]
    N54["FR-031"]
    N55["FR-032"]
    N56["FR-033"]
    N57["FR-034"]
    N58["FR-035"]
    N59["FR-036"]
    N60["FR-037"]
    N61["FR-038"]
    N62["FR-039"]
    N63["FR-039A"]
    N64["FR-039B"]
    N65["FR-039C"]
    N66["FR-039D"]
    N67["FR-039E"]
    N68["FR-039F"]
    N69["FR-039G"]
    N70["FR-042"]
    N71["FR-050A"]
    N72["FR-050B"]
    N73["FR-050C"]
    N74["FR-050D"]
    N75["FR-051"]
    N76["FR-052"]
    N77["FR-052A"]
    N78["FR-052B"]
    N79["FR-053"]
    N80["FR-054"]
    N81["FR-055"]
    N82["FR-055A"]
    N83["FR-055B"]
    N84["FR-057"]
    N85["FR-057A"]
    N86["FR-058"]
    N87["FR-058A"]
    N88["FR-058B"]
    N89["FR-071"]
    N90["FR-072"]
    N91["FR-073"]
    N92["FR-074"]
    N93["FR-086"]
    N94["FR-088"]
  end
  subgraph AT["Acceptance Tests"]
    N2["AT-ALARM-001 T0通知"]
    N3["AT-ALARM-002 段階再通知"]
    N4["AT-ALARM-003 ACK停止"]
    N5["AT-ALARM-004 見逃し状態"]
    N6["AT-FLOW-001 必須チェック"]
    N7["AT-FLOW-002 記録ゲート"]
    N8["AT-FLOW-003 直列遷移"]
    N9["AT-FLOW-004 端末内同時実行制限"]
    N10["AT-FLOW-005 左優先実行"]
    N11["AT-FLOW-006 予期せぬ離脱再開"]
    N12["AT-FLOW-007 非常中断"]
    N13["AT-SYNC-005 手動同期消し込み"]
    N14["AT-SYNC-006 復帰時失敗導線"]
    N15["AT-UI-HOME-001 Home表示確認"]
    N16["AT-UI-HOME-002 Home初期状態"]
    N17["AT-UI-SESSION-001 Session表示確認"]
  end
  subgraph E2E["E2E Tests"]
    N18["E2E-ALARM-001"]
    N19["E2E-ALARM-002"]
    N20["E2E-ALARM-003"]
    N21["E2E-ALARM-004"]
    N22["E2E-FLOW-001"]
    N23["E2E-FLOW-002"]
    N24["E2E-FLOW-003"]
    N25["E2E-FLOW-004"]
    N26["E2E-FLOW-005"]
    N27["E2E-FLOW-006"]
    N28["E2E-FLOW-007"]
    N29["E2E-SYNC-002"]
    N30["E2E-SYNC-006"]
  end
  N1 --> N96
  N2 --> N18
  N3 --> N19
  N4 --> N20
  N5 --> N21
  N6 --> N26
  N7 --> N27
  N8 --> N28
  N9 --> N23
  N10 --> N22
  N11 --> N24
  N12 --> N25
  N13 --> N29
  N14 --> N30
  N37 --> N15
  N41 --> N15
  N42 --> N15
  N44 --> N10
  N44 --> N16
  N44 --> N22
  N46 --> N9
  N46 --> N23
  N47 --> N11
  N47 --> N24
  N53 --> N17
  N54 --> N6
  N54 --> N26
  N55 --> N7
  N55 --> N27
  N56 --> N8
  N56 --> N28
  N59 --> N9
  N59 --> N23
  N61 --> N17
  N66 --> N12
  N66 --> N25
  N67 --> N12
  N67 --> N25
  N68 --> N12
  N68 --> N25
  N71 --> N2
  N71 --> N18
  N75 --> N2
  N75 --> N18
  N77 --> N3
  N77 --> N19
  N78 --> N3
  N78 --> N19
  N79 --> N4
  N79 --> N20
  N80 --> N4
  N80 --> N20
  N86 --> N5
  N86 --> N21
  N87 --> N5
  N87 --> N21
  N88 --> N5
  N88 --> N21
  N93 --> N13
  N93 --> N29
  N94 --> N14
  N94 --> N30
  N95 --> N1
  N95 --> N11
  N95 --> N12
  N95 --> N24
  N95 --> N25
  N95 --> N47
  N95 --> N66
  N95 --> N67
  N95 --> N68
  N95 --> N69
  N95 --> N96
  N95 --> N97
  N96 --> N31
  N96 --> N32
  N96 --> N33
  N96 --> N34
  N96 --> N35
  N96 --> N36
  N96 --> N37
  N96 --> N38
  N96 --> N39
  N96 --> N40
  N96 --> N41
  N96 --> N42
  N96 --> N43
  N96 --> N44
  N96 --> N45
  N96 --> N46
  N96 --> N47
  N96 --> N48
  N96 --> N49
  N96 --> N50
  N96 --> N51
  N96 --> N52
  N96 --> N70
  N96 --> N93
  N96 --> N94
  N97 --> N53
  N97 --> N54
  N97 --> N55
  N97 --> N56
  N97 --> N57
  N97 --> N58
  N97 --> N59
  N97 --> N60
  N97 --> N61
  N97 --> N62
  N97 --> N63
  N97 --> N64
  N97 --> N65
  N97 --> N66
  N97 --> N67
  N97 --> N68
  N97 --> N69
  N97 --> N71
  N97 --> N72
  N97 --> N73
  N97 --> N74
  N97 --> N75
  N97 --> N76
  N97 --> N77
  N97 --> N78
  N97 --> N79
  N97 --> N80
  N97 --> N81
  N97 --> N82
  N97 --> N83
  N97 --> N84
  N97 --> N85
  N97 --> N86
  N97 --> N87
  N97 --> N88
  N97 --> N89
  N97 --> N90
  N97 --> N91
  N97 --> N92
```

