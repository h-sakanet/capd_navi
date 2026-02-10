import Link from "next/link";
import { ReactNode } from "react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const appRoutes = [
  { label: "Home", href: "/capd/home" },
  { label: "Session", href: "/capd/session" },
  { label: "記録一覧", href: "/capd/history-list" }
] as const;

export function CapdShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-14 w-full max-w-7xl min-w-0 items-center gap-1 px-4 md:px-6">
          <Link href="/capd" className="mr-2 text-sm font-semibold tracking-tight text-foreground">
            CAPD Support
          </Link>
          <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
            {appRoutes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(buttonVariants({ size: "sm", variant: "ghost" }), "h-8 px-3 text-xs")}
              >
                {route.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 md:px-6 md:py-8 [&>*]:min-w-0">{children}</main>
    </div>
  );
}
