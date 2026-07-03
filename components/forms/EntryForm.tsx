"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ENTRY_TABS, CHANNEL_OPTIONS, SOCIAL_PLATFORMS } from "@/lib/fields";
import { Card, CardBody } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { TR_MONTHS } from "@/lib/kpi";

type EntryLight = { month: string; label: string; year: number };

function currentMonthISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

type SimpleValues = Record<string, string>;
type ChannelRow = { channel: string; spend: string; grossSales: string; orderCount: string; roas: string };
type SocialRow = { platform: string; followers: string; gained: string; views: string; engagement: string };

function emptySimple(): SimpleValues {
  const v: SimpleValues = {};
  for (const tab of ENTRY_TABS) for (const f of tab.fields) v[f.name] = "";
  return v;
}

export function EntryForm() {
  const router = useRouter();
  const [entries, setEntries] = useState<EntryLight[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("new");
  const [activeTab, setActiveTab] = useState(0);

  const [monthInput, setMonthInput] = useState(currentMonthISO());
  const [values, setValues] = useState<SimpleValues>(emptySimple());
  const [channels, setChannels] = useState<ChannelRow[]>([]);
  const [socials, setSocials] = useState<SocialRow[]>([]);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function loadEntries() {
    const res = await fetch("/api/entries");
    const data = await res.json();
    setEntries(data.map((e: any) => ({ month: e.month, label: e.label, year: e.year })));
  }

  useEffect(() => { loadEntries(); }, []);

  useEffect(() => {
    setMessage(null);
    if (selectedMonth === "new") {
      setValues(emptySimple());
      setChannels([]);
      setSocials([]);
      return;
    }
    fetch(`/api/entries/${selectedMonth}`)
      .then((r) => r.json())
      .then((entry: any) => {
        const v = emptySimple();
        for (const tab of ENTRY_TABS) {
          const src = entry[tab.key];
          if (!src) continue;
          for (const f of tab.fields) {
            const val = src[f.name];
            v[f.name] = val === null || val === undefined ? "" : String(val);
          }
        }
        setValues(v);
        setChannels(
          (entry.channels ?? []).map((c: any) => ({
            channel: c.channel ?? "",
            spend: c.spend != null ? String(c.spend) : "",
            grossSales: c.grossSales != null ? String(c.grossSales) : "",
            orderCount: c.orderCount != null ? String(c.orderCount) : "",
            roas: c.roas != null ? String(c.roas) : "",
          }))
        );
        setSocials(
          (entry.socials ?? []).map((s: any) => ({
            platform: s.platform ?? "",
            followers: s.followers != null ? String(s.followers) : "",
            gained: s.gained != null ? String(s.gained) : "",
            views: s.views != null ? String(s.views) : "",
            engagement: s.engagement ?? "",
          }))
        );
      });
  }, [selectedMonth]);

  function setField(name: string, val: string) {
    setValues((v) => ({ ...v, [name]: val }));
  }

  function buildTabPayload(tabKey: string): Record<string, string | null> {
    const tab = ENTRY_TABS.find((t) => t.key === tabKey);
    if (!tab) return {};
    const obj: Record<string, string | null> = {};
    for (const f of tab.fields) obj[f.name] = values[f.name] === "" ? null : values[f.name];
    return obj;
  }

  function channelToRaw(c: ChannelRow) {
    return {
      channel: c.channel,
      spend: c.spend === "" ? null : c.spend,
      grossSales: c.grossSales === "" ? null : c.grossSales,
      orderCount: c.orderCount === "" ? null : c.orderCount,
      roas: c.roas === "" ? null : c.roas,
    };
  }

  function socialToRaw(s: SocialRow) {
    return {
      platform: s.platform,
      followers: s.followers === "" ? null : s.followers,
      gained: s.gained === "" ? null : s.gained,
      views: s.views === "" ? null : s.views,
      engagement: s.engagement === "" ? null : s.engagement,
    };
  }

  const effectiveMonth = selectedMonth === "new" ? monthInput : selectedMonth;
  const [yyyy, mm] = effectiveMonth.split("-").map(Number);
  const label = `${TR_MONTHS[mm - 1]} ${yyyy}`;

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    const payload = {
      month: effectiveMonth,
      label,
      year: yyyy,
      summary: buildTabPayload("summary"),
      product: buildTabPayload("product"),
      customer: buildTabPayload("customer"),
      funnel: buildTabPayload("funnel"),
      channels: channels.filter((c) => c.channel.trim()).map(channelToRaw),
      socials: socials.filter((s) => s.platform.trim()).map(socialToRaw),
    };

    try {
      const res = await fetch(`/api/entries/${effectiveMonth}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        const firstErr = err.error?.fieldErrors
          ? Object.values(err.error.fieldErrors).flat()[0]
          : err.error;
        throw new Error(typeof firstErr === "string" ? firstErr : JSON.stringify(firstErr));
      }
      await loadEntries();
      setSelectedMonth(effectiveMonth);
      setMessage({ ok: true, text: "Kaydedildi ✓" });
      router.refresh();
    } catch (e: any) {
      setMessage({ ok: false, text: e.message ?? "Kayıt başarısız" });
    } finally {
      setSaving(false);
    }
  }

  // Sekme listesi: ENTRY_TABS + Kanallar + Sosyal
  const allTabs = [
    ...ENTRY_TABS,
    { key: "channels", title: "Kanallar", icon: "📡" },
    { key: "socials", title: "Sosyal Medya", icon: "📱" },
  ] as const;

  return (
    <div className="space-y-5">
      {/* Ay seçici */}
      <Card>
        <CardBody className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Kayıt Seç veya Yeni Oluştur</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            >
              <option value="new">+ Yeni ay</option>
              {entries.map((e) => (
                <option key={e.month} value={e.month}>{e.label} ({e.month})</option>
              ))}
            </select>
          </div>

          {selectedMonth === "new" && (
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Ay Seç</label>
              <input
                type="month"
                value={monthInput}
                onChange={(e) => setMonthInput(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </div>
          )}

          <div className="flex items-end">
            <div className="rounded-lg bg-brand-50 px-4 py-2.5">
              <div className="text-xs text-brand-600">Dönem</div>
              <div className="text-base font-semibold text-brand-800">{label}</div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Sekmeler */}
      <div className="flex flex-wrap gap-1 rounded-lg border border-slate-200 bg-white p-1">
        {allTabs.map((tab, i) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(i)}
            className={cn(
              "flex-1 rounded-md px-2 py-2 text-xs font-medium transition sm:text-sm",
              activeTab === i ? "bg-brand-600 text-white" : "text-slate-600 hover:bg-slate-50",
            )}
          >
            <span className="mr-1">{tab.icon}</span>
            {tab.title}
          </button>
        ))}
      </div>

      {/* Statik sekme içerikleri (özet/ürün/müşteri/funnel) */}
      {activeTab < ENTRY_TABS.length && (
        <Card>
          <CardBody>
            {activeTab === 2 && (
              <p className="mb-4 text-xs text-slate-500 bg-brand-50 rounded-lg px-3 py-2">
                Churn (Kayıp Müşteri) oranını girmene gerek yok — sistem <strong>1 − Tekrar Oranı</strong> ile otomatik hesaplar.
              </p>
            )}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ENTRY_TABS[activeTab].fields.map((f) => (
                <Field
                  key={f.name}
                  label={f.label}
                  unit={f.unit}
                  hint={f.hint}
                  inputMode="decimal"
                  value={values[f.name] ?? ""}
                  onChange={(e) => setField(f.name, e.target.value)}
                  placeholder="—"
                />
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Kanallar sekmesi */}
      {activeTab === ENTRY_TABS.length && (
        <Card>
          <CardBody>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs text-slate-500">
                  <th className="pb-2 pr-2">Kanal</th>
                  <th className="pb-2 pr-2">Harcama (TL)</th>
                  <th className="pb-2 pr-2">Brüt Satış (TL)</th>
                  <th className="pb-2 pr-2">Sipariş</th>
                  <th className="pb-2 pr-2">ROAS</th>
                  <th className="pb-2" />
                </tr>
              </thead>
              <tbody>
                {channels.map((row, i) => (
                  <tr key={i} className="border-b border-slate-50">
                    <td className="py-1 pr-2">
                      <select
                        value={row.channel}
                        onChange={(e) => setChannels((cs) => cs.map((c, j) => j === i ? { ...c, channel: e.target.value } : c))}
                        className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs focus:outline-none"
                      >
                        <option value="">Seç…</option>
                        {CHANNEL_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </td>
                    {(["spend", "grossSales", "orderCount", "roas"] as const).map((key) => (
                      <td key={key} className="py-1 pr-2">
                        <input
                          value={row[key]}
                          onChange={(e) => setChannels((cs) => cs.map((c, j) => j === i ? { ...c, [key]: e.target.value } : c))}
                          className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs focus:outline-none"
                          placeholder="—"
                        />
                      </td>
                    ))}
                    <td className="py-1">
                      <button onClick={() => setChannels((cs) => cs.filter((_, j) => j !== i))} className="text-rose-400 hover:text-rose-600 text-xs">✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Button
              variant="secondary"
              className="mt-3 text-sm"
              onClick={() => setChannels((cs) => [...cs, { channel: "", spend: "", grossSales: "", orderCount: "", roas: "" }])}
            >
              + Kanal Ekle
            </Button>
          </CardBody>
        </Card>
      )}

      {/* Sosyal Medya sekmesi */}
      {activeTab === ENTRY_TABS.length + 1 && (
        <Card>
          <CardBody>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs text-slate-500">
                  <th className="pb-2 pr-2">Platform</th>
                  <th className="pb-2 pr-2">Takipçi</th>
                  <th className="pb-2 pr-2">Kazanılan</th>
                  <th className="pb-2 pr-2">Görüntülenme</th>
                  <th className="pb-2 pr-2">Etkileşim</th>
                  <th className="pb-2" />
                </tr>
              </thead>
              <tbody>
                {socials.map((row, i) => (
                  <tr key={i} className="border-b border-slate-50">
                    <td className="py-1 pr-2">
                      <select
                        value={row.platform}
                        onChange={(e) => setSocials((ss) => ss.map((s, j) => j === i ? { ...s, platform: e.target.value } : s))}
                        className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs focus:outline-none"
                      >
                        <option value="">Seç…</option>
                        {SOCIAL_PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </td>
                    {(["followers", "gained", "views", "engagement"] as const).map((key) => (
                      <td key={key} className="py-1 pr-2">
                        <input
                          value={row[key]}
                          onChange={(e) => setSocials((ss) => ss.map((s, j) => j === i ? { ...s, [key]: e.target.value } : s))}
                          className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs focus:outline-none"
                          placeholder="—"
                        />
                      </td>
                    ))}
                    <td className="py-1">
                      <button onClick={() => setSocials((ss) => ss.filter((_, j) => j !== i))} className="text-rose-400 hover:text-rose-600 text-xs">✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Button
              variant="secondary"
              className="mt-3 text-sm"
              onClick={() => setSocials((ss) => [...ss, { platform: "", followers: "", gained: "", views: "", engagement: "" }])}
            >
              + Platform Ekle
            </Button>
          </CardBody>
        </Card>
      )}

      {/* Kaydet */}
      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Kaydediliyor…" : "Kaydet"}
        </Button>
        {message && (
          <span className={cn("text-sm font-medium", message.ok ? "text-emerald-600" : "text-rose-600")}>
            {message.text}
          </span>
        )}
      </div>
    </div>
  );
}
