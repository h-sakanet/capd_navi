"use client";

import Link from "next/link";
import { ListCheck } from "@mynaui/icons-react";

import { HomeAProcedureBoard } from "@/components/preview/home-a-procedure-board";
import { dailyCapdNotes } from "@/components/preview/mock-data";
import { TodayCapdNoteTable } from "@/components/preview/today-capd-note-table";
import { PreviewShell } from "@/components/preview/shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomeAPage() {
  const todayNote = dailyCapdNotes[0];

  return (
    <PreviewShell>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{`${todayNote.date} (${todayNote.weekdayJp})`}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-0">
            <p className="text-sm text-muted-foreground">手技開始通知は外部アラーム運用です（時計アプリ等）。</p>
            <HomeAProcedureBoard />
            <TodayCapdNoteTable note={todayNote} />
          </CardContent>
        </Card>

      <Card>
        <CardContent className="flex flex-wrap gap-2 pt-6">
          <Button asChild variant="secondary">
            <Link href="/ui-preview/history-list">
              <ListCheck />
              記録一覧を開く
            </Link>
          </Button>
          <Button variant="outline">CSV取り込み(Mac)</Button>
          <Button variant="outline">手動エクスポート</Button>
        </CardContent>
      </Card>
    </PreviewShell>
  );
}
