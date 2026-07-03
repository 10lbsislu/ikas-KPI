/**
 * MezzeMarin_Tam_Kontrol_Paneli_FINAL.xlsx + REKLAM PLANLAMASI/*.xlsx
 * → veritabanı
 *
 * Çalıştırma:  npm run import
 *
 * FINAL.xlsx 6 sheet içerir (aylık zaman serisi — Ocak–Mayıs 2026):
 *   1. Kanal Performansı   2. Aylık Özet   3. Ürün Performansı
 *   4. Müşteri KPI         5. Funnel (GA4) 6. Sosyal Medya Takibi
 *
 * Her sheet'te ilk satır başlık, sonraki satırlar ay verileri veya
 * kanal/platform satırlarıdır (yapıya göre farklı).
 */
import * as XLSX from "xlsx";
import path from "path";
import fs from "fs";
import { PrismaClient } from "@prisma/client";
import { parseTrNumber } from "../lib/format";
import { monthLabelTR } from "../lib/kpi";

const prisma = new PrismaClient();
const ROOT = path.resolve(__dirname, "..");

function sheetToRows(ws: XLSX.WorkSheet): any[][] {
  return XLSX.utils.sheet_to_json(ws, { header: 1, defval: null, raw: true }) as any[][];
}

/** Hücre değerini string'e çevirir. null/boş → null */
function str(v: any): string | null {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s === "" ? null : s;
}

/** Hücre değerini sayıya çevirir. Metin olabilir (₺ işareti, binlik nokta vb.) */
function num(v: any): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "number") return isFinite(v) ? v : null;
  return parseTrNumber(v);
}

/** Hücre değerini tam sayıya çevirir */
function int(v: any): number | null {
  const n = num(v);
  return n === null ? null : Math.round(n);
}

/** Başlık satırını alıp sütun indeksi -> başlık adı eşlemesi döndürür */
function headerMap(row: any[]): Record<string, number> {
  const map: Record<string, number> = {};
  row.forEach((cell, i) => {
    const s = str(cell);
    if (s) map[s.toLocaleLowerCase("tr-TR")] = i;
  });
  return map;
}

/** Bir başlığı headerMap'te bulur (kısmi eşleşme) */
function col(headers: Record<string, number>, ...candidates: string[]): number {
  for (const c of candidates) {
    const lower = c.toLocaleLowerCase("tr-TR");
    for (const [key, idx] of Object.entries(headers)) {
      if (key.includes(lower) || lower.includes(key)) return idx;
    }
  }
  return -1;
}

// Türkçe ay etiketi -> "YYYY-MM"
const TR_MONTH_MAP: Record<string, string> = {
  "ocak": "01", "şubat": "02", "mart": "03", "nisan": "04",
  "mayıs": "05", "haziran": "06", "temmuz": "07", "ağustos": "08",
  "eylül": "09", "ekim": "10", "kasım": "11", "aralık": "12",
};

const KNOWN_PLATFORMS = new Set(["instagram", "facebook", "linkedln", "linkedin", "youtube", "tiktok", "twitter"]);

function parseMonthKey(label: any, year = 2026): string | null {
  const s = str(label);
  if (!s) return null;
  const low = s.toLocaleLowerCase("tr-TR").trim();
  // Platform adıysa ay değildir
  if (KNOWN_PLATFORMS.has(low)) return null;
  // "Ocak 2026", "OCAK 2026", "OCAK", "ocak" vb.
  for (const [tr, mm] of Object.entries(TR_MONTH_MAP)) {
    if (low.startsWith(tr)) {
      const yearInLabel = low.match(/\d{4}/);
      const y = yearInLabel ? parseInt(yearInLabel[0]) : year;
      return `${y}-${mm}`;
    }
  }
  // "01.2026" ya da "2026-01"
  const m1 = low.match(/^(\d{2})\.(\d{4})$/);
  if (m1) return `${m1[2]}-${m1[1]}`;
  const m2 = low.match(/^(\d{4})-(\d{2})$/);
  if (m2) return `${m2[1]}-${m2[2]}`;
  return null;
}

// ─── Sheet parserleri ─────────────────────────────────────────────────────────

