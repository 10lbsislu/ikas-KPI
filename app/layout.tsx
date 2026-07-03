import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "PAKYÜREK KPI Panosu",
  description: "mezzeMarin satış, finans ve reklam KPI takip panosu",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>
        <Nav />
        <main className="mx-auto max-w-7xl px-6 py-6">{children}</main>
        <footer className="mx-auto max-w-7xl px-6 py-8 text-center text-xs text-slate-400">
          PAKYÜREK Şirketler Grubu · mezzeMarin KPI Panosu
        </footer>
      </body>
    </html>
  );
}
