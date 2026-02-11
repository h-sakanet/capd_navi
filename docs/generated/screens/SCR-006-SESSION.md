# SCR-006-SESSION マップ

```mermaid
flowchart LR
  %% SCR-006-SESSION
  subgraph JRN["Journeys"]
    N41["JRN-002-SLOT 当日スロット登録と開始"]
    N42["JRN-003-SESSION セッション進行と記録"]
    N43["JRN-004-ABORT 非常中断と再開"]
    N44["JRN-007-ALARM タイマー通知とACK"]
  end
  subgraph ACT["Actions"]
    N1["ACT-ALARM-001 ACK"]
    N2["ACT-HOME-006 確認モードで手順表示"]
    N3["ACT-HOME-008 開始/再開を確定"]
    N4["ACT-SESSION-001 次へ"]
    N5["ACT-SESSION-002 戻る"]
    N6["ACT-SESSION-003 記録保存"]
    N7["ACT-SESSION-004 最終ステップ完了"]
    N8["ACT-SESSION-006 非常中断"]
  end
  subgraph SCR["Screens"]
    N45["SCR-001-HOME Home"]
    N46["SCR-003-HOME-START-CONFIRM 開始確認"]
    N47["SCR-004-HOME-VIEW-CONFIRM 閲覧専用確認"]
    N48["SCR-006-SESSION Session"]
    N49["SCR-007-SESSION-RECORD 記録入力"]
    N50["SCR-009-HISTORY-DETAIL 記録詳細"]
  end
  subgraph UI["UI Elements"]
    N51["UI-HOME-005"]
    N52["UI-HOME-006"]
    N53["UI-SESSION-001"]
    N54["UI-SESSION-002"]
    N55["UI-SESSION-003"]
    N56["UI-SESSION-004"]
    N57["UI-SESSION-005"]
    N58["UI-SESSION-006"]
  end
  subgraph AT["Acceptance Tests"]
    N9["AT-ALARM-001 T0通知"]
    N10["AT-ALARM-002 段階再通知"]
    N11["AT-ALARM-003 ACK停止"]
    N12["AT-ALARM-004 見逃し状態"]
    N13["AT-FLOW-001 必須チェック"]
    N14["AT-FLOW-002 記録ゲート"]
    N15["AT-FLOW-003 直列遷移"]
    N16["AT-FLOW-006 予期せぬ離脱再開"]
    N17["AT-FLOW-007 非常中断"]
  end
  subgraph E2E["E2E Tests"]
    N32["E2E-ALARM-001"]
    N33["E2E-ALARM-002"]
    N34["E2E-ALARM-003"]
    N35["E2E-ALARM-004"]
    N36["E2E-FLOW-003"]
    N37["E2E-FLOW-004"]
    N38["E2E-FLOW-005"]
    N39["E2E-FLOW-006"]
    N40["E2E-FLOW-007"]
  end
  subgraph DATA["Data Paths"]
    N18["acked_at"]
    N19["alarm_ack"]
    N20["AlarmDispatchJob.pendingAlarm"]
    N21["daily_plan"]
    N22["record完了状態"]
    N23["requiredChecks達成状態"]
    N24["session"]
    N25["session_progress"]
    N26["Session.currentStepId"]
    N27["Session.status=aborted"]
    N28["Session.status=active"]
    N29["SessionProtocolSnapshot.steps[*]"]
    N30["slot.status=pending"]
    N31["steps[*].requiredChecks"]
  end
  N1 --> N48
  N1 --> N58
  N2 --> N47
  N2 --> N48
  N2 --> N52
  N3 --> N46
  N3 --> N48
  N3 --> N51
  N4 --> N48
  N4 --> N54
  N4 --> N55
  N5 --> N48
  N6 --> N48
  N6 --> N49
  N6 --> N56
  N7 --> N45
  N7 --> N48
  N8 --> N45
  N8 --> N48
  N8 --> N57
  N9 --> N32
  N10 --> N33
  N11 --> N34
  N12 --> N35
  N13 --> N38
  N14 --> N39
  N15 --> N40
  N16 --> N36
  N17 --> N37
  N41 --> N2
  N41 --> N3
  N41 --> N45
  N41 --> N46
  N41 --> N47
  N42 --> N4
  N42 --> N5
  N42 --> N6
  N42 --> N7
  N42 --> N13
  N42 --> N14
  N42 --> N15
  N42 --> N38
  N42 --> N39
  N42 --> N40
  N42 --> N48
  N42 --> N49
  N42 --> N50
  N43 --> N8
  N43 --> N16
  N43 --> N17
  N43 --> N36
  N43 --> N37
  N43 --> N45
  N43 --> N48
  N44 --> N1
  N44 --> N9
  N44 --> N10
  N44 --> N11
  N44 --> N12
  N44 --> N32
  N44 --> N33
  N44 --> N34
  N44 --> N35
  N44 --> N48
  N46 --> N51
  N47 --> N52
  N48 --> N53
  N48 --> N54
  N48 --> N55
  N48 --> N57
  N48 --> N58
  N49 --> N56
  N51 --> N24
  N53 --> N29
  N54 --> N31
  N55 --> N22
  N55 --> N23
  N55 --> N25
  N55 --> N26
  N57 --> N21
  N57 --> N24
  N57 --> N27
  N57 --> N28
  N57 --> N30
  N58 --> N18
  N58 --> N19
  N58 --> N20
```

