# 要件トレーサビリティマップ

```mermaid
flowchart LR
  %% FR -> AT -> Test
  subgraph FR["Functional Requirements"]
    N91["- FR-001: 複数手技テンプレート一覧を表示します。"]
    N92["- FR-002: テンプレートごとに名称、版、有効開始日を表示します。"]
    N93["- FR-003: 選択した1手技でセッションを開始します。"]
    N94["- FR-004: 手技開始通知は本アプリ対象外とし、Mac/iPhoneの時計アプリ等の外部アラームで運用します。"]
    N95["- FR-004A: ホームに「手技開始通知は外部アラーム運用」の注記を表示します。"]
    N96["- FR-005: ホームには手技開始情報に加え、当日分のみCAPD記録ノート互換表を表示します（過去分は一覧画面で表示）。"]
    N97["- FR-005A: ホームAの先頭見出しは日付と曜日を表示し、手技スロットと当日ノート表は同一パネル内に配置します。"]
    N98["- FR-006: ホームから「記録一覧」画面へ遷移できる導線を提供します。"]
    N99["- FR-007: ホームAスパイクでは、1日あたり4件の手技スロットを横並びで表示します。"]
    N100["- FR-008: 手技スロットの初期状態は「+ のみ表示」とし、+ 押下で手技設定モーダル（CSV選択、推奨実施時間）を開きます。"]
    N101["- FR-009: 手技設定後は「カード本体タップ=開始」とし、開始前に「手技の開始」確認ダイアログを表示します。"]
    N102["- FR-009A: 右上 ••• メニューから「確認/編集」を開きます。確認モーダルは閲覧専用とし、ここからの「開始/再開」は手順表示のみ（確認モード）とします。確認モードでは記録保存、タイマー開始、通知ジョブ生成、アラーム設定、スロット/セッション状態更新、同期対象更新を行いません。"]
    N103["- FR-009B: 手技スロットの表示状態は 未登録(+) / 未実施 / 実施中 / 実施済み とします。実施済み のカード本体タップは無効化します。"]
    N104["- FR-009C: スロット登録時は、右隣スロットほど推奨実施時間が遅くなるように検証します（左から右へ厳密昇順、同時刻不可）。"]
    N105["- FR-009D: 右側スロットの開始時は、左側スロットがすべて 実施済み であることを必須条件にします（未登録/未実施が1件でもあれば開始不可）。"]
    N106["- FR-009E: 4スロット設定は dateLocal 単位でローカル永続化し、同期時に localRevision と cloudRevision を更新します。"]
    N107["- FR-009F: 実施済み スロットは編集/削除不可とします。同一端末で進行中セッションがある間は全スロット編集を禁止します。"]
    N108["- FR-009G: 実施中 スロットをタップした場合は新規開始せず、進行中セッションを再開します。"]
    N109["- FR-009H: 記録やタイマーを伴う実運用セッション開始/再開はカード本体タップ導線で実行し、••• > 確認 導線は閲覧専用（確認モード）とします。"]
    N110["- FR-010: 記録一覧画面で日々の手技記録を一覧表示します。"]
    N111["- FR-011: 記録一覧画面で詳細表示と編集導線を提供します。"]
    N112["- FR-012: 記録編集はLWWメタ（updatedAt, updatedByDeviceId, mutationId）を保持して競合解決可能な状態にします。"]
    N113["- FR-013: 記録一覧にはCAPDノート準拠項目（貯留時間、透析液濃度、排液量、注液量、排液時間、排液の確認、除水量、尿量、飲水量、体重、排便、血圧、出口部状態、備考）を表示します。"]
    N114["- FR-014: 写真はサムネイル固定表示ではなく、リンク押下で写真詳細画面へ遷移します。"]
    N115["- FR-014A: 記録一覧には既存写真列とは別に 出口部写真 列を追加し、未登録 / 表示 を切り替えます。"]
    N116["- FR-015: 交換ごとの除水量と1日の総除水量は、排液量 - 前回注液量 の差し引きで自動計算表示します。"]
    N117["- FR-015A: 初回交換（#1列）は前回注液量が存在しないため、除水量は 未計算 表示とします。"]
    N118["- FR-015B: 1日の総除水量は、計算可能な交換（#2列以降で前回注液量が存在する交換）のみを合算します。"]
    N119["- FR-015C: opening_infuse_weight_g（初期注液量）は v1 では空欄許容とし、除水量計算に使用しません。"]
    N120["- FR-016: 当日ノート表と記録一覧の交換列は #1〜#5 の5列固定とし、列位置は *_exchange_no で決定します。"]
    N121["- FR-017: 透析液濃度欄は、取り込みCSVのタイトル（例"]
    N122["- FR-018: record_event の値は record_exchange_no で列マッピングし、drain_weight_g は排液量、bag_weight_g は注液量、drain_appearance は排液の確認に表示します。"]
    N123["- FR-019: timer_event の値は timer_exchange_no で列マッピングし、timer_segment=dwell の start/end は貯留時間、timer_segment=drain の start/end は排液時間に表示します。"]
    N124["- FR-020: MacネイティブシェルでCSV+画像ディレクトリを選択できます。"]
    N125["- FR-021: CSV v3フォーマットのみ受け付けます。"]
    N126["- FR-022: 検証エラー1件以上で取り込みを中止します。"]
    N127["- FR-023: 警告は取り込み結果画面で一覧表示します。"]
    N128["- FR-024: 画像相対パスを protocol.csv ディレクトリ基準で解決します。"]
    N129["- FR-030: 現在ステップのフェーズと状態を常時表示し、タイトルは通し番号付き（例"]
    N130["- FR-031: 必須チェック未完了時に次ステップ遷移を禁止します。"]
    N131["- FR-032: record_event 未完了時に次ステップ遷移を禁止します。"]
    N132["- FR-033: next_step_id に従い完全シリアルで遷移します。"]
    N133["- FR-034: 最終ステップ完了時にセッション完了状態へ遷移します。"]
    N134["- FR-035: セッション開始端末のみ進行更新できます。"]
    N135["- FR-036: 同時実行セッションを端末ごとに1件へ制限します。"]
    N136["- FR-037: セッション画面の手順画像は1"]
    N137["- FR-038: セッション画面は iPhoneで1カラム、Macで2カラム表示に切り替えます。"]
    N138["- FR-039: セッション画面に「戻る」操作を提供し、直前ステップへ表示遷移できます。"]
    N139["- FR-039A: セッション画面の「戻る」と「次へ」は、iPhone/Macの双方で横並び・同幅で表示します。"]
    N140["- FR-039B: 「次へ」「戻る」押下時、および Enter キーによる次ステップ遷移時は、メインパネルを左右スライドで遷移表示します。"]
    N141["- FR-039C: セッション画面のカルーセルは、左右ナビゲーションボタンを表示しません。"]
    N142["- FR-039D: セッション画面右上 ••• メニューに セッションを中断（非常用） を配置します。"]
    N143["- FR-039E: セッションを中断（非常用） は確認ダイアログを経て実行し、中断後はホームへ戻します。"]
    N144["- FR-039F: 明示中断時はセッションを aborted で終了し、対応スロットの表示状態を 未実施 へ戻します。"]
    N145["- FR-039G: ホームのスロットには 前回中断あり の表示を出しません（履歴は記録一覧で確認）。"]
    N146["- FR-040: drain_appearance 入力モーダルを提供します。"]
    N147["- FR-041: 見た目分類は 透明/やや混濁/混濁/血性/その他 を提供します。"]
    N148["- FR-042: 廃液の記録写真（drain）は任意入力です。"]
    N149["- FR-042A: 出口部の記録写真（exit_site）は session_summary.payload.exit_site_photo に保存します（record_event は追加しません）。"]
    N150["- FR-042B: 出口部写真の対象レコードは当日 summaryScope=both を最優先し、次に summaryScope=first_of_day を採用します。同値時は completedAt 昇順、さらに同値時は recordId 昇順で決定します。"]
    N151["- FR-042C: 出口部写真の登録導線は、対象 session_summary の入力完了後に表示します。"]
    N152["- FR-042D: 出口部写真の操作導線は iPhoneホーム全体サマリ と iPhone記録詳細 の両方に表示します。Macは閲覧リンクのみ表示し、登録/変更/削除操作は許可しません。"]
    N153["- FR-042E: 出口部写真は1レコード1枚固定とし、登録後は 変更 と 削除 を許可します。"]
    N154["- FR-042F: 出口部写真の入力手段は iPhone の カメラ撮影 と ファイル選択 の両方を許可します。"]
    N155["- FR-042G: 出口部写真は任意入力であり、未登録でも手技完了を阻害しません。"]
    N156["- FR-042H: 出口部写真の削除時は session_summary.payload.exit_site_photo=null を保存し、対応画像は tombstone 化します。"]
    N157["- FR-043: drain_weight_g と bag_weight_g を g単位で保存します。"]
    N158["- FR-044: session_summary で以下を収集します。"]
    N159["- FR-044A: 同一日に1セッションのみ完了した場合は、最初/最後の両条件を同時適用し、必須項目をすべて満たす必要があります。"]
    N160["- FR-044B: 出口部状態は複数選択チェックボックスで入力し、語彙は 正常/赤み/痛み/はれ/かさぶた/じゅくじゅく/出血/膿 とします。追加の自由記述は備考欄に入力します。"]
    N161["- FR-044C: session_summary.summaryScope（first_of_day / last_of_day / both）は最終ステップ完了時にローカルで算出し、同期時に共有します。"]
    N162["- FR-044D: summaryScope が未指定または不正値でも保存拒否せず、summaryScope のみ破棄して他の妥当な入力値を保存します。"]
    N163["FR-050 CAP-ALARM-001-FR-01"]
    N164["- FR-050A: 通知対象は timer_event=end の終了イベントとし、timer_segment=dwell/drain を同一ルールで扱います。"]
    N165["- FR-050B: 同一セッション内の通知ジョブは alarm_id 単位で独立管理します。"]
    N166["- FR-050C: 通知ジョブは最低限 alarm_id / segment / due_at / acked_at / attempt_no / status を保持します。"]
    N167["- FR-050D: pendingAlarm は未ACKジョブ（pending/notified/missed）から due_at 最小を優先して1件選択し、同値時は alarm_id 昇順を採用します。"]
    N168["- FR-051: 終了時刻 T0 で Mac ローカル通知（音+バナー）を発火し、同時にアプリ内未確認アラートを固定表示します。"]
    N169["- FR-052: 未確認時は段階再通知を行います。"]
    N170["- FR-052A: 再通知間隔は T+2分（iPhone補助通知1回 + Mac再通知）、T+5分以降（3分間隔でMac+iPhone再通知）とします。"]
    N171["- FR-052B: 段階再通知の対象は「貯留終了（dwell）」「廃液終了（drain）」に限定します。"]
    N172["- FR-053: ACK時は Mac/iPhone の通知ジョブをすべて停止し、acked_at を記録します。"]
    N173["- FR-054: アプリ内アラートは ACK まで継続表示し、通知再送も ACK まで継続します。"]
    N174["- FR-055: 通知チャネルは Mac主チャネル固定 + iPhone補助 とします。"]
    N175["- FR-055A: iPhone未利用かつ離席想定時は「見逃し高リスク」警告を必須表示します。"]
    N176["- FR-055B: iPhone補助通知の利用可否は Push購読状態（登録/無効化）で管理します。"]
    N177["- FR-056: 「戻る」操作、過去ステップ再表示、アプリ再開、通信リトライでは、timer_event(start/end)・record_event・通知ジョブ生成を再発火しません。"]
    N178["- FR-057: 30秒テスト通知は手動実行とし、通知設定変更時・OS更新後・通知不調時に実施できること。"]
    N179["- FR-057A: 手動30秒テストに失敗した場合は、当日を「iPhone補助なし（Mac主導）」として扱います。"]
    N180["- FR-058: T+30分 未確認時は status=missed を永続化し、「見逃し状態」を表示します。"]
    N181["- FR-058A: status=missed になった後も、ACKまで3分間隔の再通知を継続します。"]
    N182["- FR-058B: status=missed は ACK 成功時に acknowledged へ遷移し、通知停止と acked_at 記録を行います。"]
    N183["- FR-060: 見た目分類ベースの簡易判定を行います。"]
    N184["- FR-061: 異常時は警告表示のみ行います。"]
    N185["FR-062 CAP-ABNORMAL-001-FR-03"]
    N186["- FR-070: 新版取り込み後、テンプレート版として保存します。"]
    N187["- FR-071: セッション開始時は SessionProtocolSnapshot をローカル同一トランザクションで保存し、保存失敗時は開始自体を失敗させます。"]
    N188["- FR-072: スナップショットには sourceProtocol(meta)、step定義本文（通し番号/タイトル/文言/必須チェック/timer/alarm/record）、画像 assetKey、assetManifest、snapshotHash を含めます。"]
    N189["- FR-073: セッション表示/再開時は開始時スナップショットを常に優先し、現行テンプレート版へフォールバックしません。"]
    N190["- FR-074: スナップショット欠落またはハッシュ不整合は整合性エラーとして扱い、セッション表示を停止します。"]
    N191["FR-075 CAP-SNAPSHOT-001-FR-12"]
    N192["- FR-080: 同期は startup / resume / session_complete / manual の4契機で実行します。"]
    N193["- FR-081: すべてのローカル更新は outbox に追記し、push成功時に消し込みます。"]
    N194["- FR-082: 差分取得は cloudRevision と dayRefs に基づき実行します。"]
    N195["- FR-082A: 公開HTTP APIは POST /sync/push と POST /sync/pull のみとし、CSV取り込みはローカルI/F（ProtocolImportService.importFromDirectory）で実行します。"]
    N196["- FR-083: 競合解決はエンティティ単位LWW（updatedAt, updatedByDeviceId, mutationId 降順）で固定します。"]
    N197["- FR-084: tombstone（削除）もLWW同一ルールで解決します。"]
    N198["- FR-085: 競合解決は内部適用のみとし、競合件数バナーや詳細一覧は提供しません。"]
    N199["- FR-086: 手動同期ボタンを提供し、失敗時は再試行導線を表示します。"]
    N200["- FR-087: IndexedDB消失検知時はクラウドからフルリストアを実行します。"]
    N201["- FR-087A: POST /sync/pull が cloudState=missing を返した場合、クラウド欠損と判定します。"]
    N202["- FR-087B: クラウド欠損判定時はローカルデータを正本として syncMode=full_reseed で全量再シードを実行し、ローカルデータは削除/初期化しません。"]
    N203["- FR-087C: 全量再シード成功後は再度 POST /sync/pull を実行し、cloudState=ok と cloudRevision 更新を確認して同期完了とします。"]
    N204["- FR-087D: 全量再シード失敗時はローカルデータを不変のまま保持し、lastSyncStatus=failed と再試行導線を表示します。"]
    N205["- FR-088: 同期失敗時は直近同期状態（成功/失敗）を更新し、再試行導線を表示します。"]
    N206["- FR-089: 120秒ポーリング は実装しません。"]
    N207["- FR-089A: session_summary.payload.exit_site_photo の更新は部分パッチ（patch_path=payload.exit_site_photo）で同期し、同一record内の他フィールドを上書きしません。"]
    N208["FR-090 CAP-PHOTO-BACKUP-001-FR-10"]
    N209["- FR-090A: 写真参照メタには photo_kind（drain / exit_site）を保持します。"]
    N210["FR-091 CAP-PHOTO-BACKUP-001-FR-12"]
    N211["- FR-092: 日次バックアップを1日1回実行し30日保持。"]
    N212["- FR-093: 手動エクスポート機能は v1 対象外とします。"]
    N213["FR-100 CAP-PLATFORM-001-FR-01"]
    N214["FR-101 CAP-PLATFORM-001-FR-02"]
    N215["FR-102 CAP-PLATFORM-001-FR-03"]
    N216["FR-103 CAP-PLATFORM-001-FR-04"]
    N217["FR-104 CAP-PLATFORM-001-FR-05"]
    N218["FR-105 CAP-PLATFORM-001-FR-06"]
    N219["FR-106 CAP-PLATFORM-001-FR-07"]
    N220["FR-109 CAP-PLATFORM-001-FR-08"]
    N221["FR-110 CAP-PLATFORM-001-FR-09"]
    N222["FR-111 CAP-PLATFORM-001-FR-10"]
    N223["FR-112 CAP-PLATFORM-001-FR-11"]
    N224["FR-113 CAP-PLATFORM-001-FR-12"]
    N225["FR-114 CAP-PLATFORM-001-FR-13"]
    N226["FR-115 CAP-PLATFORM-001-FR-14"]
    N227["- SCR-001-HOME-FR-01: (旧"]
    N228["- SCR-001-HOME-FR-02: (旧"]
    N229["- SCR-001-HOME-FR-03: (旧"]
    N230["- SCR-001-HOME-FR-04: (旧"]
    N231["- SCR-001-HOME-FR-05: (旧"]
    N232["- SCR-001-HOME-FR-06: (旧"]
    N233["- SCR-001-HOME-FR-07: (旧"]
    N234["- SCR-001-HOME-FR-08: (旧"]
    N235["- SCR-001-HOME-FR-09: (旧"]
    N236["- SCR-001-HOME-FR-10: (旧"]
    N237["- SCR-001-HOME-FR-11: (旧"]
    N238["- SCR-001-HOME-FR-12: (旧"]
    N239["- SCR-001-HOME-FR-13: (旧"]
    N240["- SCR-001-HOME-FR-14: (旧"]
    N241["- SCR-001-HOME-FR-15: (旧"]
    N242["- SCR-001-HOME-FR-16: (旧"]
    N243["- SCR-001-HOME-FR-17: (旧"]
    N244["- SCR-001-HOME-FR-18: (旧"]
    N245["- SCR-001-HOME-FR-19: (旧"]
    N246["- SCR-001-HOME-FR-20: (旧"]
    N247["- SCR-001-HOME-FR-21: (旧"]
    N248["- SCR-001-HOME-FR-22: (旧"]
    N249["- SCR-001-HOME-FR-23: (旧"]
    N250["- SCR-001-HOME-FR-24: (旧"]
    N251["- SCR-001-HOME-FR-25: (旧"]
    N252["- SCR-002-HOME-SETUP-FR-01: (旧"]
    N253["- SCR-002-HOME-SETUP-FR-02: (旧"]
    N254["- SCR-002-HOME-SETUP-FR-03: (旧"]
    N255["- SCR-002-HOME-SETUP-FR-04: (旧"]
    N256["- SCR-003-HOME-START-CONFIRM-FR-01: (旧"]
    N257["- SCR-003-HOME-START-CONFIRM-FR-02: (旧"]
    N258["- SCR-003-HOME-START-CONFIRM-FR-03: (旧"]
    N259["- SCR-004-HOME-VIEW-CONFIRM-FR-01: (旧"]
    N260["- SCR-004-HOME-VIEW-CONFIRM-FR-02: (旧"]
    N261["- SCR-004-HOME-VIEW-CONFIRM-FR-03: (旧"]
    N262["- SCR-005-HOME-SUMMARY-FR-01: (旧"]
    N263["- SCR-005-HOME-SUMMARY-FR-02: (旧"]
    N264["- SCR-005-HOME-SUMMARY-FR-03: (旧"]
    N265["- SCR-005-HOME-SUMMARY-FR-04: (旧"]
    N266["- SCR-005-HOME-SUMMARY-FR-05: (旧"]
    N267["- SCR-005-HOME-SUMMARY-FR-06: (旧"]
    N268["- SCR-005-HOME-SUMMARY-FR-07: (旧"]
    N269["- SCR-005-HOME-SUMMARY-FR-08: (旧"]
    N270["- SCR-005-HOME-SUMMARY-FR-09: (旧"]
    N271["- SCR-005-HOME-SUMMARY-FR-10: (旧"]
    N272["- SCR-005-HOME-SUMMARY-FR-11: (旧"]
    N273["- SCR-005-HOME-SUMMARY-FR-12: (旧"]
    N274["- SCR-005-HOME-SUMMARY-FR-13: (旧"]
    N275["- SCR-005-HOME-SUMMARY-FR-14: (旧"]
    N276["- SCR-005-HOME-SUMMARY-FR-15: (旧"]
    N277["- SCR-006-SESSION-FR-01: (旧"]
    N278["- SCR-006-SESSION-FR-02: (旧"]
    N279["- SCR-006-SESSION-FR-03: (旧"]
    N280["- SCR-006-SESSION-FR-04: (旧"]
    N281["- SCR-006-SESSION-FR-05: (旧"]
    N282["- SCR-006-SESSION-FR-06: (旧"]
    N283["- SCR-006-SESSION-FR-07: (旧"]
    N284["- SCR-006-SESSION-FR-08: (旧"]
    N285["- SCR-006-SESSION-FR-09: (旧"]
    N286["- SCR-006-SESSION-FR-10: (旧"]
    N287["- SCR-006-SESSION-FR-11: (旧"]
    N288["- SCR-006-SESSION-FR-12: (旧"]
    N289["- SCR-006-SESSION-FR-13: (旧"]
    N290["- SCR-006-SESSION-FR-14: (旧"]
    N291["- SCR-006-SESSION-FR-15: (旧"]
    N292["- SCR-006-SESSION-FR-16: (旧"]
    N293["- SCR-006-SESSION-FR-17: (旧"]
    N294["- SCR-006-SESSION-FR-18: (旧"]
    N295["- SCR-006-SESSION-FR-19: (旧"]
    N296["- SCR-006-SESSION-FR-20: (旧"]
    N297["- SCR-006-SESSION-FR-21: (旧"]
    N298["- SCR-006-SESSION-FR-22: (旧"]
    N299["- SCR-006-SESSION-FR-23: (旧"]
    N300["- SCR-006-SESSION-FR-24: (旧"]
    N301["- SCR-006-SESSION-FR-25: (旧"]
    N302["- SCR-006-SESSION-FR-26: (旧"]
    N303["- SCR-006-SESSION-FR-27: (旧"]
    N304["- SCR-006-SESSION-FR-28: (旧"]
    N305["- SCR-006-SESSION-FR-29: (旧"]
    N306["- SCR-006-SESSION-FR-30: (旧"]
    N307["- SCR-006-SESSION-FR-31: (旧"]
    N308["- SCR-006-SESSION-FR-32: (旧"]
    N309["- SCR-006-SESSION-FR-33: (旧"]
    N310["- SCR-006-SESSION-FR-34: (旧"]
    N311["- SCR-006-SESSION-FR-35: (旧"]
    N312["- SCR-006-SESSION-FR-36: (旧"]
    N313["- SCR-006-SESSION-FR-37: (旧"]
    N314["- SCR-006-SESSION-FR-38: (旧"]
    N315["- SCR-006-SESSION-FR-39: (旧"]
    N316["- SCR-006-SESSION-FR-40: (旧"]
    N317["- SCR-007-SESSION-RECORD-FR-01: (旧"]
    N318["- SCR-007-SESSION-RECORD-FR-02: (旧"]
    N319["- SCR-007-SESSION-RECORD-FR-03: (旧"]
    N320["- SCR-007-SESSION-RECORD-FR-04: (旧"]
    N321["- SCR-007-SESSION-RECORD-FR-05: (旧"]
    N322["- SCR-007-SESSION-RECORD-FR-06: (旧"]
    N323["- SCR-007-SESSION-RECORD-FR-07: (旧"]
    N324["- SCR-007-SESSION-RECORD-FR-08: (旧"]
    N325["- SCR-007-SESSION-RECORD-FR-09: (旧"]
    N326["- SCR-007-SESSION-RECORD-FR-10: (旧"]
    N327["- SCR-007-SESSION-RECORD-FR-11: (旧"]
    N328["- SCR-007-SESSION-RECORD-FR-12: (旧"]
    N329["- SCR-007-SESSION-RECORD-FR-13: (旧"]
    N330["- SCR-007-SESSION-RECORD-FR-14: (旧"]
    N331["- SCR-007-SESSION-RECORD-FR-15: (旧"]
    N332["- SCR-007-SESSION-RECORD-FR-16: (旧"]
    N333["- SCR-007-SESSION-RECORD-FR-17: (旧"]
    N334["- SCR-008-HISTORY-FR-01: (旧"]
    N335["- SCR-008-HISTORY-FR-02: (旧"]
    N336["- SCR-008-HISTORY-FR-03: (旧"]
    N337["- SCR-008-HISTORY-FR-04: (旧"]
    N338["- SCR-008-HISTORY-FR-05: (旧"]
    N339["- SCR-008-HISTORY-FR-06: (旧"]
    N340["- SCR-008-HISTORY-FR-07: (旧"]
    N341["- SCR-008-HISTORY-FR-08: (旧"]
    N342["- SCR-008-HISTORY-FR-09: (旧"]
    N343["- SCR-008-HISTORY-FR-10: (旧"]
    N344["- SCR-008-HISTORY-FR-11: (旧"]
    N345["- SCR-008-HISTORY-FR-12: (旧"]
    N346["- SCR-008-HISTORY-FR-13: (旧"]
    N347["- SCR-008-HISTORY-FR-14: (旧"]
    N348["- SCR-009-HISTORY-DETAIL-FR-01: (旧"]
    N349["- SCR-009-HISTORY-DETAIL-FR-02: (旧"]
    N350["- SCR-009-HISTORY-DETAIL-FR-03: (旧"]
    N351["- SCR-009-HISTORY-DETAIL-FR-04: (旧"]
    N352["- SCR-009-HISTORY-DETAIL-FR-05: (旧"]
    N353["- SCR-009-HISTORY-DETAIL-FR-06: (旧"]
    N354["- SCR-009-HISTORY-DETAIL-FR-07: (旧"]
    N355["- SCR-009-HISTORY-DETAIL-FR-08: (旧"]
    N356["- SCR-009-HISTORY-DETAIL-FR-09: (旧"]
    N357["- SCR-009-HISTORY-DETAIL-FR-10: (旧"]
    N358["- SCR-009-HISTORY-DETAIL-FR-11: (旧"]
    N359["- SCR-009-HISTORY-DETAIL-FR-12: (旧"]
    N360["- SCR-009-HISTORY-DETAIL-FR-13: (旧"]
    N361["- SCR-010-HISTORY-PHOTO-FR-01: (旧"]
    N362["- SCR-010-HISTORY-PHOTO-FR-02: (旧"]
    N363["- SCR-010-HISTORY-PHOTO-FR-03: (旧"]
    N364["- SCR-011-SYNC-STATUS-FR-01: (旧"]
    N365["- SCR-011-SYNC-STATUS-FR-02: (旧"]
    N366["- SCR-011-SYNC-STATUS-FR-03: (旧"]
    N367["- SCR-011-SYNC-STATUS-FR-04: (旧"]
    N368["- SCR-011-SYNC-STATUS-FR-05: (旧"]
    N369["- SCR-011-SYNC-STATUS-FR-06: (旧"]
    N370["- SCR-011-SYNC-STATUS-FR-07: (旧"]
    N371["- SCR-011-SYNC-STATUS-FR-08: (旧"]
    N372["- SCR-011-SYNC-STATUS-FR-09: (旧"]
    N373["- SCR-011-SYNC-STATUS-FR-10: (旧"]
    N374["- SCR-011-SYNC-STATUS-FR-11: (旧"]
    N375["- SCR-011-SYNC-STATUS-FR-12: (旧"]
    N376["- SCR-011-SYNC-STATUS-FR-13: (旧"]
    N377["- SCR-011-SYNC-STATUS-FR-14: (旧"]
    N378["- SCR-011-SYNC-STATUS-FR-15: (旧"]
    N379["- SCR-011-SYNC-STATUS-FR-16: (旧"]
    N380["- SCR-012-MAC-IMPORT-FR-01: (旧"]
    N381["- SCR-012-MAC-IMPORT-FR-02: (旧"]
    N382["- SCR-012-MAC-IMPORT-FR-03: (旧"]
    N383["- SCR-012-MAC-IMPORT-FR-04: (旧"]
    N384["- SCR-012-MAC-IMPORT-FR-05: (旧"]
    N385["- SCR-012-MAC-IMPORT-FR-06: (旧"]
  end
  subgraph AT["Acceptance Tests"]
    N1["AT-ALARM-001 T0通知"]
    N2["AT-ALARM-002 段階再通知"]
    N3["AT-ALARM-003 ACK停止"]
    N4["AT-ALARM-004 見逃し状態"]
    N5["AT-API-001 公開API最小化"]
    N6["AT-API-002 エクスポート廃止"]
    N7["AT-API-003 CSVローカル完結"]
    N8["AT-API-004 非暗号化キー"]
    N9["AT-BACKUP-001 日次バックアップ"]
    N10["AT-CSV-001 正常取込"]
    N11["AT-CSV-002 重複検出"]
    N12["AT-CSV-003 直列整合"]
    N13["AT-CSV-004 画像存在"]
    N14["AT-CSV-005 警告検知"]
    N15["AT-EXIT-001 表示前提（未完了）"]
    N16["AT-EXIT-002 表示前提（完了後）"]
    N17["AT-EXIT-003 両導線一貫性"]
    N18["AT-EXIT-004 端末制約"]
    N19["AT-EXIT-005 状態遷移（登録後）"]
    N20["AT-EXIT-006 1枚固定置換"]
    N21["AT-EXIT-007 削除挙動"]
    N22["AT-EXIT-008 保存後表示"]
    N23["AT-EXIT-009 同期反映"]
    N24["AT-EXIT-010 部分更新競合"]
    N25["AT-EXIT-011 both 対応"]
    N26["AT-EXIT-012 容量制御共通化"]
    N27["AT-FLOW-001 必須チェック"]
    N28["AT-FLOW-002 記録ゲート"]
    N29["AT-FLOW-003 直列遷移"]
    N30["AT-FLOW-004 端末内同時実行制限"]
    N31["AT-FLOW-005 左優先実行"]
    N32["AT-FLOW-006 予期せぬ離脱再開"]
    N33["AT-FLOW-007 非常中断"]
    N34["AT-PHOTO-001 容量上限"]
    N35["AT-PLAT-001 iPhone利用"]
    N36["AT-PLAT-002 Mac利用"]
    N37["AT-RECOVERY-001 DB消失復元"]
    N38["AT-RECOVERY-002 クラウド欠損再シード"]
    N39["AT-RECOVERY-003 再シード失敗時保全"]
    N40["AT-SLEEP-001 状態表示"]
    N41["AT-SYNC-001 起動時pull復元"]
    N42["AT-SYNC-002 完了時push反映"]
    N43["AT-SYNC-003 LWW内部適用"]
    N44["AT-SYNC-004 同日同スロット競合"]
    N45["AT-SYNC-005 手動同期消し込み"]
    N46["AT-SYNC-006 復帰時失敗導線"]
    N47["AT-UI-HOME-001 Home表示確認"]
    N48["AT-UI-HOME-002 Home初期状態"]
    N49["AT-UI-SESSION-001 Session表示確認"]
  end
  subgraph E2E["E2E Tests"]
    N50["E2E-ALARM-001"]
    N51["E2E-ALARM-002"]
    N52["E2E-ALARM-003"]
    N53["E2E-ALARM-004"]
    N54["E2E-API-001"]
    N55["E2E-API-002"]
    N56["E2E-API-003"]
    N57["E2E-API-004"]
    N58["E2E-BACKUP-001"]
    N59["E2E-CSV-001"]
    N60["E2E-CSV-002"]
    N61["E2E-CSV-003"]
    N62["E2E-CSV-004"]
    N63["E2E-CSV-005"]
    N64["E2E-EXIT-001"]
    N65["E2E-EXIT-002"]
    N66["E2E-EXIT-003"]
    N67["E2E-EXIT-004"]
    N68["E2E-EXIT-005"]
    N69["E2E-EXIT-006"]
    N70["E2E-EXIT-007"]
    N71["E2E-FLOW-001"]
    N72["E2E-FLOW-002"]
    N73["E2E-FLOW-003"]
    N74["E2E-FLOW-004"]
    N75["E2E-FLOW-005"]
    N76["E2E-FLOW-006"]
    N77["E2E-FLOW-007"]
    N78["E2E-PHOTO-001"]
    N79["E2E-PLAT-001"]
    N80["E2E-PLAT-002"]
    N81["E2E-RECOVERY-001"]
    N82["E2E-RECOVERY-002"]
    N83["E2E-RECOVERY-003"]
    N84["E2E-SLEEP-001"]
    N85["E2E-SYNC-001"]
    N86["E2E-SYNC-002"]
    N87["E2E-SYNC-003"]
    N88["E2E-SYNC-004"]
    N89["E2E-SYNC-005"]
    N90["E2E-SYNC-006"]
  end
  subgraph UT["Unit Tests"]
    N386["UT-CSV-001 parseProtocolCsv"]
    N387["UT-CSV-002 parseProtocolCsv"]
    N388["UT-CSV-003 parseProtocolCsv"]
    N389["UT-CSV-004 parseProtocolCsv"]
    N390["UT-CSV-005 parseProtocolCsv"]
    N391["UT-CSV-006 parseProtocolCsv"]
    N392["UT-CSV-007 parseProtocolCsv"]
    N393["UT-CSV-008 parseProtocolCsv"]
    N394["UT-CSV-009 parseProtocolCsv"]
    N395["UT-CSV-010 parseProtocolCsv"]
    N396["UT-CSV-011 parseProtocolCsv"]
    N397["UT-SLOT-001 readProcedureSlots"]
    N398["UT-SLOT-002 readProcedureSlots"]
    N399["UT-SLOT-003 readProcedureSlots"]
    N400["UT-SLOT-004 readProcedureSlots"]
    N401["UT-SLOT-005 writeProcedureSlots + readProcedureSlots"]
    N402["UT-SLOT-006 readActiveSession"]
    N403["UT-SLOT-007 readActiveSession"]
    N404["UT-SLOT-008 writeActiveSession + readActiveSession"]
    N405["UT-SLOT-009 clearActiveSession"]
    N406["UT-SLOT-010 createSessionId"]
    N407["UT-SLOT-011 readProcedureSlots"]
    N408["UT-SLOT-012 readActiveSession"]
    N409["UT-UF-001 calculateExchangeUfG"]
    N410["UT-UF-002 calculateExchangeUfG"]
    N411["UT-UF-003 calculateExchangeUfG"]
    N412["UT-UF-004 calculateDailyUfTotalG"]
    N413["UT-UF-005 calculateDailyDrainTotalG"]
    N414["UT-UF-006 calculateDailyInfuseTotalG"]
    N415["UT-UF-007 findFirstPhotoId"]
    N416["UT-UF-008 findFirstPhotoId"]
  end
  subgraph VR["Visual Tests"]
    N417["VR-HISTORY-001 History"]
    N418["VR-HISTORY-002 History"]
    N419["VR-HOME-001 Home"]
    N420["VR-HOME-002 Home"]
    N421["VR-HOME-003 Home"]
    N422["VR-HOME-004 Home"]
    N423["VR-SESSION-001 Session"]
    N424["VR-SESSION-002 Session"]
    N425["VR-SESSION-003 Session"]
    N426["VR-SESSION-004 Session"]
  end
  N1 --> N50
  N2 --> N51
  N3 --> N52
  N4 --> N53
  N5 --> N54
  N6 --> N56
  N7 --> N55
  N8 --> N57
  N9 --> N58
  N10 --> N59
  N10 --> N386
  N11 --> N60
  N12 --> N61
  N13 --> N62
  N14 --> N63
  N14 --> N392
  N15 --> N64
  N16 --> N64
  N17 --> N65
  N18 --> N66
  N19 --> N67
  N20 --> N67
  N21 --> N67
  N22 --> N67
  N23 --> N68
  N24 --> N68
  N25 --> N69
  N26 --> N70
  N27 --> N75
  N28 --> N76
  N29 --> N77
  N30 --> N72
  N31 --> N71
  N32 --> N73
  N33 --> N74
  N34 --> N78
  N35 --> N79
  N36 --> N80
  N37 --> N81
  N38 --> N82
  N39 --> N83
  N40 --> N84
  N41 --> N85
  N42 --> N87
  N43 --> N88
  N44 --> N89
  N45 --> N86
  N46 --> N90
  N47 --> N419
  N48 --> N422
  N49 --> N423
  N97 --> N47
  N97 --> N419
  N99 --> N30
  N99 --> N31
  N102 --> N47
  N102 --> N419
  N102 --> N420
  N102 --> N421
  N103 --> N47
  N103 --> N419
  N103 --> N420
  N103 --> N421
  N105 --> N31
  N105 --> N48
  N105 --> N71
  N105 --> N422
  N106 --> N397
  N106 --> N398
  N106 --> N399
  N106 --> N400
  N106 --> N401
  N106 --> N407
  N106 --> N408
  N107 --> N30
  N107 --> N72
  N108 --> N32
  N108 --> N33
  N108 --> N73
  N108 --> N402
  N108 --> N403
  N108 --> N404
  N108 --> N406
  N110 --> N47
  N110 --> N417
  N110 --> N418
  N113 --> N413
  N113 --> N414
  N113 --> N417
  N113 --> N418
  N114 --> N415
  N114 --> N416
  N114 --> N417
  N114 --> N418
  N116 --> N410
  N116 --> N411
  N117 --> N409
  N118 --> N412
  N124 --> N7
  N124 --> N10
  N124 --> N11
  N124 --> N12
  N124 --> N13
  N124 --> N59
  N125 --> N10
  N125 --> N59
  N125 --> N386
  N125 --> N388
  N125 --> N389
  N125 --> N390
  N125 --> N393
  N125 --> N394
  N125 --> N395
  N126 --> N11
  N126 --> N12
  N126 --> N13
  N126 --> N60
  N126 --> N61
  N126 --> N62
  N126 --> N387
  N126 --> N391
  N126 --> N396
  N127 --> N14
  N127 --> N63
  N127 --> N392
  N128 --> N13
  N128 --> N62
  N129 --> N27
  N129 --> N28
  N129 --> N29
  N129 --> N49
  N129 --> N423
  N129 --> N424
  N130 --> N27
  N130 --> N75
  N131 --> N28
  N131 --> N76
  N131 --> N425
  N132 --> N29
  N132 --> N77
  N135 --> N30
  N135 --> N72
  N137 --> N49
  N137 --> N423
  N137 --> N424
  N142 --> N33
  N142 --> N74
  N142 --> N426
  N143 --> N33
  N143 --> N74
  N143 --> N426
  N144 --> N33
  N144 --> N74
  N144 --> N405
  N149 --> N15
  N149 --> N16
  N149 --> N17
  N149 --> N18
  N149 --> N19
  N149 --> N20
  N149 --> N21
  N149 --> N22
  N149 --> N23
  N149 --> N24
  N149 --> N25
  N149 --> N26
  N149 --> N68
  N150 --> N15
  N150 --> N16
  N150 --> N25
  N150 --> N64
  N150 --> N69
  N151 --> N15
  N151 --> N16
  N151 --> N64
  N152 --> N17
  N152 --> N18
  N152 --> N65
  N152 --> N66
  N153 --> N19
  N153 --> N20
  N153 --> N21
  N153 --> N22
  N153 --> N67
  N156 --> N19
  N156 --> N20
  N156 --> N21
  N156 --> N22
  N156 --> N67
  N161 --> N25
  N161 --> N69
  N164 --> N1
  N164 --> N2
  N164 --> N3
  N164 --> N4
  N164 --> N50
  N168 --> N1
  N168 --> N50
  N170 --> N2
  N170 --> N51
  N171 --> N2
  N171 --> N51
  N172 --> N3
  N172 --> N52
  N173 --> N3
  N173 --> N52
  N180 --> N4
  N180 --> N53
  N181 --> N4
  N181 --> N53
  N182 --> N4
  N182 --> N53
  N192 --> N41
  N192 --> N42
  N192 --> N43
  N192 --> N44
  N192 --> N45
  N192 --> N46
  N192 --> N85
  N192 --> N87
  N193 --> N42
  N193 --> N45
  N193 --> N86
  N193 --> N87
  N194 --> N41
  N194 --> N85
  N195 --> N5
  N195 --> N7
  N195 --> N54
  N195 --> N55
  N196 --> N43
  N196 --> N44
  N196 --> N88
  N196 --> N89
  N197 --> N44
  N197 --> N89
  N199 --> N45
  N199 --> N86
  N200 --> N37
  N200 --> N38
  N200 --> N39
  N200 --> N81
  N201 --> N38
  N201 --> N82
  N202 --> N38
  N202 --> N82
  N203 --> N38
  N203 --> N82
  N204 --> N39
  N204 --> N83
  N205 --> N46
  N205 --> N90
  N207 --> N23
  N207 --> N24
  N207 --> N68
  N210 --> N26
  N210 --> N34
  N210 --> N70
  N210 --> N78
  N211 --> N9
  N211 --> N58
  N212 --> N6
  N212 --> N56
  N217 --> N8
  N217 --> N57
  N220 --> N35
  N220 --> N36
  N220 --> N79
  N220 --> N80
  N221 --> N36
  N221 --> N80
  N222 --> N36
  N222 --> N40
  N222 --> N80
  N222 --> N84
  N223 --> N35
  N223 --> N79
  N224 --> N40
  N224 --> N84
```

