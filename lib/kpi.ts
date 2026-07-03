/**
 * Türetilmiş KPI hesaplamaları, churn otomatiği, yıllık özet ve % değişim.
 * Kullanıcı bir metriği elle girerse o değer korunur; boşsa otomatik hesaplanır.
 * CHURN her zaman türetilir (elle girilmez): churn = 1 − tekrar oranı.
 */

function div(a: number | null | undefined, b: number | null | undefined): number | null {
  if (a === null || a === undefined || b === null || b === undefined || b === 0) return null;
  return a / b;
}

// ---- Aylık Özet türetmeleri ----

/** Net satış boşsa İKAS brüt − iptal − iade. */
export function deriveNetSales(s: {
  netSales?: number | null;
  ikasGross?: number | null;
  cancelled?: number | null;
  returned?: number | null;
}): number | null {
  if (s.netSales != null) return s.netSales;
  if (s.ikasGross == null) return null;
  return s.ikasGross - (s.cancelled ?? 0) - (s.returned ?? 0);
}

/** AOV (net) boşsa net satış / sipariş. */
export function deriveAOV(s: { aov?: number | null; netSales?: number | null; orderCount?: number | null }): number | null {
  if (s.aov != null) return s.aov;
  return div(s.netSales, s.orderCount);
}

/** Brüt ROAS boşsa İKAS brüt / reklam harcaması. */
export function deriveGrossRoas(s: { grossRoas?: number | null; ikasGross?: number | null; adSpend?: number | null }): number | null {
  if (s.grossRoas != null) return s.grossRoas;
  return div(s.ikasGross, s.adSpend);
}

/** Net ROAS boşsa net satış / reklam harcaması. */
export function deriveNetRoas(s: { netRoas?: number | null; netSales?: number | null; adSpend?: number | null }): number | null {
  if (s.netRoas != null) return s.netRoas;
  return div(s.netSales, s.adSpend);
}

// ---- Müşteri / Churn ----

/** Tekrar oranı boşsa tekrar müşteri / toplam müşteri. */
export function deriveRepeatRate(c: { repeatRate?: number | null; repeatCustomers?: number | null; totalCustomers?: number | null }): number | null {
  if (c.repeatRate != null) return c.repeatRate;
  return div(c.repeatCustomers, c.totalCustomers);
}

/**
 * CHURN (Kayıp Müşteri Oranı) — kullanıcı GİRMEZ, sistem hesaplar.
 * churn = 1 − tekrar oranı. Sonuç 0–1 arası oran (gösterimde %'ye çevrilir).
 */
export function deriveChurn(c: { repeatRate?: number | null; repeatCustomers?: number | null; totalCustomers?: number | null }): number | null {
  const rr = deriveRepeatRate(c);
  if (rr == null) return null;
  return Math.max(0, 1 - rr);
}

// ---- Ürün ----

export function deriveProductsPerOrder(p: { productsPerOrder?: number | null; productsSold?: number | null; orderCount?: number | null }): number | null {
  if (p.productsPerOrder != null) return p.productsPerOrder;
  return div(p.productsSold, p.orderCount);
}

// ---- Funnel oranları ----

export function funnelRates(f: {
  sessions?: number | null;
  addToCart?: number | null;
  checkout?: number | null;
  purchase?: number | null;
}) {
  return {
    addToCartRate: div(f.addToCart, f.sessions),
    checkoutRate: div(f.checkout, f.addToCart),
    purchaseRate: div(f.purchase, f.sessions),
  };
}

// ---- Kanal ----

export function deriveChannelRoas(c: { roas?: number | null; grossSales?: number | null; spend?: number | null }): number | null {
  if (c.roas != null) return c.roas;
  return div(c.grossSales, c.spend);
}

// ---- % değişim ----

