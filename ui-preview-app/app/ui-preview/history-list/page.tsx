import Link from "next/link";
import { ArrowLeft } from "@mynaui/icons-react";

import { HistoryRecordsTable } from "@/components/preview/history-records-table";
import { PreviewShell } from "@/components/preview/shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HistoryListPage() {
  return (
    <PreviewShell>
      <section className="space-y-2">
        <p className="text-sm text-muted-foreground">History</p>
        <h1 className="text-3xl font-semibold tracking-tight">記録一覧</h1>
      </section>

      <Card>
        <CardHeader className="gap-3 md:flex-row md:items-end md:justify-between md:space-y-0">
          <div>
            <CardTitle className="text-xl">セッション記録</CardTitle>
            <CardDescription>
              CAPD記録ノート準拠の5交換列で、貯留時間/排液量/注液量/排液時間/排液確認を一覧表示します。
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge>期間: 直近30日</Badge>
            <Badge variant="outline">総除水量: 自動計算</Badge>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <HistoryRecordsTable />
        </CardContent>
      </Card>

      <div>
        <Button asChild variant="outline">
          <Link href="/ui-preview/home-a">
            <ArrowLeft className="mr-2 h-4 w-4" />
            ホームへ戻る
          </Link>
        </Button>
      </div>
    </PreviewShell>
  );
}
