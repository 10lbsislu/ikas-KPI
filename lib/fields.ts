export type FieldDef = {
  name: string;
  label: string;
  unit: string;
  hint?: string;
};

export type TabDef = {
  key: "summary" | "product" | "customer" | "funnel" | "channels" | "socials";
  title: string;
  icon: string;
  fields: FieldDef[];
};

export const ENTRY_TABS: TabDef[] = [
  {
    key: "summary",
    title: "Aylık Özet",
    icon: "💰",
    fields: [
      { name: "ikasGross", label: "İKAS Brüt Satış (Gerçek Ciro)", unit: "TL", hint: "Ana ciro kaynağı" },
      { name: "cancelled", label: "İptal Tutarı", unit: "TL" },
      { name: "returned", label: "İade Tutarı", unit: "TL" },
      { name: "netSales", label: "İadeler Sonrası Toplam Satış", unit: "TL", hint: "Boş bırakırsanız: İKAS Brüt − İptal − İade" },
      { name: "orderCount", label: "Toplam Sipariş Sayısı", unit: "Adet" },
      { name: "aov", label: "Ortalama Sepet Tutarı (AOV)", unit: "TL", hint: "Boş bırakırsanız: Net Satış / Sipariş" },
      { name: "adSpend", label: "Toplam Reklam Harcaması", unit: "TL" },
      { name: "netRoas", label: "Net ROAS", unit: "x", hint: "Boş bırakırsanız: Net Satış / Reklam" },
    ],
  },
  {
    key: "product",
    title: "Ürün Performansı",
    icon: "📦",
    fields: [
      { name: "orderCount", label: "Sipariş Sayısı", unit: "Adet" },
      { name: "productsSold", label: "Satılan Ürün Adedi", unit: "Adet" },
      { name: "productsPerOrder", label: "Fatura Başına Düşen Ürün", unit: "Adet", hint: "Boş bırakırsanız: Ürün / Sipariş" },
      { name: "topProduct", label: "En Çok Satan Ürün", unit: "" },
    ],
  },
  {
    key: "customer",
    title: "Müşteri KPI",
    icon: "👥",
    fields: [
      { name: "totalCustomers", label: "Toplam Müşteri", unit: "Kişi" },
      { name: "newCustomers", label: "Yeni Müşteri", unit: "Kişi" },
      { name: "repeatCustomers", label: "Tekrar Müşteri", unit: "Kişi" },
      { name: "repeatRate", label: "Tekrar Oranı", unit: "%", hint: "Boş bırakırsanız: Tekrar / Toplam — Churn otomatik hesaplanır" },
      // churnRate buraya EKLENMEDİ — sistem 1−tekrarOranı olarak hesaplar
    ],
  },
  {
    key: "funnel",
    title: "Funnel (GA4)",
    icon: "🔻",
    fields: [
      { name: "sessions", label: "Oturum", unit: "Adet" },
      { name: "productViews", label: "Ürün Görüntüleme", unit: "Adet" },
      { name: "addToCart", label: "Sepete Ekleme", unit: "Adet" },
      { name: "checkout", label: "Checkout", unit: "Adet" },
      { name: "purchase", label: "Satın Alma", unit: "Adet" },
      { name: "cartAbandon", label: "Sepet Terk", unit: "Adet" },
      { name: "checkoutAbandon", label: "Checkout Terk", unit: "Adet" },
    ],
  },
];

// Kanal ve Sosyal Medya sekmeleri dynamic (çok satır), ayrı bileşenlerle yönetilir
export const CHANNEL_OPTIONS = [
  "Google Ads",
  "Meta (Sales)",
  "Meta (Awareness)",
  "Organic",
  "Email",
  "Diğer",
];

export const SOCIAL_PLATFORMS = [
  "İNSTAGRAM",
  "FACEBOOK",
  "Linkedln",
  "YOUTUBE",
];
