"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { TrendChart } from "@/components/charts/TrendChart";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { formatTL, formatTLShort, formatPercent, formatNumber, formatRatio } from "@/lib/format";
import {
  deriveNetSales, deriveAOV, deriveGrossRoas, deriveNetRoas,
  deriveRepeatRate, deriveChurn, funnelRates, deriveChannelRoas, pctChange,
  generateInsights, type Insight,
} from "@/lib/kpi";

export type EntryDTO = {
  id: number;
  month: string;
  label: string;
  year: number;
  summary: any;
  product: any;
  customer: any;
  funnel: any;
  channels: any[];
  socials: any[];
};

export type YearlySummary = {
  year: number;
  ikasGross: number; netSales: number; adSpend: number; orderCount: number;
  aov: number | null; grossRoas: number | null; netRoas: number | null;
  newCustomers: number; repeatCustomers: number; totalCustomers: number;
  repeatRate: number | null; churn: number | null; productsSold: number;
  sessions: number; purchase: number; purchaseRate: number | null; monthCount: number;
};

function n(obj: any, key: string): number | null {
  const v = obj?.[key];
  return v === null || v === undefined ? null : Number(v);
}

// Yüzde: 0.27 → "%27,0" — oran olarak saklanıyor, *100 ile göster
function pct(v: number | null | undefined): string {
  if (v == null) return "—";
  return formatPercent(v * 100);
}

type ViewMode = "monthly" | "yearly";

// ─── Küçük yardımcı bileşenler ───────────────────────────────────────────────

const INSIGHT_STYLE: Record<Insight["type"], { bg: string; border: string; icon: string; text: string }> = {
  positive: { bg: "bg-emerald-50", border: "border-emerald-200", icon: "↑", text: "text-emerald-800" },
  negative: { bg: "bg-rose-50",    border: "border-rose-200",    icon: "↓", text: "text-rose-800" },
  warning:  { bg: "bg-amber-50",   border: "border-amber-200",   icon: "⚠", text: "text-amber-800" },
  neutral:  { bg: "bg-slate-50",   border: "border-slate-200",   icon: "•", text: "text-slate-600" },
};

