# PAKYÜREK KPI Panosu (mezzeMarin)

Excel’in karmaşasından kurtaran, **kolay form tabanlı veri girişi** ve
**otomatik hesaplanan KPI grafikleri** sunan web panosu. Ofis ağında bir
bilgisayarda çalışır, diğer kullanıcılar tarayıcıdan bağlanır.

## Ne yapar?

- **Genel Bakış** — Toplam ciro, brüt kâr & marj, online satış, ROAS, yeni
  müşteri gibi özet kartları; her birinde önceki döneme göre **% değişim**.
  Altında ciro, marj, ROAS ve müşteri trend grafikleri. Aylık / 2 haftalık filtresi.
- **Veri Girişi** — Dönem seç (veya yeni oluştur), sekmeli formda değerleri gir,
  tek tıkla kaydet. Türkçe sayı yazımı desteklenir (ör. `12.030,99`, `2.500.000`).
  Boş bıraktığın bazı alanlar (AOV, CPA, ROAS) otomatik hesaplanır.
- **Kampanyalar** — Aylık reklam planları kategori kategori (Satış/Meta,
  Bilinirlik/Meta, Google). Ay bazında toplam bütçe otomatik. “Önceki aydan
  kopyala” ile tekrar eden planları çoğalt.

---

## İlk Kurulum (tek seferlik — teknik kişi yapar)

Gereken: [Node.js 18+](https://nodejs.org) yüklü olmalı.

```bash
npm install                          # bağımlılıkları kur
npx prisma migrate deploy            # veritabanını oluştur (data/kpi.db)
npm run import                       # mevcut Excel verisini içe aktar (opsiyonel)
npm run build                        # üretim sürümünü derle
```

> **Not (Windows + OneDrive):** Klasör OneDrive içindeyse `prisma generate`
> bazen dosya kilidiyle çakışabilir. Çalışan tüm Node pencerelerini kapatıp
> komutu tekrar deneyin. `build` adımı `prisma generate` gerektirmez.

## Çalıştırma (her gün)

En kolay yol: **`baslat.bat`** dosyasına çift tıkla. Sunucu açılır.

Veya terminalden:
```bash
npm start          # http://0.0.0.0:3000 üzerinde yayına başlar
```

### Diğer ofis kullanıcıları nasıl bağlanır?

1. Sunucunun çalıştığı bilgisayarın yerel IP’sini öğren (CMD’de `ipconfig` →
   “IPv4 Adresi”, ör. `192.168.1.25`).
2. Diğer bilgisayarlardan tarayıcıya: **`http://192.168.1.25:3000`**
3. İlk seferde Windows Güvenlik Duvarı sorabilir → “Erişime izin ver”.

---

## Yedekleme

Tüm veri tek dosyada: **`data/kpi.db`**. Bu dosyayı kopyalamak = tam yedek.
Düzenli olarak güvenli bir yere kopyalayın.

## Mevcut Excel verisini yeniden aktarma

`npm run import` komutu `KPI.xlsx` (Ocak 2026) ve `REKLAM PLANLAMASI/*.xlsx`
(kampanyalar) dosyalarını okur. Tekrar çalıştırmak güvenlidir; aynı dönem/ay
üzerine yazar (idempotent).

---

## Teknik özet

| Katman | Teknoloji |
|--------|-----------|
| Arayüz | Next.js 14 (App Router) + React + Tailwind |
| Grafik | Recharts |
| Veritabanı | SQLite + Prisma ORM (`data/kpi.db`) |
| Doğrulama | Zod (Türkçe sayı ayrıştırma `lib/format.ts`) |

Önemli dosyalar:
- `lib/format.ts` — Türkçe sayı/para ayrıştırma ve biçimleme
- `lib/kpi.ts` — türetilmiş metrikler (AOV, CPA, ROAS) ve % değişim
- `lib/fields.ts` — form alanlarının merkezi tanımı
- `prisma/schema.prisma` — veri modeli
- `scripts/import-excel.ts` — Excel içe aktarma

## Sonraki adımlar (isteğe bağlı)

- Basit şifre/giriş ekranı
- Hedef (target) girişi ve hedef-gerçekleşme göstergeleri
- PDF / Excel’e dışa aktarma
- Buluta taşıma (Prisma ile Postgres’e geçiş kolaydır)
