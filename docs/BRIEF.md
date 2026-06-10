# yapp — Devam Brief'i (2026-06-10)

> Bu dosya: bugüne kadar yapılanların TAM özeti + mantığı + yeni gelen 14 değişiklik +
> kararlar + uygulama planı. Yeni bir oturum/kişi buradan devam edebilir.

---

## 1. yapp nedir (mantık)

İşletmeler için **App Store / Play Store + Steam** karması. **Tek native uygulama** (yapp,
TestFlight'ta) bir **kabuk**. İçinde binlerce işletme kendi "app"ini kurar. İşletme app'i
**native değil** → **veri (config) + modüller**. Yani 100 ayrı app derlemiyoruz; **bir
süper-app + modül motoru** var. Müşteri vitrinden işletme app'i indirir/kullanır.

İki taraf:
- **Kullanıcı (müşteri):** basit kayıt, app indir/kullan. Satıcı menüsünü GÖRMEZ.
- **Satıcı (işletme/dev):** ayrı **başvuru** ile olur (manuel onay). App kurar, modül seçer,
  yayınlar. Yayınlayınca **kullanım-bazlı** ücret öder (abonelik yok).

---

## 2. Bugüne kadar yapıldı (M0)

### Backend (`~/yapp-backend`, Hetzner `/opt/yapp-backend`, pm2 "yapp" :4000)
- Multi-tenant Postgres (`yapp` db, `yapp` rolü — formlab'dan ayrı). 7 tablo:
  app_users, sectors, templates, businesses, business_staff, app_config, user_apps, push_tokens.
- Auth: Apple + Google (id-token doğrulama) + `/auth/dev` (DEV_LOGIN=true, şifresiz test girişi).
- İşletme CRUD + onboarding, app_config (modules_enabled + landing_blocks), vitrin (keşfet/ara/
  sektör), indir/kaldır. 15 sektör + 15 şablon seed.
- **Canlı:** `https://167-233-44-62.sslip.io/yapp` (nginx `/yapp/` → :4000, formlab cert).
- ⚠️ prod'da DEV_LOGIN=true açık — gerçek lansman öncesi KAPAT.

### App (`~/yapp`, Expo SDK 56, Expo Router)
- Sekmeler: Vitrin / App'lerim / İşletmem / Profil. Login (dev). Onboarding sihirbazı
  (sektör→şablon→bilgi). İşletme yönetimi (modül aç/kapa, yayınla). Runtime `run/[slug]`
  (config'ten render: landing blokları + modül kartları — modüller "yapım aşamasında" stub).
- TestFlight: **build 4 (v1.0.0) VALID**. bundle `com.yapp.builder`, ASC app id 6778594032
  (ASC adı şu an "yapp (80c152)" — eas otomatik benzersizleştirdi, lansman öncesi düzelt).

### Mimari kararlar (kilitli)
- Ödeme (müşteri→işletme): sadece **fiziksel hizmet** → Stripe/iyzico, Apple IAP yok.
- Para: dev **kendi** geçidini bağlar, biz dokunmayız (rehber: `DEV_ODEME_REHBERI.md`).
- Backend: Hetzner + Express + Postgres.
- Tam modül/şablon tasarımı: `PLATFORM.md` (16 modül, 15 şablon).

---

## 3. YENİ GELEN 14 DEĞİŞİKLİK (2026-06-10, bu turda yapılacak)

| # | İstek | Yorum/karar |
|---|---|---|
| 1 | Emojileri TAMAMEN sil → modern 2D ikonlar | **@expo/vector-icons (Ionicons)**. Sektör/modül/sekme/aksiyon hepsi ikon. Tutarlı boyut/şekil. |
| 2 | Terms & Conditions, çok ayrıntılı, hukuken koruyucu, EN+TR | Girişte **zorunlu onay** (checkbox). Hem platformu (bizi) hem app'i yapan satıcıyı korur. ⚠️ Avukat değilim → taslak; lansman öncesi avukat onayı şart. |
| 3 | Her sayfaya geri tuşu (iPhone 8'de donanım geri yok) | Tüm non-tab ekranlara görünür ‹ Geri. |
| 4 | Profil bomboş → doldur | Kullanıcı bilgisi + İşletme başvurusu girişi + terms + ödeme rehberi + ayarlar + çıkış. |
| 5 | Özellik menüsünde özelliğe basınca **ne yaptığının ayrıntılı özeti** çıksın (tüm özellikler) | Onboarding + yönetimde modüle dokun → detay modalı (açıklama, örnek kullanım). |
| 6 | İşletmem sekmesini **Profile taşı**, ayrı **başvuru** gereksin | Sekme 4→3 (Vitrin/App'lerim/Profil). Satıcı paneli profil içinde, sadece **onaylı satıcıda** görünür. |
| 7 | Başvuru: Apple dev hesabı açarken sorulan her şeyi sor, bizi+yapanı korusun | Yasal ad, işletme tipi, TCKN/vergi no, adres, telefon, IBAN(sonra), sözleşme onayı vb. **Manuel onay** (admin=sen). |
| 8 | "+ Yeni" tuşu sadece **ilk app yüklendikten sonra** çıksın | İlk işletme empty-state CTA ile; sonra +Yeni. |
| 9 | Yayınla → **hesap/ücret** göstersin. Abonelik YOK. **Ne kullanırsa onu öder.** | Saf **kullanım-bazlı** fiyat. Yayınlarken tahmini aylık ücret + onay. |
| 10 | Fiyatı **algoritma** ile tahmin et (kullanılan araçlara göre) | Modül puanı + tahmini kullanım (MAU/push/medya) çarpanları → aylık TL tahmini. |
| 11 | Vitrinde **app sekmesi/mağaza sayfası** (Play Store gibi): ekran görüntüleri, açıklama, isim, indir/sil | Yeni **mağaza detay** ekranı. Dev panelden **görsel yükleme** (backend eklenecek). Run ekranındaki alt indir-bar yerine bu sayfa. |
| 12 | Ödeme bağlama rehberi app içinde görünmüyor | Satıcı panelinde **Ödeme Ayarları → Rehber** ekranı (DEV_ODEME_REHBERI içeriği). |
| 13 | Sıra sıra save alarak yap, 5'te bir onay iste | ~5 checkpoint, her birinde dur+onay. |
| 14 | Her şeyi not al, derin düşün, brief hazırla | Bu dosya. |

### Fiyat algoritması taslağı (kullanım-bazlı, #9-10)
```
aylik_tahmin = Σ(modul_taban) + kullanim_bileseni
  modul_taban: her açık modülün aylık baz maliyeti (ör. booking 150, payments 200,
               push 100, records 250, tracker 150, ... ağır modül = yüksek)
  kullanim_bileseni:
     + push_adedi/1000 * 20 TL
     + medya_GB * 30 TL
     + aktif_musteri(MAU) * 2 TL
  başlangıç tahmini: işletme MAU/push girmeden, şablona göre varsayılan beklenti.
```
Yayınlarken "tahmini ~X TL/ay, sadece kullandığın kadar" gösterilir. Gerçek fatura aylık
kullanımdan hesaplanır (ileride metering). **PLATFORM.md'deki 4-katmanlı abonelik İPTAL.**

---

## 4. Uygulama planı (5 checkpoint — her birinde onay)

- **CP1 — Görsel temel:** @expo/vector-icons entegre, tüm emoji→ikon (sektör/modül/sekme/
  aksiyon ikon haritası), her ekrana geri tuşu. → onay
- **CP2 — Hukuk:** Terms (EN+TR) ekran + içerik; girişte zorunlu onay. → onay
- **CP3 — Navigasyon:** İşletmem sekmesi kalkar (3 sekme). Profil dolu + **satıcı başvurusu**
  (detaylı yasal form, manuel onay backend). Satıcı paneli profil içinde. → onay
- **CP4 — Mağaza & özellik detayı:** Play-Store tarzı mağaza detay sayfası (görsel yükleme
  backend + dev upload UI), "+Yeni ilk app sonrası", modül detay modalları. → onay
- **CP5 — Fiyat & ödeme:** kullanım-bazlı fiyat algoritması (backend), yayınla akışı (hesap+
  ücret onayı), ödeme bağlama rehberi ekranı. → onay

### Backend eklenecekler
- app_users: terms_accepted_at, seller_status(none/pending/approved/rejected), seller_profile(jsonb).
- yeni tablo: seller_applications (yasal ad, tip, tckn/vergi, adres, telefon, iban, belgeler).
- businesses: promo_images(jsonb), pricing_estimate(jsonb).
- endpoint: POST /seller/apply, GET /seller/status, admin onay; POST /businesses/:id/images
  (multer upload); GET /businesses/:id/price-estimate.

### Yasal uyarı
Terms/başvuru metinleri kapsamlı taslaktır; **avukat değilim**. Gerçek lansman öncesi bir
avukata (Türkiye + hedef pazar) inceletilmeli. KVKK/GDPR, mesafeli satış, aracılık hizmeti
sözleşmesi, sorumluluk reddi dahil.
