import Link from "next/link";
import { ArrowRight } from "@mynaui/icons-react";

import { CapdShell } from "@/components/capd/shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const links = [
  {
    label: "Home",
    href: "/capd/home",
    note: "安全導線優先。開始と注意事項を最短導線に配置。"
  },
  {
    label: "Session",
    href: "/capd/session",
    note: "警告固定型。見落とし防止を最優先にした密度。"
  },
  {
    label: "記録一覧",
    href: "/capd/history-list",
    note: "時間・血圧・体温・重量・写真リンクを一覧化。"
  }
] as const;

export default function CapdIndexPage() {
  return (
    <CapdShell>
      <section className="space-y-2">
        <p className="text-sm text-muted-foreground">CAPD Routes</p>
        <h1 className="text-3xl font-semibold tracking-tight">/capd</h1>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">本番ルート</CardTitle>
          <CardDescription>ホーム/セッション/記録一覧の本番導線です。</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 pt-6 md:grid-cols-2">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-lg border bg-background p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium">{item.label}</p>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{item.note}</p>
              <p className="mt-2 text-xs text-muted-foreground">{item.href}</p>
            </Link>
          ))}
        </CardContent>
      </Card>
    </CapdShell>
  );
}
