import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CAPD UI Preview",
  description: "shadcn/ui based CAPD UI preview"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
