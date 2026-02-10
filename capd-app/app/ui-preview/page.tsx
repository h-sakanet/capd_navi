import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function UiPreviewArchivePage() {
  return (
    <main className="mx-auto grid min-h-screen w-full max-w-4xl gap-6 px-4 py-8 md:px-6">
      <section className="space-y-2">
        <p className="text-sm text-muted-foreground">Reference Only</p>
        <h1 className="text-3xl font-semibold tracking-tight">UI Preview Archive</h1>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">本番コードの配置変更</CardTitle>
          <CardDescription>
            本番で利用する画面は `/capd/*` 配下へ移設済みです。`/ui-preview/*` は参照専用で、実装対象に含めません。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary">
              <Link href="/capd">/capd を開く</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">トップへ戻る</Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            参考資料: `docs/design/ui-preview/`（静的モック）
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
