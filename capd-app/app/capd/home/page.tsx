"use client";

import Link from "next/link";
import { ListCheck } from "@mynaui/icons-react";

import { HomeProcedureBoard } from "@/components/capd/home-procedure-board";
import { dailyCapdNotes } from "@/components/capd/mock-data";
import { TodayCapdNoteTable } from "@/components/capd/today-capd-note-table";
import { CapdShell } from "@/components/capd/shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  const todayNote = dailyCapdNotes[0];

  return (
    <CapdShell>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{`${todayNote.date} (${todayNote.weekdayJp})`}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-0">
            <p className="text-sm text-muted-foreground">手技開始通知は外部アラーム運用です（時計アプリ等）。</p>
            <HomeProcedureBoard />
            <TodayCapdNoteTable note={todayNote} />
          </CardContent>
        </Card>

      <Card>
        <CardContent className="flex flex-wrap gap-2 pt-6">
          <Button asChild variant="secondary">
            <Link href="/capd/history-list">
              <ListCheck />
              記録一覧を開く
            </Link>
          </Button>
          <Button variant="outline">CSV取り込み(Mac)</Button>
        </CardContent>
      </Card>
    </CapdShell>
  );
}
