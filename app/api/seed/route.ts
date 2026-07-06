import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const SEED_SECRET = "pakyurek-seed-2026";

// Tüm veri burada hardcoded — seed-data.json'dan alındı
const entries = [
  { month: "2025-12", label: "Aralık 2025", year: 2025, summary: null, product: null, customer: null, funnel: null, channels: [], socials: [{ platform: "İNSTAGRAM", followers: 6077, gained: 568, views: 306700, engagement: "1100" }, { platform: "FACEBOOK", followers: 500, gained: 1, views: 345100, engagement: "139" }, { platform: "Linkedln", followers: 814, gained: 2, views: 1706, engagement: "60" }, { platform: "YOUTUBE", followers: null, gained: null, views: null, engagement: null }] },
  { month: "2026-01", label: "Ocak 2026", year: 2026, summary: { ikasGross: 554767.73, ga4Gross: 554767.73, cancelled: 0, returned: 14498.83, netSales: 540268.9, orderCount: 20, aov: null, adSpend: 58916.97, grossRoas: null, netRoas: 9.17, notes: null }, product: { orderCount: 20, productsSold: 183, productsPerOrder: null, topProduct: null, notes: null }, customer: { totalCustomers: 19, newCustomers: 10, repeatCustomers: 9, repeatRate: 0.4737, notes: null }, funnel: { sessions: 6730, productViews: 1931, addToCart: 307, checkout: 133, purchase: 20, cartAbandon: 174, checkoutAbandon: 113, notes: null }, channels: [{ channel: "Google Ads", spend: 17628.99, grossSales: 201431, orderCount: 10, roas: null, notes: null }, { channel: "Organic", spend: 0, grossSales: 361196.13, orderCount: 5, roas: null, notes: null }], socials: [{ platform: "İNSTAGRAM", followers: 6479, gained: 402, views: 235400, engagement: "900" }, { platform: "FACEBOOK", followers: 502, gained: 2, views: 289600, engagement: "110" }, { platform: "Linkedln", followers: 822, gained: 8, views: 2103, engagement: "74" }, { platform: "YOUTUBE", followers: null, gained: null, views: null, engagement: null }] },
  { month: "2026-02", label: "Şubat 2026", year: 2026, summary: { ikasGross: 419007.04, ga4Gross: 419007.04, cancelled: 0, returned: 8559.56, netSales: 410447.48, orderCount: 17, aov: null, adSpend: 50632.18, grossRoas: null, netRoas: 8.11, notes: null }, product: { orderCount: 17, productsSold: 156, productsPerOrder: null, topProduct: null, notes: null }, customer: { totalCustomers: 16, newCustomers: 7, repeatCustomers: 9, repeatRate: 0.5625, notes: null }, funnel: { sessions: 5890, productViews: 1654, addToCart: 265, checkout: 108, purchase: 17, cartAbandon: 157, checkoutAbandon: 91, notes: null }, channels: [], socials: [{ platform: "İNSTAGRAM", followers: 6721, gained: 242, views: 198300, engagement: "756" }, { platform: "FACEBOOK", followers: 505, gained: 3, views: 241200, engagement: "92" }, { platform: "Linkedln", followers: 829, gained: 7, views: 1854, engagement: "65" }, { platform: "YOUTUBE", followers: null, gained: null, views: null, engagement: null }] },
  { month: "2026-03", label: "Mart 2026", year: 2026, summary: { ikasGross: 623451.2, ga4Gross: 623451.2, cancelled: 0, returned: 11230.42, netSales: 612220.78, orderCount: 24, aov: null, adSpend: 67234.5, grossRoas: null, netRoas: 9.1, notes: null }, product: { orderCount: 24, productsSold: 218, productsPerOrder: null, topProduct: null, notes: null }, customer: { totalCustomers: 23, newCustomers: 12, repeatCustomers: 11, repeatRate: 0.4783, notes: null }, funnel: { sessions: 8124, productViews: 2341, addToCart: 389, checkout: 162, purchase: 24, cartAbandon: 227, checkoutAbandon: 138, notes: null }, channels: [], socials: [] },
  { month: "2026-04", label: "Nisan 2026", year: 2026, summary: { ikasGross: 578934.65, ga4Gross: 578934.65, cancelled: 0, returned: 9876.3, netSales: 569058.35, orderCount: 22, aov: null, adSpend: 61450.0, grossRoas: null, netRoas: 9.26, notes: null }, product: { orderCount: 22, productsSold: 201, productsPerOrder: null, topProduct: null, notes: null }, customer: { totalCustomers: 21, newCustomers: 11, repeatCustomers: 10, repeatRate: 0.4762, notes: null }, funnel: { sessions: 7456, productViews: 2134, addToCart: 352, checkout: 147, purchase: 22, cartAbandon: 205, checkoutAbandon: 125, notes: null }, channels: [], socials: [] },
  { month: "2026-05", label: "Mayıs 2026", year: 2026, summary: { ikasGross: 701234.8, ga4Gross: 701234.8, cancelled: 0, returned: 13456.9, netSales: 687777.9, orderCount: 26, aov: null, adSpend: 72340.0, grossRoas: null, netRoas: 9.51, notes: null }, product: { orderCount: 26, productsSold: 241, productsPerOrder: null, topProduct: null, notes: null }, customer: { totalCustomers: 25, newCustomers: 13, repeatCustomers: 12, repeatRate: 0.48, notes: null }, funnel: { sessions: 9234, productViews: 2678, addToCart: 423, checkout: 178, purchase: 26, cartAbandon: 245, checkoutAbandon: 152, notes: null }, channels: [], socials: [] },
  { month: "2026-06", label: "Haziran 2026", year: 2026, summary: { ikasGross: 864238.94, ga4Gross: 864238.94, cancelled: 0, returned: 6148.63, netSales: 858090.31, orderCount: 27, aov: null, adSpend: 58253.26, grossRoas: null, netRoas: 14.73, notes: null }, product: { orderCount: 27, productsSold: 260, productsPerOrder: null, topProduct: "Mezgit Fileto Porsiyon Dilim Donuk - Dökme (34 adet)", notes: null }, customer: { totalCustomers: 26, newCustomers: 10, repeatCustomers: 16, repeatRate: 0.6154, notes: null }, funnel: { sessions: 7226, productViews: 2021, addToCart: 288, checkout: 120, purchase: 23, cartAbandon: 168, checkoutAbandon: 97, notes: null }, channels: [{ channel: "Google Ads", spend: 10623.64, grossSales: 586429.75, orderCount: 15, roas: null, notes: null }, { channel: "Google Organic", spend: 0, grossSales: 94539.85, orderCount: 6, roas: null, notes: null }, { channel: "Bing Organic", spend: 0, grossSales: 56559.6, orderCount: 1, roas: null, notes: null }, { channel: "Direkt", spend: 0, grossSales: 40937.91, orderCount: 1, roas: null, notes: null }, { channel: "PayTR Referral", spend: 0, grossSales: 24049.45, orderCount: 1, roas: null, notes: null }, { channel: "Instagram", spend: 9000, grossSales: 22009, orderCount: 1, roas: null, notes: null }, { channel: "Belirsiz", spend: 0, grossSales: 39713.38, orderCount: 2, roas: null, notes: null }], socials: [] },
];

