# SCR-001-HOME マップ

```mermaid
flowchart LR
  %% SCR-001-HOME
  subgraph JRN["Journeys"]
    N62["JRN-001-CSV CSV取込（Mac）"]
    N63["JRN-002-SLOT 当日スロット登録と開始"]
    N64["JRN-003-SESSION セッション進行と記録"]
    N65["JRN-004-ABORT 非常中断と再開"]
    N66["JRN-005-SYNC 同期と再試行"]
    N67["JRN-008-HISTORY 記録一覧閲覧と編集"]
  end
  subgraph ACT["Actions"]
    N1["ACT-HISTORY-001 写真詳細を開く"]
    N2["ACT-HOME-001 + で手技設定を開く"]
    N3["ACT-HOME-002 手技設定を保存"]
    N4["ACT-HOME-003 ••• > 確認"]
    N5["ACT-HOME-004 ••• > 編集"]
    N6["ACT-HOME-005 カード本体タップ"]
    N7["ACT-HOME-006 確認モードで手順表示"]
    N8["ACT-HOME-007 CSV取り込み"]
    N9["ACT-HOME-008 開始/再開を確定"]
    N10["ACT-HOME-010 なし"]
    N11["ACT-HOME-011 なし"]
    N12["ACT-SESSION-004 最終ステップ完了"]
    N13["ACT-SESSION-006 非常中断"]
    N14["ACT-SYNC-001 自動同期（起動/復帰/完了）"]
  end
  subgraph SCR["Screens"]
    N68["SCR-001-HOME Home"]
    N69["SCR-002-HOME-SETUP スロット設定"]
    N70["SCR-003-HOME-START-CONFIRM 開始確認"]
    N71["SCR-004-HOME-VIEW-CONFIRM 閲覧専用確認"]
    N72["SCR-006-SESSION Session"]
    N73["SCR-008-HISTORY 記録一覧"]
    N74["SCR-009-HISTORY-DETAIL 記録詳細"]
    N75["SCR-010-HISTORY-PHOTO 写真詳細"]
    N76["SCR-011-SYNC-STATUS 同期状態表示"]
    N77["SCR-012-MAC-IMPORT CSV取込I/F"]
  end
  subgraph UI["UI Elements"]
    N78["UI-HISTORY-001"]
    N79["UI-HOME-001"]
    N80["UI-HOME-002"]
    N81["UI-HOME-003"]
    N82["UI-HOME-003A"]
    N83["UI-HOME-004"]
    N84["UI-HOME-007"]
    N85["UI-HOME-008"]
    N86["UI-HOME-009"]
    N87["UI-SESSION-005"]
    N88["UI-SYNC-002"]
  end
  subgraph AT["Acceptance Tests"]
    N15["AT-API-001 公開API最小化"]
    N16["AT-API-003 CSVローカル完結"]
    N17["AT-API-004 非暗号化キー"]
    N18["AT-CSV-001 正常取込"]
    N19["AT-CSV-002 重複検出"]
    N20["AT-CSV-003 直列整合"]
    N21["AT-CSV-004 画像存在"]
    N22["AT-FLOW-004 端末内同時実行制限"]
    N23["AT-FLOW-005 左優先実行"]
    N24["AT-FLOW-006 予期せぬ離脱再開"]
    N25["AT-FLOW-007 非常中断"]
    N26["AT-SYNC-001 起動時pull復元"]
    N27["AT-SYNC-002 完了時push反映"]
    N28["AT-SYNC-003 LWW内部適用"]
    N29["AT-SYNC-004 同日同スロット競合"]
    N30["AT-SYNC-005 手動同期消し込み"]
    N31["AT-SYNC-006 復帰時失敗導線"]
    N32["AT-UI-HOME-001 Home表示確認"]
  end
  subgraph E2E["E2E Tests"]
    N45["E2E-API-001"]
    N46["E2E-API-002"]
    N47["E2E-API-004"]
    N48["E2E-CSV-001"]
    N49["E2E-CSV-002"]
    N50["E2E-CSV-003"]
    N51["E2E-CSV-004"]
    N52["E2E-FLOW-001"]
    N53["E2E-FLOW-002"]
    N54["E2E-FLOW-003"]
    N55["E2E-FLOW-004"]
    N56["E2E-SYNC-001"]
    N57["E2E-SYNC-002"]
    N58["E2E-SYNC-003"]
    N59["E2E-SYNC-004"]
    N60["E2E-SYNC-005"]
    N61["E2E-SYNC-006"]
  end
  subgraph DATA["Data Paths"]
    N33["DailyProcedurePlan.dateLocal"]
    N34["DailyProcedurePlan.slots[*].displayStatus"]
    N35["platform"]
    N36["protocol"]
    N37["ProtocolPackage"]
    N38["recommendedAtLocal"]
    N39["record_exchange_no)"]
    N40["Record(record_event"]
    N41["Record(timer_event"]
    N42["slots[*].protocolTitle"]
    N43["slots[n].displayStatus"]
    N44["timer_exchange_no)"]
  end
  N1 --> N73
  N1 --> N75
  N2 --> N68
  N2 --> N69
  N3 --> N68
  N3 --> N69
  N3 --> N83
  N4 --> N68
  N4 --> N71
  N5 --> N68
  N5 --> N69
  N6 --> N68
  N6 --> N70
  N6 --> N82
  N7 --> N71
  N7 --> N72
  N8 --> N68
  N8 --> N77
  N8 --> N84
  N9 --> N70
  N9 --> N72
  N10 --> N68
  N10 --> N73
  N10 --> N78
  N11 --> N68
  N11 --> N88
  N12 --> N68
  N12 --> N72
  N13 --> N68
  N13 --> N72
  N13 --> N87
  N14 --> N76
  N15 --> N45
  N16 --> N46
  N17 --> N47
  N18 --> N48
  N19 --> N49
  N20 --> N50
  N21 --> N51
  N22 --> N53
  N23 --> N52
  N24 --> N54
  N25 --> N55
  N26 --> N56
  N27 --> N58
  N28 --> N59
  N29 --> N60
  N30 --> N57
  N31 --> N61
  N62 --> N8
  N62 --> N16
  N62 --> N18
  N62 --> N19
  N62 --> N20
  N62 --> N21
  N62 --> N46
  N62 --> N48
  N62 --> N49
  N62 --> N50
  N62 --> N51
  N62 --> N68
  N62 --> N77
  N63 --> N2
  N63 --> N3
  N63 --> N4
  N63 --> N5
  N63 --> N6
  N63 --> N7
  N63 --> N9
  N63 --> N22
  N63 --> N23
  N63 --> N52
  N63 --> N53
  N63 --> N68
  N63 --> N69
  N63 --> N70
  N63 --> N71
  N64 --> N12
  N64 --> N72
  N64 --> N74
  N65 --> N13
  N65 --> N24
  N65 --> N25
  N65 --> N54
  N65 --> N55
  N65 --> N68
  N65 --> N72
  N66 --> N11
  N66 --> N14
  N66 --> N15
  N66 --> N17
  N66 --> N26
  N66 --> N27
  N66 --> N28
  N66 --> N29
  N66 --> N30
  N66 --> N31
  N66 --> N45
  N66 --> N47
  N66 --> N56
  N66 --> N57
  N66 --> N58
  N66 --> N59
  N66 --> N60
  N66 --> N61
  N66 --> N68
  N66 --> N76
  N67 --> N1
  N67 --> N10
  N67 --> N32
  N67 --> N68
  N67 --> N73
  N67 --> N74
  N67 --> N75
  N68 --> N79
  N68 --> N80
  N68 --> N81
  N68 --> N82
  N68 --> N84
  N68 --> N85
  N68 --> N86
  N69 --> N83
  N72 --> N87
  N73 --> N78
  N76 --> N88
  N79 --> N33
  N80 --> N34
  N81 --> N38
  N81 --> N42
  N82 --> N43
  N84 --> N35
  N84 --> N36
  N84 --> N37
  N85 --> N41
  N85 --> N44
  N86 --> N39
  N86 --> N40
```

