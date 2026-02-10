import Link from "next/link";
import { ArrowLeft } from "@mynaui/icons-react";

import { CapdShell } from "@/components/capd/shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  params: {
    photoId: string;
  };
};

export default function HistoryPhotoPage({ params }: Props) {
  return (
    <CapdShell>
      <section className="space-y-2">
        <p className="text-sm text-muted-foreground">History Photo</p>
        <h1 className="text-3xl font-semibold tracking-tight">排液写真</h1>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">写真詳細</CardTitle>
          <CardDescription>写真ID: {params.photoId}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="aspect-square max-w-xl rounded-lg border bg-muted p-4 text-sm text-muted-foreground">
            ここに撮影済み写真を表示します（プレビュー用プレースホルダ）。
          </div>
          <Button asChild variant="outline">
            <Link href="/capd/history-list">
              <ArrowLeft className="mr-2 h-4 w-4" />
              記録一覧へ戻る
            </Link>
          </Button>
        </CardContent>
      </Card>
    </CapdShell>
  );
}
