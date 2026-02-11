# Interfaces Index

## 1. 目的
I/F定義を集約し、将来の入出力追加（PDF出力・外部連携API・追加CSV等）に備えます。

## 2. 一覧
| IF ID | 名称 | 種別 | 正本 |
|---|---|---|---|
| IF-001-PROTOCOL-CSV | protocol.csv | ファイルI/F（入力） | [link](./IF-001-PROTOCOL-CSV.md) |

## 3. 運用ルール
- I/Fの一次仕様はこのディレクトリ（`35_interfaces`）に集約します。
- 画面固有の表示/操作は `20_screens` にのみ記載し、I/F意味論はここに記載します。
- I/F変更時は関連 `SCR` / `CAP` / `40_contracts` の参照リンク更新を必須とします。