const campaigns = [
  { id: 1, periodMonth: "2026-01", category: "SALES_META", no: "1", description: "Ocak Satış Kampanyası", objective: "Satış", format: "Video", budget: 8000 },
  { id: 2, periodMonth: "2026-01", category: "AWARENESS_META", no: "2", description: "Ocak Bilinirlik", objective: "Bilinirlik", format: "Görsel", budget: 3000 },
  { id: 3, periodMonth: "2026-01", category: "GOOGLE", no: "3", description: "Ocak Google Arama", objective: "Trafik", format: "Arama", budget: 6628.99 },
  { id: 4, periodMonth: "2026-02", category: "SALES_META", no: "1", description: "Şubat Satış Kampanyası", objective: "Satış", format: "Video", budget: 9000 },
  { id: 5, periodMonth: "2026-02", category: "AWARENESS_META", no: "2", description: "Şubat Bilinirlik", objective: "Bilinirlik", format: "Görsel", budget: 3500 },
  { id: 6, periodMonth: "2026-02", category: "GOOGLE", no: "3", description: "Şubat Google Arama", objective: "Trafik", format: "Arama", budget: 7132.18 },
  { id: 7, periodMonth: "2026-03", category: "SALES_META", no: "1", description: "Mart Satış Kampanyası", objective: "Satış", format: "Video", budget: 10000 },
  { id: 8, periodMonth: "2026-03", category: "AWARENESS_META", no: "2", description: "Mart Bilinirlik", objective: "Bilinirlik", format: "Görsel", budget: 4000 },
  { id: 9, periodMonth: "2026-03", category: "GOOGLE", no: "3", description: "Mart Google Arama", objective: "Trafik", format: "Arama", budget: 8234.5 },
  { id: 10, periodMonth: "2026-04", category: "SALES_META", no: "1", description: "Nisan Satış Kampanyası", objective: "Satış", format: "Video", budget: 9500 },
  { id: 11, periodMonth: "2026-04", category: "AWARENESS_META", no: "2", description: "Nisan Bilinirlik", objective: "Bilinirlik", format: "Görsel", budget: 3800 },
  { id: 12, periodMonth: "2026-04", category: "GOOGLE", no: "3", description: "Nisan Google Arama", objective: "Trafik", format: "Arama", budget: 7650 },
  { id: 13, periodMonth: "2026-05", category: "SALES_META", no: "1", description: "Mayıs Satış Kampanyası", objective: "Satış", format: "Video", budget: 11000 },
  { id: 14, periodMonth: "2026-05", category: "AWARENESS_META", no: "2", description: "Mayıs Bilinirlik", objective: "Bilinirlik", format: "Görsel", budget: 4200 },
  { id: 15, periodMonth: "2026-05", category: "GOOGLE", no: "3", description: "Mayıs Google Arama", objective: "Trafik", format: "Arama", budget: 9140 },
  { id: 16, periodMonth: "2026-06", category: "SALES_META", no: "1", description: "MAYIS GETİR 2026", objective: "Trafik / Satış Artırıcı — Getir kanalı", format: "Trafik", budget: 14841.62 },
  { id: 17, periodMonth: "2026-06", category: "SALES_META", no: "2", description: "Yemeksepeti Mayıs 2026", objective: "Trafik / Satış Artırıcı — Yemeksepeti kanalı", format: "Trafik", budget: 14748.99 },
  { id: 18, periodMonth: "2026-06", category: "AWARENESS_META", no: "3", description: "Instagram gönderisi: Somon Füme & Avokado Sandviç", objective: "Bilinirlik — Profil ziyareti", format: "Instagram Gönderi Tanıtımı", budget: 2999.33 },
  { id: 19, periodMonth: "2026-06", category: "AWARENESS_META", no: "4", description: "Instagram gönderisi: Dışı çıtır ve içi yumuşacık", objective: "Bilinirlik — Profil ziyareti", format: "Instagram Gönderi Tanıtımı", budget: 2999.29 },
  { id: 20, periodMonth: "2026-06", category: "AWARENESS_META", no: "5", description: "Instagram gönderisi: Dünyanın en büyük deniz ürünü marketleri", objective: "Bilinirlik — Profil ziyareti", format: "Instagram Gönderi Tanıtımı", budget: 2993.33 },
  { id: 21, periodMonth: "2026-06", category: "AWARENESS_META", no: "6", description: "Instagram gönderisi: Pişmiş Mezgit ile Limonlu Sos", objective: "Bilinirlik — Profil ziyareti", format: "Instagram Gönderi Tanıtımı", budget: 48.87 },
];

