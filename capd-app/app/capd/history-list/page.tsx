"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

import { CapdShell } from "@/components/capd/shell";
import { TodayCapdNoteTable } from "@/components/capd/today-capd-note-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { readMonthlyHomeNotes } from "@/lib/services/home-note-query";
import type { HomeNoteEntity } from "@/lib/storage/models";
import { toDateLocalJst } from "@/lib/storage/time";

function formatDateHeader(dateLocal: string): string {
  const date = new Date(`${dateLocal}T00:00:00+09:00`);
  // Format: 2023年10月1日 (日)
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long", // "10月"
    day: "numeric", // "1日"
    weekday: "short" // "(日)"
  }).format(date);
}

export default function HistoryListPage() {
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    // Initialize with current time in JST
    const now = new Date(); // Browser local time, likely JST if user is in Japan
    return now;
  });

  const [notes, setNotes] = useState<Array<{ dateLocal: string; note: HomeNoteEntity | null }>>([]);
  const [loading, setLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const loadNotes = async () => {
    setLoading(true);
    try {
      const data = await readMonthlyHomeNotes(year, month);
      setNotes(data);
    } catch (error) {
      console.error("Failed to load notes", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadNotes();
  }, [year, month]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  return (
    <CapdShell>
      <section className="space-y-4">
        {/* Header with Month Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="outline" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">
            {year}年{month}月
          </h1>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* List of Daily Records */}
        <div className="space-y-8">
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">読み込み中...</div>
          ) : (
            notes.map(({ dateLocal, note }) => (
              <Card key={dateLocal}>
                <CardContent className="pt-6">
                  <TodayCapdNoteTable
                    dateLocal={dateLocal}
                    note={note}
                    onSave={loadNotes}
                    title={formatDateHeader(dateLocal)}
                  />
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Floating Back Button */}
        <div className="fixed bottom-6 left-6 z-50">
          <Button asChild variant="secondary" className="border shadow-lg">
            <Link href="/capd/home">
              <ArrowLeft className="mr-2 h-4 w-4" />
              ホームに戻る
            </Link>
          </Button>
        </div>
      </section>
    </CapdShell>
  );
}