function InsightsPanel({
  insights, note, month,
}: {
  insights: Insight[]; note?: string | null; month: string;
}) {
  const [editNote, setEditNote] = useState(false);
  const [noteVal, setNoteVal] = useState(note ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function saveNote() {
    setSaving(true);
    await fetch(`/api/entries/${month}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ summary: { notes: noteVal || null } }),
    });
    setSaving(false);
    setSaved(true);
    setEditNote(false);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-3">
      {/* Otomatik gözlemler */}
      {insights.length > 0 && (
        <div className="space-y-2">
          {insights.map((ins, i) => {
            const st = INSIGHT_STYLE[ins.type];
            return (
              <div key={i} className={cn("flex items-start gap-2.5 rounded-lg border px-3.5 py-2.5", st.bg, st.border)}>
                <span className={cn("mt-0.5 shrink-0 text-sm font-bold", st.text)}>{st.icon}</span>
                <p className={cn("text-sm leading-relaxed", st.text)}>{ins.text}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Kayıtlı not */}
      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Not / Gözlem</span>
          {!editNote && (
            <button
              onClick={() => { setEditNote(true); setNoteVal(note ?? ""); }}
              className="text-xs text-brand-600 hover:text-brand-800 font-medium"
            >
              {note ? "Düzenle" : "+ Not Ekle"}
            </button>
          )}
          {saved && <span className="text-xs font-medium text-emerald-600">Kaydedildi ✓</span>}
        </div>
        <div className="px-4 py-3">
          {editNote ? (
            <div className="space-y-2">
              <textarea
                value={noteVal}
                onChange={(e) => setNoteVal(e.target.value)}
                placeholder="Bu aya dair gözlemlerinizi yazın… (ör. kampanya etkisi, sezonsal faktör, anormal durum)"
                rows={3}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={saveNote}
                  disabled={saving}
                  className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                >
                  {saving ? "Kaydediliyor…" : "Kaydet"}
                </button>
                <button
                  onClick={() => setEditNote(false)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-50"
                >
                  İptal
                </button>
              </div>
            </div>
          ) : (
            <p className={cn("text-sm", note ? "text-slate-700 whitespace-pre-wrap" : "text-slate-400 italic")}>
              {note || "Bu ay için henüz not girilmemiş."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-2 text-sm font-semibold uppercase tracking-wider text-slate-400">
      {children}
    </h2>
  );
}

function KVRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={cn("flex items-center justify-between py-2 border-b border-slate-50 last:border-0", highlight && "font-semibold")}>
      <span className="text-sm text-slate-500">{label}</span>
      <span className={cn("text-sm tabular-nums", highlight ? "text-brand-700" : "text-slate-800")}>{value}</span>
    </div>
  );
}

function RoasBadge({ roas }: { roas: number | null }) {
  if (roas == null) return <span className="text-slate-400 text-xs">—</span>;
  const color = roas >= 10 ? "bg-emerald-50 text-emerald-700"
    : roas >= 5 ? "bg-amber-50 text-amber-700"
    : roas >= 2 ? "bg-orange-50 text-orange-700"
    : "bg-rose-50 text-rose-700";
  return (
    <span className={cn("inline-block rounded px-1.5 py-0.5 text-xs font-semibold", color)}>
      {formatRatio(roas)}
    </span>
  );
}

function FunnelBar({ label, value, maxVal, rate, rateLabel }: {
  label: string; value: number | null; maxVal: number; rate?: number | null; rateLabel?: string;
}) {
  const pct = maxVal > 0 && value != null ? (value / maxVal) * 100 : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium text-slate-700">{label}</span>
        <div className="flex gap-3">
          <span className="tabular-nums text-slate-600">{formatNumber(value)}</span>
          {rate != null && (
            <span className="tabular-nums text-brand-600 font-semibold">{rateLabel ?? ""} {formatPercent(rate * 100)}</span>
          )}
        </div>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-100">
        <div
          className="h-2 rounded-full bg-brand-500 transition-all"
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
    </div>
  );
}

// ─── Ana bileşen ──────────────────────────────────────────────────────────────

export function DashboardClient({
  entries,
  yearlySummaries,
}: {
  entries: EntryDTO[];
  yearlySummaries: YearlySummary[];
}) {
  const [view, setView] = useState<ViewMode>("monthly");
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    const years = [...new Set(entries.map((e) => e.year))].sort();
    return years[years.length - 1] ?? new Date().getFullYear();
  });
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const sorted = [...entries].sort((a, b) => b.month.localeCompare(a.month));
    return sorted[0]?.month ?? "";
  });

  const years = useMemo(() => [...new Set(entries.map((e) => e.year))].sort(), [entries]);
  const monthlyEntries = useMemo(() => entries.filter((e) => e.year === selectedYear), [entries, selectedYear]);
  const activeEntry = useMemo(() => entries.find((e) => e.month === selectedMonth) ?? monthlyEntries[monthlyEntries.length - 1] ?? null, [entries, selectedMonth, monthlyEntries]);
  const prevEntry = useMemo(() => {
    if (!activeEntry) return null;
    const idx = monthlyEntries.findIndex((e) => e.month === activeEntry.month);
    return idx > 0 ? monthlyEntries[idx - 1] : null;
  }, [activeEntry, monthlyEntries]);

  const yearlyCurrent = yearlySummaries.find((y) => y.year === selectedYear) ?? null;
  const yearlyPrevious = yearlySummaries.find((y) => y.year === selectedYear - 1) ?? null;

  if (entries.length === 0) {
    return (
      <Card>
        <CardBody className="py-16 text-center">
          <div className="text-4xl">📭</div>
          <p className="mt-3 text-sm font-medium text-slate-700">Henüz veri yok.</p>
          <p className="mt-1 text-sm text-slate-500">
            Veri girişi yapın veya <code>npm run import</code> ile Excel'i içe aktarın.
          </p>
          <Link href="/veri-girisi" className="mt-4 inline-block"><Button>Veri Girişine Git</Button></Link>
        </CardBody>
      </Card>
    );
  }

  // ── Türetilen değerler (aktif ay) ─────────────────────────────────────────
  const s = activeEntry?.summary ?? {};
  const ps = prevEntry?.summary ?? {};
  const cust = activeEntry?.customer ?? {};
  const pcust = prevEntry?.customer ?? {};
  const prod = activeEntry?.product ?? {};
  const funnelData = activeEntry?.funnel ?? {};
  const channels: any[] = activeEntry?.channels ?? [];
  const socials: any[] = activeEntry?.socials ?? [];

  // ── Otomatik gözlemler ───────────────────────────────────────────────────
  const insights = useMemo(() => activeEntry
    ? generateInsights(activeEntry, prevEntry)
    : [], [activeEntry, prevEntry]);

  const netSales = deriveNetSales(s);
  const prevNetSales = deriveNetSales(ps);
  const netRoas = deriveNetRoas({ ...s, netSales });
  const grossRoas = deriveGrossRoas(s);
  const aov = deriveAOV({ ...s, netSales });
  const repeatRate = deriveRepeatRate(cust);
  const churnRate = deriveChurn(cust);
  const fr = funnelRates(funnelData);

  // ── Trend verisi ──────────────────────────────────────────────────────────
  const trendData = monthlyEntries.map((e) => {
    const es = e.summary ?? {};
    const eNet = deriveNetSales(es);
    const eFr = funnelRates(e.funnel ?? {});
    return {
      label: e.label,
      ikasCiro: n(es, "ikasGross"),
      netSatis: eNet,
      netRoas: deriveNetRoas({ ...es, netSales: eNet }),
      grossRoas: deriveGrossRoas(es),
      adSpend: n(es, "adSpend"),
      siparis: n(es, "orderCount"),
      churn: (() => { const c = deriveChurn(e.customer ?? {}); return c != null ? c * 100 : null; })(),
      tekrarOran: (() => { const r = deriveRepeatRate(e.customer ?? {}); return r != null ? r * 100 : null; })(),
      yeniMusteri: n(e.customer, "newCustomers"),
      sessions: n(e.funnel, "sessions"),
      purchaseRate: eFr.purchaseRate != null ? eFr.purchaseRate * 100 : null,
    };
  });

  // ── Ay seçici bölümü ──────────────────────────────────────────────────────
  const monthOptions = monthlyEntries.slice().reverse(); // en yeni önce

  return (
    <div className="space-y-5">

      {/* ── KONTROL ÇUBUĞU ──────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {/* Görünüm */}
          <div className="flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-0.5">
            {(["monthly", "yearly"] as ViewMode[]).map((v) => (
              <button key={v} onClick={() => setView(v)}
                className={cn("rounded-md px-3 py-1.5 text-sm font-medium transition",
                  view === v ? "bg-brand-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-700")}>
                {v === "monthly" ? "Aylık Detay" : "Yıllık Özet"}
              </button>
            ))}
          </div>

          {/* Yıl */}
          {years.length > 1 && (
            <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-200">
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          )}

          {/* Ay (sadece aylık görünümde) */}
          {view === "monthly" && (
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-200">
              {monthOptions.map((e) => <option key={e.month} value={e.month}>{e.label}</option>)}
            </select>
          )}
        </div>

        <div className="flex gap-2">
          <Link href="/veri-girisi"><Button className="text-sm">+ Veri Gir</Button></Link>
          <Link href="/kampanyalar"><Button variant="secondary" className="text-sm">Kampanyalar</Button></Link>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          AYLIK DETAY GÖRÜNÜMÜ
      ════════════════════════════════════════════════════════════════════ */}
      {view === "monthly" && activeEntry && (
        <>
          {/* Dönem başlığı */}
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-brand-600 px-3 py-1 text-sm font-semibold text-white">{activeEntry.label}</span>
            {prevEntry && <span className="text-sm text-slate-400">Önceki ay: {prevEntry.label}</span>}
          </div>

          {/* ── BÖLÜM 1: Aylık Özet ──────────────────────────────────── */}
          <SectionTitle>Aylık Özet</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="İKAS Brüt Satış (Gerçek Ciro)" value={formatTL(n(s, "ikasGross"))}
              change={pctChange(n(s, "ikasGross"), n(ps, "ikasGross"))} />
            <StatCard label="İadeler Sonrası Toplam Satış" value={formatTL(netSales)}
              change={pctChange(netSales, prevNetSales)}
              hint={(n(s,"cancelled")||n(s,"returned")) ? `İptal ${formatTLShort(n(s,"cancelled"))} · İade ${formatTLShort(n(s,"returned"))}` : undefined} />
            <StatCard label="Toplam Sipariş Sayısı" value={formatNumber(n(s, "orderCount"))}
              change={pctChange(n(s,"orderCount"), n(ps,"orderCount"))} />
            <StatCard label="Ortalama Sepet (AOV)" value={formatTL(aov)}
              change={pctChange(aov, deriveAOV({ ...ps, netSales: prevNetSales }))} />
            <StatCard label="Toplam Reklam Harcaması" value={formatTL(n(s, "adSpend"))}
              change={pctChange(n(s,"adSpend"), n(ps,"adSpend"))} lowerIsBetter />
            <StatCard label="Net ROAS" value={formatRatio(netRoas)}
              change={pctChange(netRoas, deriveNetRoas({ ...ps, netSales: prevNetSales }))} hint="Net Satış / Reklam" />
          </div>

          {/* ── Otomatik Gözlemler + Not ──────────────────────────────── */}
          <SectionTitle>Gözlemler & Notlar</SectionTitle>
          <InsightsPanel
            insights={insights}
            note={s.notes}
            month={activeEntry.month}
          />

          {/* ── BÖLÜM 2: Kanal Performansı ───────────────────────────── */}
          {channels.length > 0 && (
            <>
              <SectionTitle>Kanal Performansı</SectionTitle>
              <Card>
                <CardBody className="overflow-x-auto p-0">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Kanal</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">Harcama (TL)</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">Brüt Satış (TL)</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">Sipariş</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500">Brüt ROAS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {channels.map((ch: any, i: number) => {
                        const roas = deriveChannelRoas(ch);
                        return (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="px-4 py-3">
                              <span className="font-medium text-slate-800">{ch.channel}</span>
                            </td>
                            <td className="px-4 py-3 text-right tabular-nums text-slate-600">
                              {ch.spend === 0 ? <span className="text-slate-400 text-xs">Organik</span> : formatTL(ch.spend)}
                            </td>
                            <td className="px-4 py-3 text-right tabular-nums text-slate-700 font-medium">{formatTL(ch.grossSales)}</td>
                            <td className="px-4 py-3 text-right tabular-nums text-slate-600">{formatNumber(ch.orderCount)}</td>
                            <td className="px-4 py-3 text-right"><RoasBadge roas={roas} /></td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-slate-200 bg-slate-50 font-semibold">
                        <td className="px-4 py-2.5 text-sm text-slate-700">Toplam (ücretli)</td>
                        <td className="px-4 py-2.5 text-right tabular-nums text-sm text-slate-700">
                          {formatTL(channels.filter((c:any)=>c.spend>0).reduce((a:number,c:any)=>(a+(c.spend??0)),0))}
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums text-sm text-slate-700">
                          {formatTL(channels.reduce((a:number,c:any)=>(a+(c.grossSales??0)),0))}
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums text-sm text-slate-700">
                          {formatNumber(channels.reduce((a:number,c:any)=>(a+(c.orderCount??0)),0))}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <RoasBadge roas={deriveChannelRoas({
                            grossSales: channels.reduce((a:number,c:any)=>(a+(c.grossSales??0)),0),
                            spend: channels.filter((c:any)=>c.spend>0).reduce((a:number,c:any)=>(a+(c.spend??0)),0),
                          })} />
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </CardBody>
              </Card>
            </>
          )}

          {/* ── BÖLÜM 3: Ürün Performansı + Müşteri KPI ─────────────── */}
          <SectionTitle>Ürün Performansı & Müşteri KPI</SectionTitle>
          <div className="grid gap-4 lg:grid-cols-2">

            {/* Ürün */}
            <Card>
              <CardHeader title="Ürün Performansı" />
              <CardBody>
                <KVRow label="Sipariş Sayısı" value={formatNumber(n(prod,"orderCount"))} />
                <KVRow label="Satılan Ürün Adedi" value={formatNumber(n(prod,"productsSold"))} />
                <KVRow label="Fatura Başına Ürün" value={formatNumber(n(prod,"productsPerOrder"))} />
                {prod.topProduct && (
                  <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2.5">
                    <div className="text-xs text-slate-400">En Çok Satan Ürün</div>
                    <div className="mt-0.5 font-semibold text-slate-800">{prod.topProduct}</div>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Müşteri KPI */}
            <Card>
              <CardHeader title="Müşteri KPI" />
              <CardBody>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { label: "Toplam", value: n(cust,"totalCustomers"), color: "bg-slate-50 text-slate-700" },
                    { label: "Yeni", value: n(cust,"newCustomers"), color: "bg-emerald-50 text-emerald-700" },
                    { label: "Tekrar", value: n(cust,"repeatCustomers"), color: "bg-brand-50 text-brand-700" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className={cn("rounded-lg p-3 text-center", color)}>
                      <div className="text-xs font-medium opacity-70">{label}</div>
                      <div className="mt-0.5 text-xl font-bold tabular-nums">{formatNumber(value)}</div>
                    </div>
                  ))}
                </div>
                <KVRow label="Tekrar Oranı" value={pct(repeatRate)}
                  highlight={repeatRate != null && repeatRate > 0.4} />
                <div className="mt-3 rounded-lg border border-brand-100 bg-brand-50 px-3 py-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-medium text-brand-500">Churn (Kayıp) Oranı</div>
                      <div className="text-xs text-brand-400">otomatik = 1 − tekrar oranı</div>
                    </div>
                    <div className="text-2xl font-bold text-brand-700">{pct(churnRate)}</div>
                  </div>
                  {prevEntry && (
                    <div className="mt-1 text-xs text-brand-400">
                      Önceki ay: {pct(deriveChurn(pcust))}
                      {churnRate != null && deriveChurn(pcust) != null && (
                        <span className={cn("ml-2 font-semibold",
                          churnRate < deriveChurn(pcust)! ? "text-emerald-600" : "text-rose-500")}>
                          {churnRate < deriveChurn(pcust)! ? "▼ İyileşti" : "▲ Kötüleşti"}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* ── BÖLÜM 4: Funnel (GA4) ────────────────────────────────── */}
          {activeEntry.funnel && (
            <>
              <SectionTitle>Funnel — GA4 Dönüşüm Hunisi</SectionTitle>
              <Card>
                <CardBody>
                  <div className="grid gap-4 lg:grid-cols-2">
                    {/* Görsel huni */}
                    <div className="space-y-3">
                      {[
                        { label: "Oturum (Session)", key: "sessions", rate: null, rLabel: "" },
                        { label: "Ürün Görüntüleme", key: "productViews", rate: n(funnelData,"productViews") != null && n(funnelData,"sessions") ? n(funnelData,"productViews")!/n(funnelData,"sessions")! : null, rLabel: "Oran:" },
                        { label: "Sepete Ekleme", key: "addToCart", rate: fr.addToCartRate, rLabel: "Oran:" },
                        { label: "Checkout", key: "checkout", rate: fr.checkoutRate, rLabel: "Geçiş:" },
                        { label: "Satın Alma (Purchase)", key: "purchase", rate: fr.purchaseRate, rLabel: "Dönüşüm:" },
                      ].map(({ label, key, rate, rLabel }) => (
                        <FunnelBar
                          key={key}
                          label={label}
                          value={n(funnelData, key)}
                          maxVal={n(funnelData, "sessions") ?? 1}
                          rate={rate}
                          rateLabel={rLabel}
                        />
                      ))}
                    </div>
                    {/* Terk ve özet */}
                    <div className="space-y-3">
                      <div className="rounded-lg bg-slate-50 p-4 space-y-2">
                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Terk Analizi</div>
                        <KVRow label="Sepet Terk (adet)" value={formatNumber(n(funnelData,"cartAbandon"))} />
                        <KVRow label="Checkout Terk (adet)" value={formatNumber(n(funnelData,"checkoutAbandon"))} />
                      </div>
                      <div className="rounded-lg bg-brand-50 p-4 space-y-2">
                        <div className="text-xs font-semibold text-brand-500 uppercase tracking-wider mb-3">Özet Oranlar</div>
                        <KVRow label="Sepete Ekleme Oranı" value={pct(fr.addToCartRate)} />
                        <KVRow label="Checkout → Satış Oranı" value={pct(fr.checkoutRate)} />
                        <KVRow label="Genel Dönüşüm (Satış/Oturum)" value={pct(fr.purchaseRate)} highlight />
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </>
          )}

          {/* ── BÖLÜM 5: Sosyal Medya ────────────────────────────────── */}
          {socials.length > 0 && (
            <>
              <SectionTitle>Sosyal Medya Takibi</SectionTitle>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {socials.map((s: any, i: number) => (
                  <Card key={i}>
                    <CardBody>
                      <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">{s.platform}</div>
                      <div className="mt-2 text-2xl font-bold tabular-nums text-slate-800">{formatNumber(s.followers)}</div>
                      <div className="mt-0.5 text-xs text-slate-500">toplam takipçi</div>
                      {s.gained != null && (
                        <div className="mt-2 flex items-center gap-1">
                          <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-xs font-semibold text-emerald-700">
                            +{formatNumber(s.gained)}
                          </span>
                          <span className="text-xs text-slate-400">yeni takipçi</span>
                        </div>
                      )}
                      {s.views != null && (
                        <div className="mt-1 text-xs text-slate-500">
                          <span className="font-medium text-slate-700">{formatNumber(s.views)}</span> görüntülenme
                        </div>
                      )}
                      {s.engagement && (
                        <div className="mt-1 text-xs text-slate-500">
                          Etkileşim: <span className="font-medium text-slate-700">{s.engagement}</span>
                        </div>
                      )}
                    </CardBody>
                  </Card>
                ))}
              </div>
            </>
          )}

        </>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          YILLIK ÖZET GÖRÜNÜMÜ
      ════════════════════════════════════════════════════════════════════ */}
      {view === "yearly" && (
        <>
          {/* Yıllık KPI kartları */}
          <SectionTitle>Yıllık KPI Özeti — {selectedYear}</SectionTitle>
          {yearlyCurrent ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Yıllık İKAS Ciro" value={formatTL(yearlyCurrent.ikasGross)}
                  change={pctChange(yearlyCurrent.ikasGross, yearlyPrevious?.ikasGross)}
                  hint={`${yearlyCurrent.monthCount} ay verisi`} />
                <StatCard label="Yıllık Net Satış" value={formatTL(yearlyCurrent.netSales)}
                  change={pctChange(yearlyCurrent.netSales, yearlyPrevious?.netSales)} />
                <StatCard label="Yıllık Net ROAS" value={formatRatio(yearlyCurrent.netRoas)}
                  change={pctChange(yearlyCurrent.netRoas ?? null, yearlyPrevious?.netRoas ?? null)}
                  hint={`Brüt ROAS ${formatRatio(yearlyCurrent.grossRoas)}`} />
                <StatCard label="Yıllık Ort. Sepet (AOV)" value={formatTL(yearlyCurrent.aov)}
                  change={pctChange(yearlyCurrent.aov ?? null, yearlyPrevious?.aov ?? null)}
                  hint={`${formatNumber(yearlyCurrent.orderCount)} toplam sipariş`} />
                <StatCard label="Yıllık Reklam Harcaması" value={formatTL(yearlyCurrent.adSpend)}
                  change={pctChange(yearlyCurrent.adSpend, yearlyPrevious?.adSpend)} lowerIsBetter />
                <StatCard label="Yıllık Tekrar Oranı" value={pct(yearlyCurrent.repeatRate)}
                  hint={yearlyCurrent.churn != null ? `Churn: ${pct(yearlyCurrent.churn)}` : undefined} />
                <StatCard label="Yıllık Toplam Müşteri" value={formatNumber(yearlyCurrent.totalCustomers)}
                  hint={`Yeni: ${formatNumber(yearlyCurrent.newCustomers)} · Tekrar: ${formatNumber(yearlyCurrent.repeatCustomers)}`} />
                <StatCard label="Genel Dönüşüm" value={pct(yearlyCurrent.purchaseRate)}
                  hint={`${formatNumber(yearlyCurrent.purchase)} satış / ${formatNumber(yearlyCurrent.sessions)} oturum`} />
              </div>

              {/* Aylık karşılaştırma tablosu */}
              <SectionTitle>Ay Bazında Karşılaştırma</SectionTitle>
              <Card>
                <CardBody className="overflow-x-auto p-0">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50">
                        {["Ay","İKAS Ciro","Net Satış","Net ROAS","Sipariş","AOV","Reklam","Churn"].map((h,i) => (
                          <th key={h} className={cn("px-4 py-3 text-xs font-semibold text-slate-500", i===0 ? "text-left":"text-right")}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {monthlyEntries.map((e) => {
                        const es = e.summary ?? {};
                        const eNet = deriveNetSales(es);
                        const eChurn = deriveChurn(e.customer ?? {});
                        return (
                          <tr key={e.month} className={cn("hover:bg-slate-50", e.month === selectedMonth && "bg-brand-50")}>
                            <td className="px-4 py-3 font-medium text-slate-800">
                              <button onClick={() => { setView("monthly"); setSelectedMonth(e.month); }}
                                className="text-brand-600 hover:underline">{e.label}</button>
                            </td>
                            <td className="px-4 py-3 text-right tabular-nums">{formatTLShort(n(es,"ikasGross"))}</td>
                            <td className="px-4 py-3 text-right tabular-nums">{formatTLShort(eNet)}</td>
                            <td className="px-4 py-3 text-right"><RoasBadge roas={deriveNetRoas({...es,netSales:eNet})} /></td>
                            <td className="px-4 py-3 text-right tabular-nums">{formatNumber(n(es,"orderCount"))}</td>
                            <td className="px-4 py-3 text-right tabular-nums">{formatTLShort(deriveAOV({...es,netSales:eNet}))}</td>
                            <td className="px-4 py-3 text-right tabular-nums">{formatTLShort(n(es,"adSpend"))}</td>
                            <td className="px-4 py-3 text-right tabular-nums">{eChurn!=null ? pct(eChurn) : "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-brand-200 bg-brand-50 font-semibold">
                        <td className="px-4 py-3 text-brand-800">YILLIK TOPLAM / ORT.</td>
                        <td className="px-4 py-3 text-right tabular-nums text-brand-800">{formatTLShort(yearlyCurrent.ikasGross)}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-brand-800">{formatTLShort(yearlyCurrent.netSales)}</td>
                        <td className="px-4 py-3 text-right"><RoasBadge roas={yearlyCurrent.netRoas} /></td>
                        <td className="px-4 py-3 text-right tabular-nums text-brand-800">{formatNumber(yearlyCurrent.orderCount)}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-brand-800">{formatTLShort(yearlyCurrent.aov)}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-brand-800">{formatTLShort(yearlyCurrent.adSpend)}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-brand-800">{pct(yearlyCurrent.churn)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </CardBody>
              </Card>
              {/* Trend Grafikleri — yıllık görünümde de */}
              {monthlyEntries.length > 1 && (
                <>
                  <SectionTitle>Trend Grafikleri — {selectedYear}</SectionTitle>
                  <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                      <CardHeader title="İKAS Ciro Trendi" subtitle="Gerçek ciro (aylık)" />
                      <CardBody>
                        <TrendChart data={trendData} dataKey="ikasCiro" format={(v) => formatTLShort(v)} />
                      </CardBody>
                    </Card>
                    <Card>
                      <CardHeader title="Net Satış Trendi" />
                      <CardBody>
                        <TrendChart data={trendData} dataKey="netSatis" color="#2a5aa8" format={(v) => formatTLShort(v)} />
                      </CardBody>
                    </Card>
                    <Card>
                      <CardHeader title="Net ROAS Trendi" subtitle="Net Satış / Reklam Harcaması" />
                      <CardBody>
                        <TrendChart data={trendData} dataKey="netRoas" color="#d97706" format={(v) => `${formatNumber(v)}x`} />
                      </CardBody>
                    </Card>
                    <Card>
                      <CardHeader title="Reklam Harcaması Trendi" />
                      <CardBody>
                        <TrendChart data={trendData} dataKey="adSpend" color="#dc2626" format={(v) => formatTLShort(v)} />
                      </CardBody>
                    </Card>
                    <Card>
                      <CardHeader title="Churn & Tekrar Müşteri Oranı (%)" subtitle="Otomatik hesaplanır" />
                      <CardBody>
                        <TrendChart data={trendData} dataKey="churn" color="#dc2626" format={(v) => `%${formatNumber(v)}`} />
                      </CardBody>
                    </Card>
                    <Card>
                      <CardHeader title="Genel Dönüşüm Oranı (%)" subtitle="Satın alma / Oturum" />
                      <CardBody>
                        <TrendChart data={trendData} dataKey="purchaseRate" color="#059669" format={(v) => `%${formatNumber(v)}`} />
                      </CardBody>
                    </Card>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
              {selectedYear} yılı için veri bulunamadı.
            </div>
          )}
        </>
      )}
    </div>
  );
}
