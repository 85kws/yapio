# yapp Platform — Tasarım Dokümanı (v0, 2026-06-10)

> Vizyon: İşletmeler için **Steam / App Store**. Tek native uygulama (yapp) içinde
> binlerce işletme kendi "app"ini kurar. Müşteriler vitrinden indirir/kullanır.
> Her app = **native değil** → **veri (config) + açık modüller**. Biz 100 app derlemeyiz;
> **bir süper-app + güçlü modül motoru** yaparız.

## Kararlar (kilitli)
- **Ödeme:** Sadece fiziksel hizmet (randevu, üyelik, seans). Stripe/iyzico → **Apple kesintisi YOK**. Dijital içerik satışı YOK (IAP'tan kaçınmak için).
- **Para akışı:** Dev kendi Stripe/iyzico hesabını bağlar. **Biz paraya dokunmayız** (lisans/MASAK riski yok).
- **Backend:** Hetzner + Express + PostgreSQL (multi-tenant, `business_id` her yerde).
- **v1 kapsam:** 10+ sektör derinlemesine şablon (aşağıda 15 var).
- **Dev ücreti:** App "boyutuna" göre (MAU, push hacmi, medya tipi, modül seti) → **web panelden** B2B tahsilat (IAP değil). Ödeyince app vitrinde aktif.

---

## 1. Modül Kataloğu (primitifler)

Her modül = backend mantığı + RN UI bileşeni + config şeması. Şablonlar bunları birleştirir.

| # | Modül | Ne yapar | Kullanan dikeyler |
|---|---|---|---|
| M1 | **Booking/Randevu** | personel, hizmet, süre, müsaitlik, slot, çakışma kontrolü, hatırlatma | kuaför, diyetisyen, hoca, klinik, oto, vet |
| M2 | **Catalog/Menü** | kategori, ürün, fiyat, foto, varyant | restoran, kafe, market |
| M3 | **Ordering/Sipariş** | sepet, sipariş, durum (gel-al / masa QR) — sadece fiziksel | restoran, kafe |
| M4 | **Campaigns/Kampanya** | indirim kodu, banner, toplu push | hepsi |
| M5 | **Loyalty/Sadakat** | puan, damga kartı, ödül | kafe, restoran, kuaför, oto |
| M6 | **Subscriptions/Üyelik** | aylık plan, durum, QR check-in | spor, pilates, oto yıkama |
| M7 | **Payments/Ödeme** | dev'in geçidi (Stripe/iyzico connect), ödeme kaydı, taksit takibi | hepsi |
| M8 | **Records/Ölçüm** | özel veri kayıtları + dosya (PDF/PNG/video) yükleme | diyetisyen, estetik, vet, fizyo |
| M9 | **Plans/Program** | yapılandırılmış plan içeriği (diyet listesi, antrenman) | diyetisyen, PT |
| M10 | **Tracker/Takip** | adım, kalori, su (cihaz sensörü/pedometre) | spor, diyet |
| M11 | **Messaging/Duyuru** | tek yön duyuru + (ops.) çift yön mesaj | hepsi |
| M12 | **Push** | token yönetimi, zamanlı (randevu hatırlatma) + tetikli (kampanya) | hepsi |
| M13 | **Gallery/Portföy** | görsel vitrin, öncesi/sonrası | dövme, foto, kuaför |
| M14 | **Profile/Konum** | adres, saatler, iletişim, harita/yol tarifi | hepsi |
| M15 | **Reviews/Yorum** | müşteri puan + yorum | hepsi |
| M16 | **Staff/Ekip** | çoklu personel, roller (admin/operatör) | orta+ işletmeler |

---

## 2. Sektör Şablonları (15 derin)

Her şablon = modül seti + örnek içerik + tema + roller. "Yüzlerce" uzun kuyruk; modüller sağlamsa şablon türetmek ucuz.

| # | Şablon | Modüller |
|---|---|---|
| T1 | **Berber / Erkek Kuaför** | Booking, Gallery(öncesi/sonrası), Loyalty(10. tıraş bedava), Push, Profile, Reviews |
| T2 | **Kadın Kuaför / Güzellik Salonu** | Booking(çok hizmet/personel), Catalog(fiyat listesi), Campaigns, Loyalty, Gallery, Push, Reviews |
| T3 | **Güzellik / Estetik Merkezi** (FormLab tipi) | Booking, Records(cihaz PDF), Payments(taksit), Subscriptions(seans paketi), Push, Profile |
| T4 | **Diyetisyen** | Booking, Records(Tanita PDF), Plans(diyet listesi), Payments, Tracker(su/kalori), Push |
| T5 | **Restoran** | Catalog/Menü, Ordering(masa QR/gel-al), Campaigns, Loyalty, Push, Reviews, Profile |
| T6 | **Kafe / Pastane** | Menü, Loyalty(kahve damgası), Campaigns, Push, Profile |
| T7 | **Spor Salonu / Fitness** | Subscriptions(QR check-in), Tracker(adım/kalori), Booking(class/PT), Campaigns, Push, Staff |
| T8 | **Pilates / Yoga / Dans** | Booking(kontenjanlı ders), Subscriptions(ders paketi), Push, Gallery |
| T9 | **Özel Ders / Etüt Hocası** | Booking(hocanın boş saatleri), Payments, Messaging, Push |
| T10 | **Müzik / Enstrüman Hocası** | Booking, Payments, Gallery, Push |
| T11 | **Dövme / Piercing Stüdyosu** | Booking(kapora), Gallery(portföy), Reviews, Push |
| T12 | **Veteriner / Pet Bakım** | Booking, Records(aşı kartı/takvim), Push(aşı hatırlatma), Profile |
| T13 | **Oto Yıkama / Oto Bakım** | Booking, Subscriptions(aylık paket), Loyalty, Push |
| T14 | **Fizyoterapi / Sağlık Kliniği** | Booking, Records, Payments, Push, Profile |
| T15 | **Fotoğrafçı / Etkinlik** | Booking(seans), Gallery/Portföy, Payments(kapora), Forms |

---

## 3. Multi-Tenant Veri Modeli (Postgres)

`business_id` her domain tablosunda. Rol kontrolü middleware'de.

**Platform/Kimlik**
- `app_users` — son kullanıcılar: id, name, apple_sub, google_sub, email
- `businesses` (tenant) — id, owner_user_id, name, sector, logo_url, address, geo(lat/lng), phone, hours_json, theme_json, plan_tier, status(draft/active/suspended), share_slug, created_at
- `business_staff` — business_id, user_id, role(admin/operator/assistant)
- `user_apps` (install) — user_id, business_id, installed_at  ← kullanıcının indirdiği app'ler
- `app_config` — business_id, modules_enabled[], landing_blocks_json, theme

**Modül tabloları (hepsi business_id scoped)**
- Booking: `services`, `staff_availability`, `appointments`
- Catalog: `catalog_categories`, `catalog_items`
- Ordering: `orders`, `order_items`
- Campaign: `campaigns`, `coupons`
- Loyalty: `loyalty_cards`, `loyalty_stamps`
- Subscription: `memberships`, `membership_checkins`
- Payment: `payments` (yalnız kayıt; geçit = dev'in), `payment_connections`(gateway ref)
- Records: `records`(json + file_url), `files`
- Plans: `plans`(json içerik)
- Tracker: `tracker_entries`
- Messaging: `announcements`, `messages`
- Reviews: `reviews`
- Push: `push_tokens`(user_id, device, expo_token), `notifications`

**Faturalama/Kullanım**
- `subscriptions`(business_id, tier, period_start/end)
- `usage_counters`(business_id, month, mau, push_count, storage_bytes)

**Taksonomi**
- `sectors`, `templates`(modül+örnek tanımı)

---

## 4. Fiyatlandırma (boyut bazlı, web panelden, B2B)

Metrikler: **MAU** (aktif müşteri), **push/ay**, **medya** (foto vs PDF/PNG vs video), **personel sayısı**, **açık modüller**.

| Plan | MAU | Modüller | Push/ay | Medya | Staff | Marka |
|---|---|---|---|---|---|---|
| **Başlangıç** (ücretsiz/deneme) | ≤50 | temel (Booking/Profile/Menü) | 100 | foto | 1 | yapp markası görünür |
| **Pro** | ≤500 | + Loyalty/Campaign/Payments | 5.000 | + PDF/PNG | 3 | marka kaldır |
| **Business** | ≤2.000 | + Subscription/Records/Tracker | 50.000 | + video | sınırsız | öncelik |
| **Enterprise** | üstü | hepsi + özel | özel | hepsi | sınırsız | görüşme |

Fiyat motoru aylık kullanımdan hesaplar. Ödeme web panelinde (Apple kesintisi yok). Ödenince `businesses.status=active` → app vitrinde görünür.

---

## 5. Mimari

- **Tek Expo native app (yapp)** = kabuk. Dinamik runtime herhangi bir işletme app'ini `app_config`'ten + modüllerden render eder. Her modül = `business_id` scoped API okuyan RN feature bileşeni.
- **Backend:** Express + Postgres (Hetzner). JWT auth (Sign in with Apple/Google → kendi JWT'miz). Multi-tenant `business_id` + rol.
- **Storage:** medya önce sunucu diski (`uploads/`), sonra S3/R2. PDF/PNG/video.
- **Push:** Expo Push (cihaz başı token). Zamanlı (randevu hatırlatma, cron) + tetikli (kampanya blast).
- **Dev paneli:** v1 in-app "dev modu" (onboarding sihirbazı + app kurulum) + faturalama için web panel.
- **Ödeme:** Stripe Connect / iyzico alt-üye — dev kendi hesabını bağlar; biz gateway ref saklar, paraya dokunmayız.

### Onboarding sihirbazı (dev kaydı)
Şirketin var mı / kendi işin mi → sektör → şablon mu custom mu → amaç → istenen özellikler (modül seç) → logo → konum/adres → çalışma saatleri → tema → önizleme → plan seç → öde → yayınla.

---

## 6. Faz Planı (aylar sürer — milestone'lara böl)

- **M0 — Temel:** Multi-tenant backend iskelet + auth (Apple/Google) + `businesses` + `app_config` + vitrin listesi. Kabukta config'ten app render.
- **M1 — Booking:** uçtan uca Booking (hizmet, müsaitlik, randevu, hatırlatma/push) + Profile/Map + 3 şablon (berber, diyetisyen, hoca).
- **M2 — Ticaret:** Catalog/Menü + Campaigns + Loyalty + restoran/kafe şablonları.
- **M3 — Üyelik/Sağlık:** Subscriptions + Tracker (spor/pilates) + Records + Plans (estetik/diyetisyen).
- **M4 — Para & Büyüme:** Dev onboarding sihirbazı + fiyat/faturalama + plan gating + paylaşım linki + Reviews.
- **M5 — Cila & Pilot:** TestFlight, gerçek işletme pilotu.

> Not: yapp v1 (yerel, blok tabanlı) → öğrenme prototipiydi. Block modeli **modül** mimarisine evriliyor. Repo aynı kalır, `src/modules/` + backend eklenir.
