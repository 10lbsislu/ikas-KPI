import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";

type Props = {
  label: string;
  value: string;
  /** Önceki döneme göre % değişim (null ise gösterilmez) */
  change?: number | null;
  hint?: string;
  /** true ise düşüş iyi (ör. CPA, iade oranı) — renk mantığı tersine döner */
  lowerIsBetter?: boolean;
};

export function StatCard({ label, value, change, hint, lowerIsBetter = false }: Props) {
  const hasChange = change !== null && change !== undefined && Number.isFinite(change);
  const up = hasChange && (change as number) > 0;
  const flat = hasChange && Math.abs(change as number) < 0.05;
  // Yükseliş normalde iyi (yeşil); lowerIsBetter ise tersine
  const positive = flat ? null : up !== lowerIsBetter;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-900 tabular">
        {value}
      </div>
      <div className="mt-1.5 flex items-center gap-2">
        {hasChange ? (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-semibold",
              positive === null && "bg-slate-100 text-slate-500",
              positive === true && "bg-emerald-50 text-emerald-700",
              positive === false && "bg-rose-50 text-rose-700",
            )}
          >
            {flat ? "→" : up ? "▲" : "▼"} %{formatNumber(Math.abs(change as number))}
          </span>
        ) : (
          <span className="text-xs text-slate-400">önceki dönem yok</span>
        )}
        {hint && <span className="text-xs text-slate-400">{hint}</span>}
      </div>
    </div>
  );
}
