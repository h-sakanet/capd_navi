"use client";

import Link from "next/link";
import { Download, ListCheck } from "@mynaui/icons-react";
import { useEffect, useState } from "react";

import { HomeProcedureBoard } from "@/components/capd/home-procedure-board";
import { TodayCapdNoteTable } from "@/components/capd/today-capd-note-table";
import { CapdShell } from "@/components/capd/shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { readTodayHomeNote } from "@/lib/services/home-note-query";
import type { HomeNoteEntity } from "@/lib/storage/models";
import { toDateLocalJst } from "@/lib/storage/time";

function formatDateLabel(dateLocal: string): string {
  const date = new Date(`${dateLocal}T00:00:00+09:00`);
  const weekday = new Intl.DateTimeFormat("ja-JP", { weekday: "short", timeZone: "Asia/Tokyo" }).format(date);
  const dateText = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Tokyo"
  }).format(date);
  return `${dateText} (${weekday})`;
}

export default function HomePage() {
  const [note, setNote] = useState<HomeNoteEntity | null>(null);
  const [isMac, setIsMac] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadNote() {
      const next = await readTodayHomeNote();
      if (!cancelled) {
        setNote(next);
      }
    }

    void loadNote();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (typeof navigator === "undefined") {
      return;
    }
    setIsMac(/mac/i.test(navigator.platform));
  }, []);

  useEffect(() => {
    setHydrated(true);
  }, []);

  // Hydration対策: 初回レンダー(サーバーと一致させる必要がある)では、オーバーライドを無視した実際の日付を使用する
  const fallbackDateLocal = hydrated ? toDateLocalJst() : toDateLocalJst(new Date());
  const dateLabel = formatDateLabel(note?.dateLocal ?? fallbackDateLocal);

  const [allCompleted, setAllCompleted] = useState(false);

  async function loadNote() {
    const next = await readTodayHomeNote();
    setNote(next);
  }

  return (
    <CapdShell>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-xl">{dateLabel}</CardTitle>
          <div className="flex items-center gap-2">
            <Button asChild size="icon" variant="outline" className="bg-white hover:bg-white">
              <Link href="/capd/history-list" aria-label="記録一覧を開く" title="記録一覧を開く">
                <ListCheck className="h-5 w-5" />
              </Link>
            </Button>
            {isMac ? (
              <Button asChild size="icon" variant="outline">
                <Link href="/capd/import" aria-label="CSV取り込み(Mac)" title="CSV取り込み(Mac)">
                  <Download className="h-5 w-5" />
                </Link>
              </Button>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-0">
          <HomeProcedureBoard onCompletionChange={setAllCompleted} />
          <TodayCapdNoteTable
            dateLocal={note?.dateLocal ?? fallbackDateLocal}
            note={note}
            disabled={!allCompleted}
            onSave={loadNote}
          />
        </CardContent>
      </Card>
    </CapdShell>
  );
}
