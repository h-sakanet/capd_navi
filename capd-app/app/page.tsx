import Link from "next/link";

import { CapdShell } from "@/components/capd/shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Page() {
  return (
    <CapdShell>
      <section className="space-y-2">
        <p className="text-sm text-muted-foreground">CAPD Support App</p>
        <h1 className="text-3xl font-semibold tracking-tight">運用画面エントリ</h1>
      </section>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-xl">本番ルート</CardTitle>
          <CardDescription>本番利用する画面群は `/capd/*` 配下で運用します。</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild variant="secondary">
            <Link href="/capd">/capd を開く</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/ui-preview">/ui-preview（参考）</Link>
          </Button>
        </CardContent>
      </Card>
    </CapdShell>
  );
}
