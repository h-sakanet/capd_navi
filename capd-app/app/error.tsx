"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center gap-4 px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">画面の表示中に問題が発生しました</h1>
      <p className="text-sm text-muted-foreground">一時的な問題の可能性があります。再読み込みをお試しください。</p>
      <div>
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex h-9 items-center rounded-md border px-4 text-sm"
        >
          再試行
        </button>
      </div>
    </main>
  );
}
