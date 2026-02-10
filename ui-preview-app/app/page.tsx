import Link from "next/link";

import { PreviewShell } from "@/components/preview/shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Page() {
  return (
    <PreviewShell>
      <section className="space-y-2">
        <p className="text-sm text-muted-foreground">UI Preview Workspace</p>
        <h1 className="text-3xl font-semibold tracking-tight">CAPD UI Preview</h1>
      </section>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-xl">shadcn/ui Neutral トーン検証</CardTitle>
          <CardDescription>ホーム / セッション実行 / 記録一覧のUIスパイクを確認できます。</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="secondary">
            <Link href="/ui-preview">/ui-preview を開く</Link>
          </Button>
        </CardContent>
      </Card>
    </PreviewShell>
  );
}
