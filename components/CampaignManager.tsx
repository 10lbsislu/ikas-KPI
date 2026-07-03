"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, TextArea } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { CAMPAIGN_CATEGORIES, type CampaignCategory } from "@/lib/kpi";
import { formatTL } from "@/lib/format";

type Campaign = {
  id: number;
  periodMonth: string;
  category: string;
  no: string | null;
  duration: string | null;
  format: string | null;
  creativeText: string | null;
  description: string | null;
  objective: string | null;
  targetUrl: string | null;
  targetCities: string | null;
  targetAudience: string | null;
  targetingCriteria: string | null;
  trackingPlan: string | null;
  budget: number | null;
};

const AYLAR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

function monthLabel(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  return `${AYLAR[m - 1]} ${y}`;
}

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function emptyForm(month: string): Partial<Campaign> {
  return {
    periodMonth: month,
    category: "SALES_META",
    no: "",
    duration: "",
    format: "",
    creativeText: "",
    description: "",
    objective: "",
    targetUrl: "",
    targetCities: "",
    targetAudience: "",
    targetingCriteria: "",
    trackingPlan: "",
    budget: null,
  };
}

export function CampaignManager() {
  const [month, setMonth] = useState(currentMonth());
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [allMonths, setAllMonths] = useState<string[]>([]);
  const [editing, setEditing] = useState<Partial<Campaign> | null>(null);
  const [budgetInput, setBudgetInput] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const [monthRes, allRes] = await Promise.all([
      fetch(`/api/campaigns?month=${month}`),
      fetch(`/api/campaigns`),
    ]);
    setCampaigns(await monthRes.json());
    const all: Campaign[] = await allRes.json();
    setAllMonths(Array.from(new Set(all.map((c) => c.periodMonth))).sort().reverse());
  }, [month]);

  useEffect(() => {
    load();
  }, [load]);

  const byCategory = useMemo(() => {
    const map: Record<string, Campaign[]> = {};
    for (const c of campaigns) (map[c.category] ??= []).push(c);
    return map;
  }, [campaigns]);

  const totalBudget = useMemo(
    () => campaigns.reduce((s, c) => s + (c.budget ?? 0), 0),
    [campaigns],
  );

  function openNew() {
    setEditing(emptyForm(month));
    setBudgetInput("");
  }
  function openEdit(c: Campaign) {
    setEditing(c);
    setBudgetInput(c.budget != null ? String(c.budget) : "");
  }

  async function save() {
    if (!editing) return;
    setBusy(true);
    const payload = { ...editing, budget: budgetInput === "" ? null : budgetInput };
    const isEdit = "id" in editing && editing.id;
    const res = await fetch(isEdit ? `/api/campaigns/${editing.id}` : "/api/campaigns", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setBusy(false);
    if (res.ok) {
      setEditing(null);
      load();
    } else {
      alert("Kaydetme başarısız. Alanları kontrol edin.");
    }
  }

  async function remove(id: number) {
    if (!confirm("Bu kampanyayı silmek istediğinize emin misiniz?")) return;
    await fetch(`/api/campaigns/${id}`, { method: "DELETE" });
    load();
  }

  async function copyFromPrevious() {
    const others = allMonths.filter((m) => m !== month);
    if (others.length === 0) {
      alert("Kopyalanacak başka ay yok.");
      return;
    }
    const from = prompt(`Hangi aydan kopyalansın?\nMevcut aylar: ${others.join(", ")}`, others[0]);
    if (!from || !others.includes(from)) return;
    const res = await fetch("/api/campaigns/copy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: month }),
    });
    const data = await res.json();
    if (res.ok) {
      alert(`${data.copied} kampanya kopyalandı.`);
      load();
    } else {
      alert(data.error ?? "Kopyalama başarısız.");
    }
  }

  return (
    <div className="space-y-5">
      {/* Üst kontrol */}
      <Card>
        <CardBody className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-end gap-3">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-600">Ay</span>
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </label>
            <div className="rounded-lg bg-brand-50 px-4 py-2">
              <div className="text-xs text-brand-700">Toplam Bütçe ({monthLabel(month)})</div>
              <div className="text-lg font-semibold text-brand-900 tabular">{formatTL(totalBudget)}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={copyFromPrevious}>Önceki Aydan Kopyala</Button>
            <Button onClick={openNew}>+ Yeni Kampanya</Button>
          </div>
        </CardBody>
      </Card>

      {/* Kategori bazlı listeler */}
      {campaigns.length === 0 ? (
        <Card>
          <CardBody className="py-12 text-center text-sm text-slate-500">
            {monthLabel(month)} için kampanya yok. “+ Yeni Kampanya” ile ekleyin.
          </CardBody>
        </Card>
      ) : (
        (Object.keys(CAMPAIGN_CATEGORIES) as CampaignCategory[]).map((cat) => {
          const list = byCategory[cat] ?? [];
          if (list.length === 0) return null;
          const catBudget = list.reduce((s, c) => s + (c.budget ?? 0), 0);
          return (
            <Card key={cat}>
              <CardHeader
                title={CAMPAIGN_CATEGORIES[cat]}
                subtitle={`${list.length} kampanya`}
                action={<span className="text-sm font-semibold text-slate-700 tabular">{formatTL(catBudget)}</span>}
              />
              <CardBody className="space-y-2">
                {list.map((c) => (
                  <div key={c.id} className="flex items-start justify-between gap-3 rounded-lg border border-slate-100 p-3 hover:bg-slate-50">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                        {c.no && <span className="rounded bg-slate-100 px-1.5 text-xs text-slate-500">{c.no}</span>}
                        {c.description || c.objective || c.format || "(başlıksız)"}
                      </div>
                      <div className="mt-1 line-clamp-2 text-xs text-slate-500">
                        {[c.format, c.duration, c.objective].filter(Boolean).join(" · ")}
                        {c.targetUrl && <> · <span className="text-brand-600">{c.targetUrl}</span></>}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-sm font-semibold text-slate-700 tabular">{formatTL(c.budget)}</span>
                      <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => openEdit(c)}>Düzenle</Button>
                      <Button variant="ghost" className="px-2 py-1 text-xs text-rose-600" onClick={() => remove(c.id)}>Sil</Button>
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>
          );
        })
      )}

      {/* Düzenleme/ekleme modalı */}
      {editing && (
        <div className="fixed inset-0 z-30 flex items-start justify-center overflow-y-auto bg-slate-900/30 p-4">
          <div className="my-8 w-full max-w-2xl rounded-xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
              <h3 className="text-sm font-semibold text-slate-900">
                {"id" in editing && editing.id ? "Kampanyayı Düzenle" : "Yeni Kampanya"}
              </h3>
              <button onClick={() => setEditing(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <div className="grid max-h-[70vh] gap-4 overflow-y-auto p-5 sm:grid-cols-2">
              <Select
                label="Kategori"
                value={editing.category}
                onChange={(e) => setEditing({ ...editing, category: e.target.value })}
              >
                {(Object.keys(CAMPAIGN_CATEGORIES) as CampaignCategory[]).map((k) => (
                  <option key={k} value={k}>{CAMPAIGN_CATEGORIES[k]}</option>
                ))}
              </Select>
              <Field label="No / Sıra" value={editing.no ?? ""} onChange={(e) => setEditing({ ...editing, no: e.target.value })} />
              <Field label="Süre" value={editing.duration ?? ""} onChange={(e) => setEditing({ ...editing, duration: e.target.value })} placeholder="ör. 30 gün" />
              <Field label="Reklam Formatı" value={editing.format ?? ""} onChange={(e) => setEditing({ ...editing, format: e.target.value })} />
              <Field label="Amaç" value={editing.objective ?? ""} onChange={(e) => setEditing({ ...editing, objective: e.target.value })} />
              <Field label="Bütçe" unit="TL" inputMode="decimal" value={budgetInput} onChange={(e) => setBudgetInput(e.target.value)} />
              <Field label="Yönlendirilen URL" className="sm:col-span-2" value={editing.targetUrl ?? ""} onChange={(e) => setEditing({ ...editing, targetUrl: e.target.value })} />
              <TextArea label="Açıklama" className="sm:col-span-2" rows={2} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              <TextArea label="Reklam Görseli ve Metni" className="sm:col-span-2" rows={2} value={editing.creativeText ?? ""} onChange={(e) => setEditing({ ...editing, creativeText: e.target.value })} />
              <TextArea label="Hedef İller" className="sm:col-span-2" rows={2} value={editing.targetCities ?? ""} onChange={(e) => setEditing({ ...editing, targetCities: e.target.value })} />
              <TextArea label="Hedef Kitle" className="sm:col-span-2" rows={2} value={editing.targetAudience ?? ""} onChange={(e) => setEditing({ ...editing, targetAudience: e.target.value })} />
              <TextArea label="Hedefleme Kriterleri" className="sm:col-span-2" rows={3} value={editing.targetingCriteria ?? ""} onChange={(e) => setEditing({ ...editing, targetingCriteria: e.target.value })} />
              <Field label="İzleme / Optimize Planı" className="sm:col-span-2" value={editing.trackingPlan ?? ""} onChange={(e) => setEditing({ ...editing, trackingPlan: e.target.value })} />
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-3">
              <Button variant="secondary" onClick={() => setEditing(null)}>İptal</Button>
              <Button onClick={save} disabled={busy}>{busy ? "Kaydediliyor…" : "Kaydet"}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