/**
 * Sheet: Aylık Özet
 * Yapı: Satır başına ay (Ocak–Mayıs), sütunlar: ay | ga4 | ikas | iptal | iade | netSatış | sipariş | aov | reklamHarcaması | brütROAS | netROAS | ...
 */
function parseAylikOzet(ws: XLSX.WorkSheet): Map<string, any> {
  const rows = sheetToRows(ws);
  const result = new Map<string, any>();
  if (rows.length < 2) return result;

  const hdr = headerMap(rows[0]);
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const monthKey = parseMonthKey(row[0]);
    if (!monthKey) continue;

    const ga4Col = col(hdr, "ga4", "toplam gelir", "ga4 brüt");
    const ikasCol = col(hdr, "ikas", "gerçek ciro", "ikas brüt");
    const cancelCol = col(hdr, "iptal");
    const returnCol = col(hdr, "iade tutarı", "iade");
    const netCol = col(hdr, "net satış");
    const orderCol = col(hdr, "sipariş", "order");
    const aovCol = col(hdr, "aov", "ortalama sepet");
    const spendCol = col(hdr, "reklam harcaması", "ad spend", "toplam reklam");
    const grossRoasCol = col(hdr, "brüt roas");
    const netRoasCol = col(hdr, "net roas");

    const notesCol = col(hdr, "not", "olay");
    result.set(monthKey, {
      ga4Gross: num(row[ga4Col] ?? row[1]),
      ikasGross: num(row[ikasCol] ?? row[2]),
      cancelled: num(row[cancelCol] ?? row[3]),
      returned: num(row[returnCol] ?? row[4]),
      netSales: num(row[netCol] ?? row[5]),
      orderCount: int(row[orderCol] ?? row[6]),
      aov: num(row[aovCol] ?? row[7]),
      adSpend: num(row[spendCol] ?? row[8]),
      grossRoas: num(row[grossRoasCol] ?? row[9]),
      netRoas: num(row[netRoasCol] ?? row[10]),
      notes: str(row[notesCol >= 0 ? notesCol : 11]),
    });
  }
  return result;
}

/**
 * Sheet: Ürün Performansı
 * Yapı: Satır başına ay, sütunlar: ay | sipariş | ürünAdedi | faturaBaşınaÜrün | enÇokSatan
 */
function parseUrunPerf(ws: XLSX.WorkSheet): Map<string, any> {
  const rows = sheetToRows(ws);
  const result = new Map<string, any>();
  if (rows.length < 2) return result;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const monthKey = parseMonthKey(row[0]);
    if (!monthKey) continue;
    result.set(monthKey, {
      orderCount: int(row[1]),
      productsSold: int(row[2]),
      productsPerOrder: num(row[3]),
      topProduct: str(row[4]),
    });
  }
  return result;
}

/**
 * Sheet: Müşteri KPI
 * Yapı: Satır başına ay, sütunlar: ay | toplamMüşteri | yeniMüşteri | tekrarMüşteri | tekrarOranı
 * churnRate SAKLANMAZ — lib/kpi.ts'te türetilir
 */
function parseMusteriKPI(ws: XLSX.WorkSheet): Map<string, any> {
  const rows = sheetToRows(ws);
  const result = new Map<string, any>();
  if (rows.length < 2) return result;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const monthKey = parseMonthKey(row[0]);
    if (!monthKey) continue;
    result.set(monthKey, {
      totalCustomers: int(row[1]),
      newCustomers: int(row[2]),
      repeatCustomers: int(row[3]),
      repeatRate: num(row[4]),
      // churnRate: not stored
    });
  }
  return result;
}

/**
 * Sheet: Funnel (GA4)
 * Yapı: Satır başına ay, sütunlar: ay | oturum | ürünGörüntüleme | sepeteEkleme | checkout | satınAlma | sepetTerk | checkoutTerk
 */
