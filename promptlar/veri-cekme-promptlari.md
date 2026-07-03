# mezzeMarin KPI Dashboard — Veri Çekme Promptları

Bu promptları Claude'un Chrome eklentisine tek tek yapıştır, çıktıyı kopyala ve bana ver.
Her prompt hangi platforma gireceğini belirtir.

---

## PROMPT 1 — Google Ads (Reklam Harcaması + Kanal Verisi)

> **Nereye gir:** Google Ads → Raporlar → Kampanyalar (ilgili ay tarih aralığı seçili)

```
Aşağıdaki Google Ads verilerini tabloya dökerek bana ver. Tarih aralığı: [AY] [YIL] (örn. 1 Haziran – 30 Haziran 2026).

İstediğim veriler:
1. Toplam harcama (TL)
2. Dönüşüm sayısı (purchase/satın alma)
3. Dönüşüm değeri (TL) — tüm kampanyalar toplamı
4. Kampanya bazında kırılım:
   - Kampanya adı
   - Harcama (TL)
   - Dönüşüm sayısı
   - Dönüşüm değeri (TL)
   - ROAS (varsa)

Çıktıyı şu formatta ver:
GOOGLE ADS ÖZET — [AY] [YIL]
Toplam Harcama: _____ TL
Toplam Dönüşüm: _____ adet
Toplam Dönüşüm Değeri: _____ TL
Google ROAS: _____x

KAMPANYALAR:
| Kampanya Adı | Harcama (TL) | Dönüşüm | Değer (TL) | ROAS |
|---|---|---|---|---|
| ... | ... | ... | ... | ... |
```

---

## PROMPT 2 — Meta Ads (Reklam Harcaması + Kanal Verisi)

> **Nereye gir:** Meta Business Suite → Reklam Yöneticisi → ilgili ay tarih aralığı seçili

```
Aşağıdaki Meta Ads verilerini tabloya dökerek bana ver. Tarih aralığı: [AY] [YIL] (örn. 1 Haziran – 30 Haziran 2026).

İstediğim veriler:
1. Toplam harcama (TL)
2. Satın alma (purchase) dönüşüm sayısı
3. Satın alma dönüşüm değeri (TL)
4. Kampanya türüne göre kırılım (Satış artırıcı / Bilinirlik):
   - Kampanya adı
   - Harcama (TL)
   - Satın alma adedi
   - Satın alma değeri (TL)
   - ROAS (varsa)

Çıktıyı şu formatta ver:
META ADS ÖZET — [AY] [YIL]
Toplam Harcama: _____ TL
Toplam Satın Alma: _____ adet
Toplam Satın Alma Değeri: _____ TL
Meta ROAS: _____x

KAMPANYALAR:
| Kampanya Adı | Tür | Harcama (TL) | Satın Alma | Değer (TL) | ROAS |
|---|---|---|---|---|---|
| ... | ... | ... | ... | ... | ... |
```

---

## PROMPT 3 — Google Analytics 4 (Funnel + Satış Verisi)

> **Nereye gir:** Google Analytics 4 → Raporlar → Para Kazanma → E-ticaret → ilgili ay tarih aralığı seçili

```
Google Analytics 4 raporlarından aşağıdaki verileri çek ve bana ver. Tarih aralığı: [AY] [YIL] (örn. 1 Haziran – 30 Haziran 2026).

İstediğim veriler:

**E-Ticaret:**
- Toplam gelir (TL) — "Total revenue" veya "Toplam gelir"
- İşlem sayısı (satın alma adedi)
- Ortalama sipariş değeri (TL)
- İade tutarı (TL) — varsa

**Kullanıcı Hunisi (Funnel):**
- Oturum sayısı (Sessions)
- Ürün görüntüleme (View item)
- Sepete ekleme (Add to cart)
- Ödeme başlatma (Begin checkout)
- Satın alma (Purchase)
- Sepet terk sayısı = Sepete ekleme − Ödeme başlatma
- Ödeme terk sayısı = Ödeme başlatma − Satın alma

**Müşteri:**
- Yeni kullanıcı sayısı
- Geri dönen kullanıcı sayısı

Çıktıyı şu formatta ver:
GA4 ÖZET — [AY] [YIL]

E-TİCARET:
Toplam Gelir: _____ TL
İşlem Sayısı: _____ adet
Ortalama Sipariş Değeri: _____ TL
İade Tutarı: _____ TL

FUNNEL:
Oturum: _____
Ürün Görüntüleme: _____
Sepete Ekleme: _____
Ödeme Başlatma: _____
Satın Alma: _____
Sepet Terk: _____
Ödeme Terk: _____

MÜŞTERİ:
Yeni Kullanıcı: _____
Geri Dönen Kullanıcı: _____
```

---

## PROMPT 4 — İKAS (Ciro + Sipariş + Müşteri)

> **Nereye gir:** İKAS Yönetim Paneli → Raporlar → Satış Raporu → ilgili ay

```
İKAS raporlarından aşağıdaki verileri çek. Tarih aralığı: [AY] [YIL] (örn. 1 Haziran – 30 Haziran 2026).

İstediğim veriler:
1. Toplam brüt satış (TL) — iptal ve iadeler dahil
2. İptal tutarı (TL)
3. İade tutarı (TL)
4. Net satış (TL) — iptal ve iadeler çıkarılmış
5. Toplam sipariş sayısı
6. Toplam müşteri sayısı (sipariş veren)
7. Yeni müşteri sayısı (ilk kez sipariş)
8. Tekrar müşteri sayısı (daha önce sipariş vermiş)
9. En çok satan ürün adı ve adedi
10. Toplam satılan ürün adedi

Çıktıyı şu formatta ver:
İKAS ÖZET — [AY] [YIL]

SATIŞ:
Brüt Satış: _____ TL
İptal Tutarı: _____ TL
İade Tutarı: _____ TL
Net Satış: _____ TL
Toplam Sipariş: _____ adet
Toplam Satılan Ürün: _____ adet
En Çok Satan: _____ (_____ adet)

MÜŞTERİ:
Toplam Müşteri: _____
Yeni Müşteri: _____
Tekrar Müşteri: _____
```

---

## PROMPT 5 — Sosyal Medya (Takipçi + Etkileşim)

> **Nereye gir:** Her platform için ayrı ayrı (Instagram, Facebook, YouTube)

```
Aşağıdaki sosyal medya verilerini [AY] [YIL] için bana ver.

Instagram:
- Toplam takipçi sayısı (ay sonu)
- Aylık yeni takipçi
- Toplam gösterim / erişim
- Etkileşim oranı (%)

Facebook:
- Toplam takipçi / sayfa beğenisi (ay sonu)
- Aylık yeni takipçi
- Toplam erişim

YouTube (varsa):
- Abone sayısı
- Toplam izlenme

Çıktıyı şu formatta ver:
SOSYAL MEDYA — [AY] [YIL]

İNSTAGRAM:
Takipçi: _____
Yeni Takipçi: _____
Gösterim: _____
Etkileşim: _____%

FACEBOOK:
Takipçi: _____
Yeni Takipçi: _____
Erişim: _____

YOUTUBE:
Abone: _____
İzlenme: _____
```

---

## Kullanım Talimatı

1. Her promptu Claude Chrome eklentisine yapıştır
2. `[AY]` ve `[YIL]` kısımlarını doldur (örn. "Haziran 2026")
3. İlgili platformun ekran görüntüsünü veya veri sayfasını Claude'a göster
4. Çıktıyı kopyala
5. Bana "Haziran 2026 verisini gir" diyerek çıktıları yapıştır — veritabanına işleyeceğim
