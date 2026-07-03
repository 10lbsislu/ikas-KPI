"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const links = [
  { href: "/", label: "Genel Bakış" },
  { href: "/veri-girisi", label: "Veri Girişi" },
  { href: "/kampanyalar", label: "Kampanyalar" },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-20 border-b border-slate-100 bg-white">
      <div className="flex items-center justify-between gap-4 px-[5%] py-3">
        {/* Sol: PAKYÜREK ana marka logosu */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/pakyurek-logo.png"
            alt="PAKYÜREK"
            width={130}
            height={40}
            priority
            className="h-9 w-auto"
          />
          <span className="hidden h-8 w-px bg-slate-200 sm:block" />
          <Image
            src="/mezzemarin-logo.png"
            alt="mezzeMarin"
            width={160}
            height={40}
            priority
            className="hidden h-8 w-auto sm:block"
          />
          <span className="hidden h-8 w-px bg-slate-200 sm:block" />
          <span className="hidden text-sm font-semibold tracking-wide text-slate-400 sm:block">KPI DASHBOARD</span>
        </Link>

        {/* Sağ: gezinme */}
        <nav className="flex items-center gap-1">
          {links.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition",
                  active
                    ? "bg-brand-50 text-brand-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