function parseFunnel(ws: XLSX.WorkSheet): Map<string, any> {
  const rows = sheetToRows(ws);
  const result = new Map<string, any>();
  if (rows.length < 2) return result;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const monthKey = parseMonthKey(row[0]);
    if (!monthKey) continue;
    result.set(monthKey, {
      sessions: int(row[1]),
      productViews: int(row[2]),
      addToCart: int(row[3]),
      checkout: int(row[4]),
      purchase: int(row[5]),
      // col 6,7,8 = oranlar (türetilmiş, saklanmaz)
      cartAbandon: int(row[9]),
      checkoutAbandon: int(row[10]),
    });
  }
  return result;
}

/**
 * Sheet: Kanal Performansı
 * Yapı: 1. sütun ay etiketi, 2+ sütunlar kanal grubu.
 * Muhtemel yapı: ay | kanal | harcama | brütSatış | sipariş | ROAS
 * ya da blok halinde (her ay = birden fazla kanal satırı)
 */
function parseKanalPerf(ws: XLSX.WorkSheet): Map<string, any[]> {
  const rows = sheetToRows(ws);
  const result = new Map<string, any[]>();
  if (rows.length < 2) return result;

  const hdr = headerMap(rows[0]);
  const kanalCol = col(hdr, "kanal", "channel");
  const spendCol = col(hdr, "harcama", "spend");
  const salesCol = col(hdr, "brüt satış", "gross", "satış");
  const orderCol = col(hdr, "sipariş", "order");
  const roasCol = col(hdr, "roas");

  // Kanal satırlarında ay sütunu tekrar eder (her ay birden fazla kanal)
  let currentMonth: string | null = null;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    // İlk sütunda ay etiketi varsa güncelle
    const maybeMonth = parseMonthKey(row[0]);
    if (maybeMonth) currentMonth = maybeMonth;
    if (!currentMonth) continue;

    // Kanal adı
    const kanalIdx = kanalCol >= 0 ? kanalCol : 1;
    const kanalName = str(row[kanalIdx]);
    if (!kanalName) continue;

    // Sayısal değerler (başlık bulunamadıysa pozisyona göre tahmin)
    const spend = num(row[spendCol >= 0 ? spendCol : 2]);
    const grossSales = num(row[salesCol >= 0 ? salesCol : 3]);
    const orderCount = int(row[orderCol >= 0 ? orderCol : 4]);
    const roas = num(row[roasCol >= 0 ? roasCol : 5]);

    if (!result.has(currentMonth)) result.set(currentMonth, []);
    result.get(currentMonth)!.push({ channel: kanalName, spend, grossSales, orderCount, roas });
  }
  return result;
}

/**
 * Sheet: Sosyal Medya Takibi
 * Gerçek yapı: blok halinde. Her bloğun ilk satırı ay adı (A0) + sütun başlıkları (B-E).
 * Sonraki 4 satır platform verileri: İNSTAGRAM | FACEBOOK | Linkedln | YOUTUBE
 * Sütunlar: A=platform | B=takipçi | C=kazanılan | D=görüntülenme | E=etkileşim
 */
function parseSosyalMedya(ws: XLSX.WorkSheet): Map<string, any[]> {
  const rows = sheetToRows(ws);
  const result = new Map<string, any[]>();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const cellA = str(row[0]);
    if (!cellA) continue;

    // Başlık satırı: A sütununda ay adı var, B sütununda "TOPLAM TAKİPÇİ" var
    const cellB = str(row[1]);
    const isHeaderRow = cellB && cellB.toLocaleLowerCase("tr-TR").includes("takipçi");
    if (!isHeaderRow) continue;

    const monthKey = parseMonthKey(cellA);
    if (!monthKey) continue;

    // Sonraki satırlar: platform verileri (boş satıra veya başka bloğa kadar)
    const platforms: any[] = [];
    for (let j = i + 1; j < rows.length && j <= i + 6; j++) {
      const prow = rows[j];
      const platName = str(prow[0]);
      if (!platName) continue;
      // Platform adı mı? (İNSTAGRAM, FACEBOOK, Linkedln, YOUTUBE vb.)
      if (KNOWN_PLATFORMS.has(platName.toLocaleLowerCase("tr-TR"))) {
        platforms.push({
          platform: platName,
          followers: int(prow[1]),
          gained: int(prow[2]),
          views: int(prow[3]),
          engagement: str(prow[4]),
        });
      }
    }
    if (platforms.length > 0) result.set(monthKey, platforms);
  }
  return result;
}

