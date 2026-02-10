import Link from "next/link";
import { ExternalLink } from "@mynaui/icons-react";

import {
  calculateDailyUfTotalG,
  dailyCapdNotes,
  findFirstPhotoId
} from "@/components/preview/mock-data";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const exchangeColumns = [1, 2, 3, 4, 5] as const;

function formatSigned(value: number): string {
  if (value > 0) {
    return `+${value}`;
  }
  return `${value}`;
}

export function HistoryRecordsTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="whitespace-nowrap">日付</TableHead>
          <TableHead className="whitespace-nowrap">透析液濃度</TableHead>
          <TableHead className="whitespace-nowrap">貯留時間(#1-#5)</TableHead>
          <TableHead className="whitespace-nowrap">排液量(g)</TableHead>
          <TableHead className="whitespace-nowrap">注液量(g)</TableHead>
          <TableHead className="whitespace-nowrap">排液時間</TableHead>
          <TableHead className="whitespace-nowrap">排液の確認</TableHead>
          <TableHead className="whitespace-nowrap">総除水量(自動)</TableHead>
          <TableHead className="whitespace-nowrap">尿量/飲水量</TableHead>
          <TableHead className="whitespace-nowrap">排便</TableHead>
          <TableHead className="whitespace-nowrap">体重</TableHead>
          <TableHead className="whitespace-nowrap">血圧</TableHead>
          <TableHead className="whitespace-nowrap">出口部状態</TableHead>
          <TableHead className="whitespace-nowrap">備考</TableHead>
          <TableHead className="whitespace-nowrap">写真</TableHead>
          <TableHead className="whitespace-nowrap">操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {dailyCapdNotes.map((note) => {
          const firstPhotoId = findFirstPhotoId(note);
          const recordExchangeMap = new Map(note.exchanges.map((exchange) => [exchange.recordExchangeNo, exchange]));
          const timerExchangeMap = new Map(note.exchanges.map((exchange) => [exchange.timerExchangeNo, exchange]));

          const concentrations = exchangeColumns
            .map((columnNo) => `${columnNo}:${recordExchangeMap.get(columnNo)?.csvTitle ?? "—"}`)
            .join(" / ");
          const dwellTimes = exchangeColumns
            .map((columnNo) => {
              const exchange = timerExchangeMap.get(columnNo);
              return exchange ? `${columnNo}:${exchange.dwellStart}〜${exchange.dwellEnd}` : `${columnNo}:—`;
            })
            .join(" / ");
          const drainWeights = exchangeColumns
            .map((columnNo) => {
              const exchange = recordExchangeMap.get(columnNo);
              return exchange ? `${columnNo}:${exchange.drainWeightG}` : `${columnNo}:—`;
            })
            .join(" / ");
          const infuseWeights = exchangeColumns
            .map((columnNo) => {
              const exchange = recordExchangeMap.get(columnNo);
              return exchange ? `${columnNo}:${exchange.infuseWeightG}` : `${columnNo}:—`;
            })
            .join(" / ");
          const drainTimes = exchangeColumns
            .map((columnNo) => {
              const exchange = timerExchangeMap.get(columnNo);
              return exchange ? `${columnNo}:${exchange.drainStart}〜${exchange.drainEnd}` : `${columnNo}:—`;
            })
            .join(" / ");
          const drainAppearances = exchangeColumns
            .map((columnNo) => {
              const exchange = recordExchangeMap.get(columnNo);
              return exchange ? `${columnNo}:${exchange.drainAppearance}` : `${columnNo}:—`;
            })
            .join(" / ");

          return (
            <TableRow key={note.id}>
              <TableCell className="whitespace-nowrap font-medium">
                {note.date} ({note.weekdayJp})
              </TableCell>
              <TableCell className="min-w-[220px]">{concentrations}</TableCell>
              <TableCell className="min-w-[260px]">{dwellTimes}</TableCell>
              <TableCell className="min-w-[220px]">{drainWeights}</TableCell>
              <TableCell className="min-w-[220px]">{infuseWeights}</TableCell>
              <TableCell className="min-w-[260px]">{drainTimes}</TableCell>
              <TableCell className="min-w-[180px]">{drainAppearances}</TableCell>
              <TableCell>{formatSigned(calculateDailyUfTotalG(note))} g</TableCell>
              <TableCell>
                {note.urineMl} / {note.fluidIntakeMl} ml
              </TableCell>
              <TableCell>{note.stoolCountPerDay} 回</TableCell>
              <TableCell>{note.bodyWeightKg.toFixed(1)} kg</TableCell>
              <TableCell>
                {note.bpSys}/{note.bpDia} mmHg
              </TableCell>
              <TableCell>{note.exitSiteStatus}</TableCell>
              <TableCell className="min-w-[160px]">{note.notes || "なし"}</TableCell>
              <TableCell>
                {firstPhotoId ? (
                  <Link
                    className="inline-flex items-center gap-1 text-sm text-primary underline-offset-2 hover:underline"
                    href={`/ui-preview/history-photo/${firstPhotoId}`}
                  >
                    写真を開く
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                ) : (
                  <span className="text-muted-foreground">なし</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    詳細
                  </Button>
                  <Button size="sm" variant="secondary">
                    編集
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
