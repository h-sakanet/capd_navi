import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CAPD Support App",
  description: "CAPD支援アプリの本番UI"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