// ─── Kampanya içe aktarımı (REKLAM PLANLAMASI/*.xlsx) ────────────────────────

const AY_MAP: Record<string, string> = {
  ocak: "01", şubat: "02", subat: "02", mart: "03", nisan: "04",
  "mayıs": "05", mayis: "05", haziran: "06", temmuz: "07",
  "ağustos": "08", agustos: "08", "eylül": "09", eylul: "09",
  ekim: "10", "kasım": "11", kasim: "11", "aralık": "12", aralik: "12",
};

function categoryFromHeader(header: string): string {
  const h = header.toLocaleLowerCase("tr-TR");
  if (h.includes("satış") || h.includes("satis")) return "SALES_META";
  if (h.includes("bilinirlik")) return "AWARENESS_META";
  if (h.includes("google")) return "GOOGLE";
  return "OTHER";
}

async function importCampaigns() {
  const dir = path.join(ROOT, "REKLAM PLANLAMASI");
  if (!fs.existsSync(dir)) {
    console.log("⚠ REKLAM PLANLAMASI klasörü yok, kampanya içe aktarımı atlandı.");
    return;
  }
  const files = fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith(".xlsx"));
  let total = 0;

  for (const fileName of files) {
    const lower = fileName.toLocaleLowerCase("tr-TR");
    const ayKey = Object.keys(AY_MAP).find((k) => lower.includes(k));
    if (!ayKey) {
      console.log(`  ↷ Ay bulunamadı, atlandı: ${fileName}`);
      continue;
    }
    const month = `2026-${AY_MAP[ayKey]}`;
    const wb = XLSX.readFile(path.join(dir, fileName));
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = sheetToRows(ws);

    await prisma.campaign.deleteMany({ where: { periodMonth: month } });

    let currentCategory = "OTHER";
    let count = 0;
    for (const row of rows) {
      const nonNull = row.filter((c) => c !== null && String(c).trim() !== "");
      if (nonNull.length === 1 && typeof nonNull[0] === "string") {
        const h = nonNull[0] as string;
        if (h.toLocaleLowerCase("tr-TR").includes("reklam") || h.toLocaleLowerCase("tr-TR").includes("google")) {
          currentCategory = categoryFromHeader(h);
        }
        continue;
      }
      const first = String(row[0] ?? "").toLocaleLowerCase("tr-TR").trim();
      if (first === "no") continue;
      const hasContent = row.slice(1, 12).some((c) => c !== null && String(c).trim() !== "");
      if (!hasContent) continue;

      await prisma.campaign.create({
        data: {
          periodMonth: month,
          category: currentCategory,
          no: str(row[0]),
          duration: str(row[1]),
          format: str(row[2]),
          creativeText: str(row[3]),
          description: str(row[4]),
          objective: str(row[5]),
          targetUrl: str(row[6]),
          targetCities: str(row[7]),
          targetAudience: str(row[8]),
          targetingCriteria: str(row[9]),
          trackingPlan: str(row[10]),
          budget: num(row[11]),
        },
      });
      count++;
      total++;
    }
    console.log(`  ✓ ${fileName} → ${month}: ${count} kampanya`);
  }
  console.log(`Toplam ${total} kampanya içe aktarıldı.`);
}

// ─── Ana fonksiyon ────────────────────────────────────────────────────────────

