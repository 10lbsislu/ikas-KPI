/**
 * Türkçe sayı/para formatlama ve esnek girdi ayrıştırma yardımcıları.
 * Excel'deki format kaosunu (₺ simgesi, "12.030,99", "143\xa0", boşluk) çözer.
 */

/**
 * Türkçe biçimli (veya karışık) bir metni ham sayıya çevirir.
 * Örnekler:
 *   "₺ 65,680,635"   -> 65680635   (binlik virgül, US biçimi)
 *   "12.030,99"      -> 12030.99   (TR biçimi: nokta binlik, virgül ondalık)
 *   "5,72"           -> 5.72
 *   "143\xa0"        -> 143
 *   1234             -> 1234
 * Boş/geçersiz girdi için null döner.
 */
export function parseTrNumber(input: unknown): number | null {
  if (input === null || input === undefined) return null;
  if (typeof input === "number") return Number.isFinite(input) ? input : null;

  let s = String(input).trim();
  if (s === "") return null;

  // Para birimi simgeleri, normal-olmayan boşluklar ve harfleri temizle
  s = s
    .replace(/[₺$€£]/g, "")
    .replace(/ /g, "")
    .replace(/\s/g, "")
    .replace(/[a-zA-ZçğıöşüÇĞİÖŞÜ]/g, "");

  if (s === "") return null;

  const hasComma = s.includes(",");
  const hasDot = s.includes(".");

  if (hasComma && hasDot) {
    // Hangisi sonda ise o ondalık ayraçtır.
    if (s.lastIndexOf(",") > s.lastIndexOf(".")) {
      // TR biçimi: nokta binlik, virgül ondalık -> "12.030,99"
      s = s.replace(/\./g, "").replace(",", ".");
    } else {
      // US biçimi: virgül binlik, nokta ondalık -> "65,680,635.00"
      s = s.replace(/,/g, "");
    }
  } else if (hasComma) {
    const commaCount = (s.match(/,/g) || []).length;
    const lastComma = s.lastIndexOf(",");
    const decimals = s.length - lastComma - 1;
    if (commaCount > 1 || decimals === 3) {
      // Birden çok virgül ya da 3 haneli grup -> binlik ayraç: "65,680,635"
      s = s.replace(/,/g, "");
    } else {
      // Tek virgül, ondalık ayraç: "5,72" -> "5.72"
      s = s.replace(",", ".");
    }
  } else if (hasDot) {
    const dotCount = (s.match(/\./g) || []).length;
    const lastDot = s.lastIndexOf(".");
    const decimals = s.length - lastDot - 1;
    if (dotCount > 1 || decimals === 3) {
      // Birden çok nokta ya da 3 haneli grup -> TR binlik ayraç: "65.680.635"
      s = s.replace(/\./g, "");
    }
    // Aksi halde standart ondalık nokta -> olduğu gibi bırak
  }

  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

const tl = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 2,
});

const num = new Intl.NumberFormat("tr-TR", {
  maximumFractionDigits: 2,
});

/** 65680635 -> "₺65.680.635,00" */
export function formatTL(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  return tl.format(value);
}

/** Kısa para: 65680635 -> "₺65,7 Mn" gibi (kartlarda yer tasarrufu) */
export function formatTLShort(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `₺${num.format(value / 1_000_000_000)} Mr`;
  if (abs >= 1_000_000) return `₺${num.format(value / 1_000_000)} Mn`;
  if (abs >= 1_000) return `₺${num.format(value / 1_000)} B`;
  return formatTL(value);
}

/** 0.75 (oran) veya 75 (zaten %) -> "75%" — değer 0-1 arası ise 100 ile çarpar */
export function formatPercent(
  value: number | null | undefined,
  alreadyPercent = true,
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  const v = alreadyPercent ? value : value * 100;
  return `%${num.format(v)}`;
}

/** 12345 -> "12.345" */
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  return num.format(value);
}

/** ROAS gibi katsayılar: 2.91 -> "2,91x" */
export function formatRatio(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  return `${num.format(value)}x`;
}
