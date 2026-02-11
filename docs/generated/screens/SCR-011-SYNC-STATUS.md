# SCR-011-SYNC-STATUS マップ

```mermaid
flowchart LR
  %% SCR-011-SYNC-STATUS
  subgraph JRN["Journeys"]
    N32["JRN-001-CSV CSV取込（Mac）"]
    N33["JRN-005-SYNC 同期と再試行"]
    N34["JRN-006-RECOVERY 復旧（DB消失/クラウド欠損）"]
  end
  subgraph ACT["Actions"]
    N1["ACT-HOME-011 なし"]
    N2["ACT-SESSION-004 最終ステップ完了"]
    N3["ACT-SYNC-001 自動同期（起動/復帰/完了）"]
  end
  subgraph SCR["Screens"]
    N35["SCR-001-HOME Home"]
    N36["SCR-006-SESSION Session"]
    N37["SCR-011-SYNC-STATUS 同期状態表示"]
  end
  subgraph UI["UI Elements"]
    N38["UI-SYNC-001"]
    N39["UI-SYNC-002"]
  end
  subgraph AT["Acceptance Tests"]
    N4["AT-API-001 公開API最小化"]
    N5["AT-API-003 CSVローカル完結"]
    N6["AT-API-004 非暗号化キー"]
    N7["AT-RECOVERY-001 DB消失復元"]
    N8["AT-RECOVERY-002 クラウド欠損再シード"]
    N9["AT-RECOVERY-003 再シード失敗時保全"]
    N10["AT-SYNC-001 起動時pull復元"]
    N11["AT-SYNC-002 完了時push反映"]
    N12["AT-SYNC-003 LWW内部適用"]
    N13["AT-SYNC-004 同日同スロット競合"]
    N14["AT-SYNC-005 手動同期消し込み"]
    N15["AT-SYNC-006 復帰時失敗導線"]
  end
  subgraph E2E["E2E Tests"]
    N20["E2E-API-001"]
    N21["E2E-API-002"]
    N22["E2E-API-004"]
    N23["E2E-RECOVERY-001"]
    N24["E2E-RECOVERY-002"]
    N25["E2E-RECOVERY-003"]
    N26["E2E-SYNC-001"]
    N27["E2E-SYNC-002"]
    N28["E2E-SYNC-003"]
    N29["E2E-SYNC-004"]
    N30["E2E-SYNC-005"]
    N31["E2E-SYNC-006"]
  end
  subgraph DATA["Data Paths"]
    N16["lastError"]
    N17["lastSyncedAt"]
    N18["SyncState"]
    N19["SyncState.lastSyncStatus"]
  end
  N1 --> N35
  N1 --> N39
  N2 --> N35
  N2 --> N36
  N3 --> N37
  N3 --> N38
  N4 --> N20
  N5 --> N21
  N6 --> N22
  N7 --> N23
  N8 --> N24
  N9 --> N25
  N10 --> N26
  N11 --> N28
  N12 --> N29
  N13 --> N30
  N14 --> N27
  N15 --> N31
  N32 --> N5
  N32 --> N21
  N32 --> N35
  N33 --> N1
  N33 --> N3
  N33 --> N4
  N33 --> N6
  N33 --> N10
  N33 --> N11
  N33 --> N12
  N33 --> N13
  N33 --> N14
  N33 --> N15
  N33 --> N20
  N33 --> N22
  N33 --> N26
  N33 --> N27
  N33 --> N28
  N33 --> N29
  N33 --> N30
  N33 --> N31
  N33 --> N35
  N33 --> N36
  N33 --> N37
  N34 --> N3
  N34 --> N7
  N34 --> N8
  N34 --> N9
  N34 --> N23
  N34 --> N24
  N34 --> N25
  N34 --> N37
  N37 --> N38
  N37 --> N39
  N38 --> N16
  N38 --> N17
  N38 --> N18
  N38 --> N19
  N39 --> N19
```