async function main() {
  const finalFile = path.join(ROOT, "MezzeMarin_Tam_Kontrol_Paneli_FINAL.xlsx");

  if (!fs.existsSync(finalFile)) {
    console.error(`HATA: Dosya bulunamadı: ${finalFile}`);
    process.exit(1);
  }

  console.log("MezzeMarin_Tam_Kontrol_Paneli_FINAL.xlsx okunuyor…\n");
  const wb = XLSX.readFile(finalFile);

  console.log("Sheetler:", wb.SheetNames.join(", "));

  // Sheet adlarını bul (kısmi eşleşme)
  function findSheet(keyword: string): XLSX.WorkSheet | null {
    const name = wb.SheetNames.find((n) =>
      n.toLocaleLowerCase("tr-TR").includes(keyword.toLocaleLowerCase("tr-TR"))
    );
    return name ? wb.Sheets[name] : null;
  }

  const ozet = findSheet("özet") ?? findSheet("ozet");
  const urun = findSheet("ürün") ?? findSheet("urun");
  const musteri = findSheet("müşteri") ?? findSheet("musteri");
  const funnel = findSheet("funnel");
  const kanal = findSheet("kanal");
  const sosyal = findSheet("sosyal");

  const ozets = ozet ? parseAylikOzet(ozet) : new Map();
  const uruns = urun ? parseUrunPerf(urun) : new Map();
  const musteris = musteri ? parseMusteriKPI(musteri) : new Map();
  const funnels = funnel ? parseFunnel(funnel) : new Map();
  const kanals = kanal ? parseKanalPerf(kanal) : new Map();
  const sosyals = sosyal ? parseSosyalMedya(sosyal) : new Map();

  // Tüm ay anahtarlarını topla
  const allMonths = new Set<string>([
    ...ozets.keys(), ...uruns.keys(), ...musteris.keys(),
    ...funnels.keys(), ...kanals.keys(), ...sosyals.keys(),
  ]);

  console.log(`\nBulunan aylar: ${[...allMonths].sort().join(", ")}`);
  console.log(`Toplam ${allMonths.size} ay işlenecek.\n`);

  for (const month of [...allMonths].sort()) {
    const year = parseInt(month.split("-")[0], 10);
    const label = monthLabelTR(month);

    // Upsert MonthlyEntry
    const entry = await prisma.monthlyEntry.upsert({
      where: { month },
      create: { month, label, year },
      update: { label, year },
    });

    const summary = ozets.get(month);
    const product = uruns.get(month);
    const customer = musteris.get(month);
    const funnelData = funnels.get(month);
    const channels = kanals.get(month);
    const socials = sosyals.get(month);

    await Promise.all([
      summary
        ? prisma.monthlySummary.upsert({
            where: { entryId: entry.id },
            create: { entryId: entry.id, ...summary },
            update: summary,
          })
        : Promise.resolve(),

      product
        ? prisma.productPerf.upsert({
            where: { entryId: entry.id },
            create: { entryId: entry.id, ...product },
            update: product,
          })
        : Promise.resolve(),

      customer
        ? prisma.customerKPI.upsert({
            where: { entryId: entry.id },
            create: { entryId: entry.id, ...customer },
            update: customer,
          })
        : Promise.resolve(),

      funnelData
        ? prisma.funnel.upsert({
            where: { entryId: entry.id },
            create: { entryId: entry.id, ...funnelData },
            update: funnelData,
          })
        : Promise.resolve(),
    ]);

    if (channels && channels.length > 0) {
      await prisma.channelPerf.deleteMany({ where: { entryId: entry.id } });
      await prisma.channelPerf.createMany({
        data: channels.map((c: any) => ({ entryId: entry.id, ...c })),
      });
    }

    if (socials && socials.length > 0) {
      await prisma.socialMedia.deleteMany({ where: { entryId: entry.id } });
      await prisma.socialMedia.createMany({
        data: socials.map((s: any) => ({ entryId: entry.id, ...s })),
      });
    }

    const parts = [
      summary ? `özet(ikas=${summary.ikasGross ?? "-"})` : null,
      product ? `ürün(${product.productsSold ?? "-"} adet)` : null,
      customer ? `müşteri(toplam=${customer.totalCustomers ?? "-"})` : null,
      funnelData ? `funnel(oturum=${funnelData.sessions ?? "-"})` : null,
      channels ? `${channels.length} kanal` : null,
      socials ? `${socials.length} sosyal` : null,
    ].filter(Boolean);

    console.log(`  ✓ ${label} (${month}) — ${parts.join(", ")}`);
  }

  console.log("\nKampanyalar içe aktarılıyor…");
  await importCampaigns();

  console.log("\nBitti. `npm run build && npm start` ile sunucuyu başlatın.");
}

main()
  .catch((e) => {
    console.error("Hata:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