export async function GET(req: Request) {
  const url = new URL(req.url);
  const secret = url.searchParams.get("secret");

  if (secret !== SEED_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let entryCount = 0;
    let campaignCount = 0;

    for (const e of entries) {
      const entry = await prisma.monthlyEntry.upsert({
        where: { month: e.month },
        create: { month: e.month, label: e.label, year: e.year },
        update: { label: e.label, year: e.year },
      });

      if (e.summary) {
        const { ...s } = e.summary;
        await prisma.monthlySummary.upsert({
          where: { entryId: entry.id },
          create: { entryId: entry.id, ...s },
          update: s,
        });
      }
      if (e.product) {
        const { ...s } = e.product;
        await prisma.productPerf.upsert({
          where: { entryId: entry.id },
          create: { entryId: entry.id, ...s },
          update: s,
        });
      }
      if (e.customer) {
        const { ...s } = e.customer;
        await prisma.customerKPI.upsert({
          where: { entryId: entry.id },
          create: { entryId: entry.id, ...s },
          update: s,
        });
      }
      if (e.funnel) {
        const { ...s } = e.funnel;
        await prisma.funnel.upsert({
          where: { entryId: entry.id },
          create: { entryId: entry.id, ...s },
          update: s,
        });
      }
      if (e.channels.length) {
        await prisma.channelPerf.deleteMany({ where: { entryId: entry.id } });
        await prisma.channelPerf.createMany({
          data: e.channels.map((c) => ({ entryId: entry.id, ...c })),
        });
      }
      if (e.socials.length) {
        await prisma.socialMedia.deleteMany({ where: { entryId: entry.id } });
        await prisma.socialMedia.createMany({
          data: e.socials.map((s) => ({ entryId: entry.id, ...s })),
        });
      }
      entryCount++;
    }

    for (const c of campaigns) {
      const { id, ...data } = c;
      await prisma.campaign.upsert({
        where: { id },
        create: { id, ...data },
        update: data,
      });
      campaignCount++;
    }

    return NextResponse.json({
      ok: true,
      message: `✓ ${entryCount} ay, ${campaignCount} kampanya yüklendi.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
