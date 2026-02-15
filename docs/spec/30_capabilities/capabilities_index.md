# Capabilities Index

## 1. 目的
横断機能の一次仕様を `CAP-*` 単位で管理し、画面仕様との重複を防ぎます。

## 2. 一覧
| CAP ID | 名称 | 主責務 | 主関連JRN | 主関連SCR | Phase | 個票 |
|---|---|---|---|---|---|---|
| CAP-CSV-IMPORT-001 | CSV取込 | CSVフォーマット検証とテンプレート保存 | JRN-001-CSV | SCR-MAC-IMPORT-001 | Phase1 | [link](./CAP-CSV-IMPORT-001.md) |
| CAP-SNAPSHOT-001 | スナップショット保存 | 実施中状態/履歴反映の保存整合 | JRN-003-SESSION, JRN-008-HISTORY | SCR-SESSION-001, SCR-HISTORY-DETAIL-001 | Phase1 | [link](./CAP-SNAPSHOT-001.md) |
| CAP-SYNC-001 | 同期 | push/pull再試行と整合維持 | JRN-005-SYNC | SCR-SYNC-STATUS-001 | Phase1 | [link](./CAP-SYNC-001.md) |
| CAP-RECOVERY-001 | 復旧 | 欠損検知とfull reseed | JRN-006-RECOVERY | SCR-SYNC-STATUS-001 | Phase1 | [link](./CAP-RECOVERY-001.md) |
| CAP-ALARM-001 | 通知/ACK | end到達通知とACK停止 | JRN-007-ALARM | SCR-SESSION-001 | Phase1 | [link](./CAP-ALARM-001.md) |
| CAP-ABNORMAL-001 | 異常判定 | 排液見た目分類に基づく警告表示 | JRN-003-SESSION | SCR-SESSION-001, SCR-SESSION-RECORD-001 | Phase1 | [link](./CAP-ABNORMAL-001.md) |
| CAP-PHOTO-BACKUP-001 | 写真同期/保持 | 出口部写真の更新・保持・同期 | JRN-009-EXITPHOTO | SCR-HOME-SUMMARY-001, SCR-HISTORY-PHOTO-001 | Phase2 | [link](./CAP-PHOTO-BACKUP-001.md) |
| CAP-PLATFORM-001 | 提供形態/セキュリティ基盤 | 配布形態・接続・公開運用・UI基盤方針 | JRN-005-SYNC, JRN-007-ALARM | SCR-001-HOME, SCR-006-SESSION | Phase1 | [link](./CAP-PLATFORM-001.md) |
| CAP-STORAGE-ADMIN-001 | ストレージ管理（開発/検証専用） | localStorage/IndexedDB の可視化・削除 | JRN-010-STORAGE-ADMIN | SCR-STORAGE-ADMIN-001 | Phase1 | [link](./CAP-STORAGE-ADMIN-001.md) |

## 3. 共通運用ルール
- 画面固有のUI詳細は `../20_screens/SCR-*.md` だけで定義します。
- 列挙・型・状態遷移の厳密定義は `../40_contracts/*` に集約します。
- CAP個票は「横断責務」「失敗モード」「回復方針」を必須とします。
