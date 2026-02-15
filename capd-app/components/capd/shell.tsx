import { ReactNode } from "react";

export function CapdShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <div role="main" className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 md:px-6 md:py-8 [&>*]:min-w-0">{children}</div>
    </div>
  );
}
