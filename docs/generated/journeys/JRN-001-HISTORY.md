# JRN-001-HISTORY マップ

```mermaid
flowchart LR
  %% JRN-001-HISTORY
  subgraph JRN["Journeys"]
    N34["JRN-001-HISTORY 記録一覧閲覧と編集"]
  end
  subgraph ACT["Actions"]
    N1["ACT-HISTORY-001 写真詳細を開く"]
    N2["ACT-HOME-010 なし"]
  end
  subgraph SCR["Screens"]
    N35["SCR-HISTORY-001 記録一覧"]
    N36["SCR-HISTORY-DETAIL-001 記録詳細"]
    N37["SCR-HISTORY-PHOTO-001 写真詳細"]
    N38["SCR-HOME-001 Home"]
  end
  subgraph UI["UI Elements"]
    N39["UI-HISTORY-001"]
    N40["UI-HISTORY-002"]
    N41["UI-HOME-001"]
    N42["UI-HOME-002"]
    N43["UI-HOME-003"]
    N44["UI-HOME-003A"]
    N45["UI-HOME-007"]
    N46["UI-HOME-008"]
    N47["UI-HOME-009"]
  end
  subgraph FR["Functional Requirements"]
    N23["- FR-006: ホームから「記録一覧」画面へ遷移できる導線を提供します。"]
    N24["- FR-010: 記録一覧画面で日々の手技記録を一覧表示します。"]
    N25["- FR-011: 記録一覧画面で詳細表示と編集導線を提供します。"]
    N26["- FR-012: 記録編集はLWWメタ（updatedAt, updatedByDeviceId, mutationId）を保持して競合解決可能な状態にします。"]
    N27["- FR-013: 記録一覧にはCAPDノート準拠項目（貯留時間、透析液濃度、排液量、注液量、排液時間、排液の確認、除水量、尿量、飲水量、体重、排便、血圧、出口部状態、備考）を表示します。"]
    N28["- FR-014: 写真はサムネイル固定表示ではなく、リンク押下で写真詳細画面へ遷移します。"]
    N29["- FR-015: 交換ごとの除水量と1日の総除水量は、排液量 - 前回注液量 の差し引きで自動計算表示します。"]
    N30["- FR-016: 当日ノート表と記録一覧の交換列は #1〜#5 の5列固定とし、列位置は *_exchange_no で決定します。"]
    N31["- FR-017: 透析液濃度欄は、取り込みCSVのタイトル（例"]
    N32["- FR-018: record_event の値は record_exchange_no で列マッピングし、drain_weight_g は排液量、bag_weight_g は注液量、drain_appearance は排液の確認に表示します。"]
    N33["- FR-019: timer_event の値は timer_exchange_no で列マッピングし、timer_segment=dwell の start/end は貯留時間、timer_segment=drain の start/end は排液時間に表示します。"]
  end
  subgraph AT["Acceptance Tests"]
    N3["AT-UI-HOME-001 Home表示確認"]
  end
  subgraph DATA["Data Paths"]
    N4["dailyProcedurePlan"]
    N5["DailyProcedurePlan.dateLocal"]
    N6["DailyProcedurePlan.slots[*].displayStatus"]
    N7["DayBundle.records"]
    N8["photoRefs"]
    N9["photos/*"]
    N10["platform"]
    N11["protocol"]
    N12["ProtocolPackage"]
    N13["recommendedAtLocal"]
    N14["record"]
    N15["Record"]
    N16["record_exchange_no)"]
    N17["Record(record_event"]
    N18["Record(timer_event"]
    N19["sessions"]
    N20["slots[*].protocolTitle"]
    N21["slots[n].displayStatus"]
    N22["timer_exchange_no)"]
  end
  N1 --> N28
  N1 --> N35
  N1 --> N37
  N1 --> N40
  N2 --> N23
  N2 --> N35
  N2 --> N38
  N2 --> N39
  N24 --> N3
  N34 --> N1
  N34 --> N2
  N34 --> N3
  N34 --> N24
  N34 --> N25
  N34 --> N26
  N34 --> N27
  N34 --> N28
  N34 --> N29
  N34 --> N30
  N34 --> N31
  N34 --> N32
  N34 --> N33
  N34 --> N35
  N34 --> N36
  N34 --> N37
  N34 --> N38
  N35 --> N39
  N37 --> N40
  N38 --> N41
  N38 --> N42
  N38 --> N43
  N38 --> N44
  N38 --> N45
  N38 --> N46
  N38 --> N47
  N39 --> N4
  N39 --> N7
  N39 --> N14
  N39 --> N15
  N39 --> N19
  N40 --> N8
  N40 --> N9
  N41 --> N5
  N42 --> N6
  N43 --> N13
  N43 --> N20
  N44 --> N21
  N45 --> N10
  N45 --> N11
  N45 --> N12
  N46 --> N18
  N46 --> N22
  N47 --> N16
  N47 --> N17
```

