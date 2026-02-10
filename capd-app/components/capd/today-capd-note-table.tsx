import Link from "next/link";
import { ExternalLink } from "@mynaui/icons-react";

import {
  DailyCapdNote,
  calculateDailyUfTotalG,
  calculateExchangeUfG
} from "@/components/capd/mock-data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Props = {
  note: DailyCapdNote;
};

const exchangeColumns = [1, 2, 3, 4, 5] as const;
const headerItemClass = "h-8 w-28 px-2 py-1 text-xs whitespace-nowrap";
const headerColumnClass = "h-8 min-w-[124px] px-2 py-1 text-center text-xs whitespace-nowrap";
const rowLabelClass = "px-2 py-1.5 text-xs font-medium whitespace-nowrap";
const rowValueClass = "px-2 py-1.5 text-xs whitespace-nowrap";

function formatSigned(value: number): string {
  if (value > 0) {
    return `+${value}`;
  }
  return `${value}`;
}

export function TodayCapdNoteTable({ note }: Props) {
  const dailyUfTotalG = calculateDailyUfTotalG(note);
  const recordExchangeMap = new Map(note.exchanges.map((exchange) => [exchange.recordExchangeNo, exchange]));
  const timerExchangeMap = new Map(note.exchanges.map((exchange) => [exchange.timerExchangeNo, exchange]));

  return (
    <div className="space-y-3">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className={headerItemClass}>項目</TableHead>
              {exchangeColumns.map((columnNo) => (
                <TableHead key={`column-${columnNo}`} className={headerColumnClass}>
                  #{columnNo}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className={rowLabelClass}>貯留時間</TableCell>
              {exchangeColumns.map((columnNo) => {
                const exchange = timerExchangeMap.get(columnNo);
                return (
                  <TableCell key={`dwell-${columnNo}`} className={rowValueClass}>
                    {exchange ? `${exchange.dwellStart}〜${exchange.dwellEnd}` : "—"}
                  </TableCell>
                );
              })}
            </TableRow>
            <TableRow>
              <TableCell className={rowLabelClass}>透析液濃度</TableCell>
              {exchangeColumns.map((columnNo) => {
                const exchange = recordExchangeMap.get(columnNo);
                return (
                  <TableCell key={`conc-${columnNo}`} className={rowValueClass}>
                    {exchange?.csvTitle ?? "—"}
                  </TableCell>
                );
              })}
            </TableRow>
            <TableRow>
              <TableCell className={rowLabelClass}>排液量</TableCell>
              {exchangeColumns.map((columnNo) => {
                const exchange = recordExchangeMap.get(columnNo);
                return (
                  <TableCell key={`drain-${columnNo}`} className={rowValueClass}>
                    {exchange ? `${exchange.drainWeightG} g` : "—"}
                  </TableCell>
                );
              })}
            </TableRow>
            <TableRow>
              <TableCell className={rowLabelClass}>注液量</TableCell>
              {exchangeColumns.map((columnNo) => {
                const exchange = recordExchangeMap.get(columnNo);
                return (
                  <TableCell key={`infuse-${columnNo}`} className={rowValueClass}>
                    {exchange ? `${exchange.infuseWeightG} g` : "—"}
                  </TableCell>
                );
              })}
            </TableRow>
            <TableRow>
              <TableCell className={rowLabelClass}>除水量（自動）</TableCell>
              {exchangeColumns.map((columnNo) => {
                const exchange = recordExchangeMap.get(columnNo);
                if (!exchange) {
                  return (
                    <TableCell key={`uf-${columnNo}`} className={rowValueClass}>
                      —
                    </TableCell>
                  );
                }
                const exchangeIndex = note.exchanges.findIndex((item) => item.id === exchange.id);
                const uf = exchangeIndex >= 0 ? calculateExchangeUfG(note, exchangeIndex) : null;
                return (
                  <TableCell key={`uf-${columnNo}`} className={rowValueClass}>
                    {uf === null ? "未計算" : `${formatSigned(uf)} g`}
                  </TableCell>
                );
              })}
            </TableRow>
            <TableRow>
              <TableCell className={rowLabelClass}>排液時間</TableCell>
              {exchangeColumns.map((columnNo) => {
                const exchange = timerExchangeMap.get(columnNo);
                return (
                  <TableCell key={`drain-time-${columnNo}`} className={rowValueClass}>
                    {exchange ? `${exchange.drainStart}〜${exchange.drainEnd}` : "—"}
                  </TableCell>
                );
              })}
            </TableRow>
            <TableRow>
              <TableCell className={rowLabelClass}>排液の確認</TableCell>
              {exchangeColumns.map((columnNo) => {
                const exchange = recordExchangeMap.get(columnNo);
                if (!exchange) {
                  return (
                    <TableCell key={`appearance-${columnNo}`} className={rowValueClass}>
                      —
                    </TableCell>
                  );
                }
                return (
                  <TableCell key={`appearance-${columnNo}`} className="px-2 py-1.5 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span>{exchange.drainAppearance}</span>
                      {exchange.photoId && (
                        <Link
                          className="inline-flex items-center gap-1 text-xs text-primary underline-offset-2 hover:underline"
                          href={`/capd/history-photo/${exchange.photoId}`}
                        >
                          写真
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      )}
                    </div>
                  </TableCell>
                );
              })}
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="grid gap-3 rounded-lg border p-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">1日の総除水量（自動）</p>
          <p className="text-lg font-semibold">{formatSigned(dailyUfTotalG)} g</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">体重</p>
          <p className="text-lg font-semibold">{note.bodyWeightKg.toFixed(1)} kg</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">尿量 / 飲水量</p>
          <p className="text-lg font-semibold">
            {note.urineMl} / {note.fluidIntakeMl} ml
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">排便</p>
          <p className="text-lg font-semibold">{note.stoolCountPerDay} 回</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">血圧</p>
          <p className="text-lg font-semibold">
            {note.bpSys}/{note.bpDia} mmHg
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">出口部の状態</p>
          <p className="text-lg font-semibold">{note.exitSiteStatus}</p>
        </div>
        <div className="space-y-1 md:col-span-2 xl:col-span-2">
          <p className="text-xs text-muted-foreground">備考</p>
          <p className="text-lg font-semibold">{note.notes || "なし"}</p>
        </div>
      </div>
    </div>
  );
}
