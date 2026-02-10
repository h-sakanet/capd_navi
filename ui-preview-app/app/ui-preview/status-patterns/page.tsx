import { ArrowLeftCircle, ArrowRight, ArrowRightCircle, Droplet, Link as LinkIcon, Unlink } from "@mynaui/icons-react";
import { type ComponentType } from "react";

import { PreviewShell } from "@/components/preview/shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatusItem = {
  key: "standalone" | "connected" | "drain" | "fill";
  label: string;
  note: string;
  icon: ComponentType<{ className?: string }>;
  colorClass: string;
  softClass: string;
};

const statusItems: StatusItem[] = [
  {
    key: "standalone",
    label: "お腹-独立",
    note: "接続されていない待機状態",
    icon: Unlink,
    colorClass: "text-slate-700",
    softClass: "border-slate-200 bg-slate-50 text-slate-700"
  },
  {
    key: "connected",
    label: "お腹-接続",
    note: "回路接続済みの中間状態",
    icon: LinkIcon,
    colorClass: "text-emerald-700",
    softClass: "border-emerald-200 bg-emerald-50 text-emerald-800"
  },
  {
    key: "drain",
    label: "お腹→廃液バッグ",
    note: "排液方向（体内から外へ）",
    icon: ArrowRightCircle,
    colorClass: "text-amber-700",
    softClass: "border-amber-200 bg-amber-50 text-amber-800"
  },
  {
    key: "fill",
    label: "お腹←透析液バッグ",
    note: "注液方向（バッグから体内へ）",
    icon: ArrowLeftCircle,
    colorClass: "text-sky-700",
    softClass: "border-sky-200 bg-sky-50 text-sky-700"
  }
];

export default function StatusPatternsPage() {
  return (
    <PreviewShell>
      <section className="space-y-2">
        <p className="text-sm text-muted-foreground">State Design Lab</p>
        <h1 className="text-3xl font-semibold tracking-tight">状態アイコン比較</h1>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">固定マッピング案（全パターン共通）</CardTitle>
          <CardDescription>MynaUIアイコンを状態意味に直結させ、色だけでも識別できるようにしています。</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {statusItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.key} className={cn("rounded-lg border p-3", item.softClass)}>
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <p className="font-medium">{item.label}</p>
                </div>
                <p className="mt-1 text-sm opacity-90">{item.note}</p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Pattern A: Compact Badge</CardTitle>
          <CardDescription>表やヘッダーで使いやすい最小表示。</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {statusItems.map((item) => {
            const Icon = item.icon;
            return (
              <Badge key={item.key} variant="outline" className={cn("h-8 gap-1.5 border", item.softClass)}>
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </Badge>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Pattern B: Pill Selector</CardTitle>
          <CardDescription>カード上部の現在状態表示向け。タップ対象を大きく確保。</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {statusItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.key} className={cn("flex items-center gap-3 rounded-xl border px-4 py-3", item.softClass)}>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-background/70">
                  <Icon className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-xs opacity-80">{item.note}</p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Pattern C: Status Tile</CardTitle>
          <CardDescription>一覧や設定画面での比較確認向け。</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {statusItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.key} className="rounded-xl border bg-background p-4 shadow-sm">
                <div className={cn("inline-flex rounded-lg border px-2 py-1", item.softClass)}>
                  <Icon className={cn("h-4 w-4", item.colorClass)} />
                </div>
                <p className="mt-3 font-medium">{item.label}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.note}</p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Pattern D: Flow Strip</CardTitle>
          <CardDescription>進行中の流れを横方向に見せる表示。</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <div className="flex min-w-[680px] items-stretch gap-2">
            {statusItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={item.key} className="flex items-center gap-2">
                  <div className={cn("w-40 rounded-lg border p-3", item.softClass)}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <p className="text-sm font-medium">{item.label}</p>
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-xs opacity-90">
                      <Droplet className="h-3.5 w-3.5" />
                      {item.note}
                    </div>
                  </div>
                  {index < statusItems.length - 1 ? <ArrowRight className="h-4 w-4 text-muted-foreground" /> : null}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </PreviewShell>
  );
}