/** İki değer arasındaki yüzde değişim. Önceki 0/null ise null döner. */
export function pctChange(current: number | null | undefined, previous: number | null | undefined): number | null {
  if (current == null || previous == null || previous === 0) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

// ---- Otomatik gözlemler ----

export type Insight = {
  type: "positive" | "negative" | "neutral" | "warning";
  text: string;
};

/**
 * Mevcut ve önceki ay verilerinden otomatik gözlem listesi üretir.
 * Kural tabanlı, eşik değerlere göre tetiklenir.
 */
export function generateInsights(
  current: {
    summary?: any; customer?: any; product?: any; funnel?: any; channels?: any[];
  },
  previous?: {
    summary?: any; customer?: any; product?: any; funnel?: any; channels?: any[];
  } | null
): Insight[] {
  const insights: Insight[] = [];
  const cs = current.summary ?? {};
  const ps = previous?.summary ?? {};
  const cc = current.customer ?? {};
  const pc = previous?.customer ?? {};
  const cf = current.funnel ?? {};
  const pf = previous?.funnel ?? {};

  const netSales = deriveNetSales(cs);
  const prevNetSales = previous ? deriveNetSales(ps) : null;
  const netRoas = deriveNetRoas({ ...cs, netSales });
  const prevNetRoas = previous ? deriveNetRoas({ ...ps, netSales: prevNetSales }) : null;
  const grossRoas = deriveGrossRoas(cs);
  const prevGrossRoas = previous ? deriveGrossRoas(ps) : null;
  const churn = deriveChurn(cc);
  const prevChurn = previous ? deriveChurn(pc) : null;
  const repeatRate = deriveRepeatRate(cc);
  const aov = deriveAOV({ ...cs, netSales });
  const prevAov = previous ? deriveAOV({ ...ps, netSales: prevNetSales }) : null;

  const chg = (cur: number | null, prv: number | null) => pctChange(cur, prv);
  const fmt = (n: number) => Math.abs(Math.round(n));

  if (previous) {
    // Reklam harcaması + ROAS kombinasyonu
    const adChg = chg(cs.adSpend, ps.adSpend);
    const roasChg = chg(netRoas, prevNetRoas);
    if (adChg != null && roasChg != null) {
      if (adChg < -5 && roasChg > 5) {
        insights.push({ type: "positive", text: `Reklam harcaması %${fmt(adChg)} azaldı, Net ROAS aynı anda %${fmt(roasChg)} yükseldi — reklam verimliliği güçlü arttı.` });
      } else if (adChg > 10 && roasChg < -10) {
        insights.push({ type: "negative", text: `Reklam harcaması %${fmt(adChg)} arttı ama Net ROAS %${fmt(roasChg)} düştü — harcama artışı karşılığını bulamıyor.` });
      } else if (adChg > 10 && roasChg > 5) {
        insights.push({ type: "positive", text: `Reklam harcaması %${fmt(adChg)} artmasına rağmen ROAS da %${fmt(roasChg)} yükseldi — ölçek başarıyla büyütülüyor.` });
      } else if (adChg < -10 && roasChg < -10) {
        insights.push({ type: "warning", text: `Reklam harcaması %${fmt(adChg)} azaldı ve ROAS da %${fmt(roasChg)} düştü — bütçe kesintisi ciroyu olumsuz etkiliyor olabilir.` });
      }
    }

    // Ciro değişimi
    const ciröChg = chg(cs.ikasGross, ps.ikasGross);
    if (ciröChg != null) {
      if (ciröChg > 30) insights.push({ type: "positive", text: `İKAS ciroda güçlü artış: önceki aya göre %${fmt(ciröChg)} büyüme.` });
      else if (ciröChg < -20) insights.push({ type: "negative", text: `İKAS ciro önceki aya göre %${fmt(ciröChg)} geriledi.` });
    }

    // Churn
    if (churn != null && prevChurn != null) {
      const diff = churn - prevChurn;
      if (diff > 0.05) insights.push({ type: "warning", text: `Churn oranı ${Math.round(prevChurn*100)}%'den ${Math.round(churn*100)}%'e yükseldi — müşteri kaybı artıyor, tekrar satın almayı teşvik etmek faydalı olabilir.` });
      else if (diff < -0.05) insights.push({ type: "positive", text: `Churn oranı ${Math.round(prevChurn*100)}%'den ${Math.round(churn*100)}%'e geriledi — müşteri sadakati iyileşiyor.` });
    }

    // AOV
    const aovChg = chg(aov, prevAov);
    if (aovChg != null && Math.abs(aovChg) > 15) {
      insights.push(aovChg > 0
        ? { type: "positive", text: `Ortalama sepet değeri %${fmt(aovChg)} arttı — müşteri başına harcama yükseliyor.` }
        : { type: "negative", text: `Ortalama sepet değeri %${fmt(aovChg)} düştü — çapraz satış fırsatı değerlendirilebilir.` });
    }

    // Funnel dönüşüm
    const buyRate = cf.sessions && cf.purchase ? cf.purchase / cf.sessions : null;
    const prevBuyRate = pf.sessions && pf.purchase ? pf.purchase / pf.sessions : null;
    const buyChg = chg(buyRate, prevBuyRate);
    if (buyChg != null && Math.abs(buyChg) > 20) {
      insights.push(buyChg > 0
        ? { type: "positive", text: `Genel dönüşüm oranı %${fmt(buyChg)} iyileşti — funnel optimizasyonu etkisini gösteriyor.` }
        : { type: "negative", text: `Genel dönüşüm oranı %${fmt(buyChg)} geriledi — sepet terk nedenleri incelenebilir.` });
    }
  }

  // Eşik bazlı (önceki ay olmaksızın da)
  if (netRoas != null) {
    if (netRoas >= 15) insights.push({ type: "positive", text: `Net ROAS ${netRoas.toFixed(1)}x ile çok güçlü bir seviyede — reklam yatırımı yüksek verimle çalışıyor.` });
    else if (netRoas < 2) insights.push({ type: "warning", text: `Net ROAS ${netRoas.toFixed(1)}x ile düşük — harcama/gelir dengesi gözden geçirilmeli.` });
  }

  if (repeatRate != null && repeatRate > 0.6) {
    insights.push({ type: "positive", text: `Tekrar müşteri oranı %${Math.round(repeatRate*100)} — müşteri bağlılığı çok yüksek.` });
  }

  if (cf.cartAbandon != null && cf.addToCart && cf.cartAbandon / cf.addToCart > 0.8) {
    insights.push({ type: "warning", text: `Sepete eklenenlerin %${Math.round(cf.cartAbandon/cf.addToCart*100)}'i terk ediyor — ödeme adımında bir engel olabilir.` });
  }

  if (insights.length === 0 && !previous) {
    insights.push({ type: "neutral", text: "Karşılaştırma için en az 2 aylık veri gerekiyor. Bir ay daha veri girdikten sonra otomatik gözlemler burada görünecek." });
  }

  return insights;
}

// ---- Yıllık özet ----

export type MonthlyEntryLike = {
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

/**
 * Bir yıla ait aylardan yıllık özet üretir.
 * Para/sayı alanları TOPLANIR; oranlar (ROAS, AOV, churn) toplamlardan yeniden hesaplanır.
 */
export function buildYearlySummary(entries: MonthlyEntryLike[]) {
  const sum = (fn: (e: MonthlyEntryLike) => number | null | undefined) =>
    entries.reduce((acc, e) => {
      const v = fn(e);
      return v == null ? acc : acc + v;
    }, 0);

  const ikasGross = sum((e) => e.summary?.ikasGross);
  const ga4Gross = sum((e) => e.summary?.ga4Gross);
  const cancelled = sum((e) => e.summary?.cancelled);
  const returned = sum((e) => e.summary?.returned);
  const adSpend = sum((e) => e.summary?.adSpend);
  const orderCount = sum((e) => e.summary?.orderCount);
  const netSales = sum((e) => deriveNetSales(e.summary ?? {}) ?? 0);

  const productsSold = sum((e) => e.product?.productsSold);
  const newCustomers = sum((e) => e.customer?.newCustomers);
  const repeatCustomers = sum((e) => e.customer?.repeatCustomers);
  const totalCustomers = sum((e) => e.customer?.totalCustomers);

  const sessions = sum((e) => e.funnel?.sessions);
  const purchase = sum((e) => e.funnel?.purchase);

  const repeatRate = div(repeatCustomers, totalCustomers);

  return {
    ikasGross,
    ga4Gross,
    cancelled,
    returned,
    netSales,
    adSpend,
    orderCount,
    aov: div(netSales, orderCount),
    grossRoas: div(ikasGross, adSpend),
    netRoas: div(netSales, adSpend),
    productsSold,
    productsPerOrder: div(productsSold, orderCount),
    newCustomers,
    repeatCustomers,
    totalCustomers,
    repeatRate,
    churn: repeatRate == null ? null : Math.max(0, 1 - repeatRate),
    sessions,
    purchase,
    purchaseRate: div(purchase, sessions),
    monthCount: entries.length,
  };
}

// ---- Sabitler ----

export const TR_MONTHS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

/** "2026-01" -> "Ocak 2026" */
export function monthLabelTR(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return `${TR_MONTHS[m - 1]} ${y}`;
}

export const CAMPAIGN_CATEGORIES = {
  SALES_META: "Satış Artırıcı Reklamlar (Meta)",
  AWARENESS_META: "Bilinirlik Reklamları (Meta)",
  GOOGLE: "Google Reklamları",
  OTHER: "Diğer",
} as const;

export type CampaignCategory = keyof typeof CAMPAIGN_CATEGORIES;
