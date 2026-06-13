# yapp — Devam Brief'i (2026-06-10)

> Bu dosya: bugüne kadar yapılanların TAM özeti + mantığı + yeni gelen 14 değişiklik +
> kararlar + uygulama planı. Yeni bir oturum/kişi buradan devam edebilir.

---

## 0. GÜNCEL DURUM (en son — buradan oku)

### 🗓️ 2026-06-13 — BÜYÜK TUR: bug avı + booking + QR + 11 sektör + cila + crash fix + YENİ BUILD ALTYAPISI + 4 özellik

> Bu turda: ~15 bug düzeltildi (backend prod'a deploy edildi), booking tamamlandı, gerçek QR+kamera
> check-in eklendi, sektör sayısı 21→32 oldu, tüm müşteri modüllerine cila (pull-to-refresh/haptik/
> skeleton) geldi. TestFlight build 17 **açılışta crash** verdi → düzeltildi. **EAS bedava iOS kotası
> dolunca** build altyapısı **GitHub Actions**'a taşındı (artık tek komutla build). Son **4 özellik** eklendi.
> **Son başarılı TestFlight = build 20.**

#### 🏗️ BUILD ARTIK GITHUB ACTIONS İLE (EAS yerine — EN ÖNEMLİ DEĞİŞİKLİK)
- **EAS bedava iOS kotası doldu** (1 Tem 2026'da sıfırlanır). Mac yok → bulut-Mac CI şart.
- **Repo:** GitHub **`85kws/yapio`** (PUBLIC → macOS Actions bedava). `master` + `main` senkron tutuluyor.
- **Yeni build almak (TEK KOMUT):**
  ```bash
  gh workflow run ios-testflight.yml -R 85kws/yapio --ref master
  ```
  (veya GitHub → Actions → "iOS TestFlight" → Run workflow). Build no otomatik artar, IPA TestFlight'a kendi düşer.
- **Workflow** (`.github/workflows/ios-testflight.yml`): `macos-26` runner (Xcode 26 / **Swift 6.2** — RN 0.85 şart) →
  npm ci → **`eas build --local`** (EAS'in build 17'de çalışan dağıtım cert+profilini kullanır; **EAS BULUT kotası YEMEZ**) →
  **altool** ile TestFlight upload. Build no = `17 + GITHUB_RUN_NUMBER`.
- **GitHub secrets:** `EXPO_TOKEN` (yerel eas oturumundan GraphQL ile üretilen robot access token, id `227e2788-...`),
  `ASC_KEY_ID`=QJT4TH5633, `ASC_ISSUER_ID`=662f4083-..., `ASC_KEY_BASE64` (AuthKey p8'in base64'ü).
- **Neden bu mimari (5 denemede öğrenildi):** (1) saf xcodebuild `DEVELOPMENT_TEAM` ister → eklendi; (2) RN 0.85
  Swift 6.2 ister, macos-15=6.1 → `macos-26`; (3) export'ta ASC key **dağıtım sertifikası üretemiyor**
  ("Cloud signing permission error", App Manager rolü) → çözüm: `eas build --local` EAS'in hazır cert'ini kullanır;
  (4) `eas build --local` config plugin için `npm ci` ister; (5) çalıştı.
- **Alternatif:** Codemagic kurulumu da hazır (`codemagic.yaml` + `docs/CODEMAGIC.md`, 500 mac-dk/ay bedava) — UI'dan kurulur.
- **EXPO_TOKEN yenileme** (revoke olursa): yerel oturum açıkken `node` ile Expo GraphQL `createAccessToken`
  (actorID gerekir; `{ meActor { id } }` ile alınır), header `expo-session: <~/.expo/state.json auth.sessionSecret>`.

#### 🔴→🟢 CRASH FIX (build 17 açılışta ölüyordu)
- **Sebep (crash log):** `dyld: Symbol not found: ExpoModulesCore.Record.from(dictionary:appContext:)`, ExpoCamera'dan
  referans, ExpoModulesCore'da yok. **expo-camera@56.0.8, expo@56.0.9'dan daha yeni Core API istiyor.** New Arch değil.
- **Fix:** tüm expo paketleri SDK-uyumlu hizalandı: **expo 56.0.9→56.0.11**, expo-router 56.2.10, image-picker 56.0.17,
  linking 56.0.14 (`expo install --fix`). Lock tazelendi. (commit `33ab9a4`)

#### 🐛 BUG FIX'LER (backend prod'a DEPLOY EDİLDİ + frontend)
Backend değişiklikleri Hetzner `/opt/yapp-backend`'e scp + `npm run init-db` + `pm2 restart yapp` ile **canlıda**.
Rollback yedeği: `/opt/yapp-backend/.bak_20260613_134420/`. **Backend git'siz** (versiyon yok, scp ile deploy edilir).
- **Canva editör ÖLÜYDÜ:** `app_config.landing_canvas` kolonu yoktu → save/read 3 route'ta (`business.routes`,
  `storefront.routes`, `schema.sql` migration). Artık çalışıyor.
- **Booking yanlış güne düşüyordu (TR UTC+3):** `toISOString()` günü kaydırıyordu → `src/dates.js localDate()` yerel
  tarih. Aynı UTC hatası Tracker/Records/Plans/Payments'ta da düzeltildi.
- **Çift rezervasyon:** POST booking entry'de çakışma kontrolü yoktu → backend `WHERE NOT EXISTS` (yarış-güvenli) + 409.
- **Müşteri kendi kaydını değiştirebiliyordu** (loyalty damga/abonelik check-in hilesi): PUT entries'te non-staff `data`
  yazamaz, sadece iptal.
- **Özel app üyelik atlanıyordu:** `accessGate` → items/entries/slots private app'te aktif üyelik şartı.
- **Diğer:** sunucu slot tz (UTC+3 sabit) · storefront tüm satırı sızdırıyordu → whitelist (join_code yalnız sahibe) ·
  ölü `/auth/business-login` kaldırıldı · PUT items 404 · dup abonelik guard · birçok yerde i18n `t()` gölgeleme.

#### ✅ Booking tamamlandı
- **Haftalık kapalı gün:** manage'de gün chip'leri → `hours_json.closed` (JS getDay dizisi); backend slots o günü atlar.
- (Ertelendi: personel-bazlı takvim — ürün kararı gerek.)

#### 📷 Gerçek QR + kamera check-in
- Deps: `react-native-qrcode-svg`, `react-native-svg`, `expo-camera`. app.json kamera izni + plugin.
- `src/components/QRScanner.js` (expo-camera). Customer Subscriptions+Loyalty kartında **gerçek QR**
  (`yapio:sub:<bid>:<entryId>` / `yapio:loy:...`). Manage'de **QR okut** → üyelik check-in / +1 damga.

#### 🏢 Sektör 21 → 32
- Eklenen: otel, avukat, muhasebe, emlak, optik, kurutemizleme, cicekci, evhizmet, spa, rentacar, pt.
- Backend `src/lib/templates.js` (SECTORS+TEMPLATES) + frontend `src/icons.js` (Ionicon haritası). Prod'da reseed edildi.

#### ✨ Cila ("gerçek app" hissi)
- Yeni: `src/haptics.js` (expo-haptics), `src/components/ui.js` (`Loading`/`EmptyState`/`SkeletonList`/`useRefresh`).
- 13 müşteri modülü (Booking/Catalog/Ordering/Subscriptions/Loyalty/Tracker/Campaigns/Reviews/Gallery/Records/Plans/
  Push/Messaging): **pull-to-refresh + skeleton + tutarlı boş-durum + haptik**. Runtime sekme geçişinde haptik.

#### 🆕 4 YENİ ÖZELLİK (build 20)
- **Admin'den yeni sohbet:** manage Messaging'de ✏️ + üye seçici → hiç yazmamış üyeye ilk mesaj.
- **Okunmadı rozeti:** run alt sekmelerde Mesaj/Bildirim'e yeni içerik gelince kırmızı nokta (SecureStore "son görülen";
  sekme açılınca temizlenir).
- **Uygulamayı paylaş:** store sayfasında Share butonu (`yapp://store/<slug>`).
- **Müşteri sohbetinde zaman damgası** (manage thread ile aynı).

#### Commit zinciri (master, GitHub 85kws/yapio)
`2566aef`(fix+QR+sektör) → `02cb2f7`(cila) → `33ab9a4`(crash dep fix) → `d5dc6ce`(codemagic) →
`57dd39b`(GH Actions) → team/swift/eas-local CI fix'leri → `(drag+messaging crash fix)` → `(4 özellik)`.

---

### ✅ Push provisioning ÇÖZÜLDÜ
build 11/12/13 push-capability eksik provisioning profile yüzünden düşmüştü. ÇÖZÜM: bir kez **interactive** `eas build -p ios --profile production` (Apple ID `baserosmanyigit@gmail.com` + app-specific password, "set up Push Notifications? Yes") → APNs key + push'lu profil üretildi. Artık **non-interactive `eas build` çalışıyor**. Son BAŞARILI TestFlight = **build 15**.

### EN SON tur — tema hex+10 desen, WhatsApp mesaj, kılavuz+popup, Sözleşme v2, Canva editör, dil TR/EN (commit 046f435 → BUILD 15 ✅)
- **Tema:** renk kodu (#hex) girişi + **10 isimli desen** (`src/components/AppBackground.js` PATTERNS) canlı önizlemeli (`app/business/[id].js`).
- **Mesaj (admin) WhatsApp tarzı** (`src/modules/manage/Messaging.js`): kişi listesi en-yeni-üstte + arama + saat + avatar + otomatik kaydır. Müşteri düz tek thread.
- **Sipariş:** modül kalır, uygulama içi ödeme yok — "teslimde/gel-al öde" notu.
- **Kılavuz baştan** (`app/guide.js`, `GuideAccordion` export): acemi anlatım (modül aç/yönet, hangi tuş), ödeme refsleri silindi, çok-detaylı güvenlik/KVKK. Yeni satıcıya **ilk girişte popup** (`app/my-businesses.js`, SecureStore `yapio_guide_seen`).
- **Kullanım Sözleşmesi v2.0** (`src/legal/terms.js`, TR+EN, 22 madde): uygulama-içi-ödeme-yok + Apple IAP paket, mini-admin hesap, sağlık verisi, sohbet denetimi, cihaz/bildirim.
- **Canva editör (YENİ `app/manage/[id]/canvas.js` + `src/components/CanvasView.js`):** tuvalde sürükle-bırak metin/görsel/buton + boyut/yazı/renk/hizalama paneli → `config.landing_canvas`; runtime canvas varsa onu render eder. business'a "Tasarla (Canva)" linki.
- **Dil TR/EN (YENİ `src/i18n.js` + expo-localization):** cihaz dili TR→TR yoksa EN; Profil > Ayarlar > Dil ile değiştir (SecureStore). `app/_layout.js` LanguageProvider; login + sekmeler yerelleşti. Profil'den ödeme-bağlama-rehberi linki kaldırıldı.

### Önceki tur — NATIVE: adım sayar (pedometer) + push bildirimler (commit ea723af)
- **Adım Sayar modülü (YENİ, gerçek pedometer):** `expo-sensors` Pedometer ile telefonun saydığı GERÇEK günlük adım. Customer (`src/modules/customer/Steps.js`): adım + hedef bar + km/kcal. Manage: günlük hedef. **Tracker'dan adım çıkarıldı** (artık sadece su/kalori). registry/MODULE_INFO(steps)/icons(walk) eklendi.
- **Push bildirim sistemi (expo-notifications):** `src/notifications/setup.js` — izin + Expo push token kaydı (`/api/push/register` → push_tokens), su + randevu yerel hatırlatıcı. `(tabs)/_layout`'ta init+register. Booking randevu alınca yerel hatırlatıcı.
- **Backend push** (`src/lib/push.js` Expo send + businessAdmins; DEPLOY EDİLDİ) — tetikleyiciler: katılım isteği→adminler, mesaj→karşı taraf, yeni randevu→adminler, program/ölçüm atandı→müşteri, üyelik onay→müşteri, randevu durumu→müşteri.
- Deps: expo-sensors/notifications/device. app.json: notifications plugin + NSMotionUsageDescription. EAS APNs anahtarını otomatik kurar.
- **Kalan tek faz:** IAP paketler (Dev/Dev+/Pro, [[yapp-pricing-tiers]]) — RevenueCat + ASC ürün + paywall + tier kilidi.

### Daha eski tur — ödeme kaldırma + tema/arka plan + kişiye özel program/ölçüm + yeni şablonlar + tier kararı (commit a616017, e22c4e2)
- **Ödeme komple kaldırıldı:** platform ücreti/fiyat modalı/ödeme-rehberi yok, publish bedava, payments modülü picker'dan + müşteri sekmelerinden gizli. **Ekip (staff) müşteriye gizli.** Mini app ana sayfadan adres/tel kalktı.
- **Tema & Arka Plan editörü** (`app/business/[id].js` + YENİ `src/components/AppBackground.js`): 10 tema rengi + arka plan Düz/Desen(baloncuk/halka/nokta)/Özel foto → `theme_json`. Desen/foto Dev+/Pro'da olacak.
- **Kişiye özel program (plans):** mini admin müşteri seçer → başlık+bölümler program atar (`createEntryFor` user_id). Müşteri kendine atananı akordeon görür.
- **Kişiye özel ölçüm (records):** mini admin müşteri seçer → 16 alanlı detaylı vücut analizi girer (kilo/yağ/kas/su/BMI/iç yağ/metabolik yaş/BMR/protein/mineral/bel/kalça/göğüs/kol), çok-girişli geçmiş. Müşteri kendi geçmişini + kilo değişimini görür (salt-okunur).
- **6 yeni şablon** (21 sektör): petshop, eczane, doğum/kadın sağlığı, diş, psikolog, kreş. Tüm şablonlardan payments çıktı.
- **Fiyatlama kararı (Apple IAP, EN SON faz):** Yapio Dev ₺249 / Dev+ ₺399 / Pro ₺449. Kapasite 50/200/∞, mini app 1/3/15, desen+foto Dev+/Pro. Rozet yok, gerçek push+tema rengi hepsinde. Eski usage-based İPTAL. Detay: memory [[yapp-pricing-tiers]].
- ⚠️ **Henüz build alınmadı** — native faz (adım sayar + bildirimler) + IAP da girince tek build.
- **Kalan:** adım sayar (expo-sensors) + tüm bildirimler (expo-notifications/APNs) [native faz] · katılım isteği bildirimi (#5) · IAP paketler.

### Önceki tur — dev admin denetim + mini-admin hesap açma + kayıt sistemi + kılavuz (commit 33546f4, build 10 → TestFlight)
- **Dev super-admin sayfası zenginleşti** (`/yapp/admin`, ADMIN_KEY): "Sahipler & Mini App'ler" + "Tüm Kullanıcılar" sekmeleri. Her kullanıcı: provider (Apple/Google/E-posta/mini-admin açtı), cihaz platformu (ios/android), kayıt tarihi, üyelik sayısı, ban durumu. Her mini app: **kim kullanıyor** (üyeler+username+platform), indirme/içerik/kayıt sayıları. **Sohbet okuma**: messaging mesajları işletme başına okunur (yasa dışı içerik denetimi). Başvuru onay/red, app askıya/aktif, kullanıcı ban/unban — hepsi key ile.
- **Platform/provider yakalama:** `app_users.provider/platform/created_by_business` kolonları eklendi; auth (register/login/business-login/apple/google) `platform`=Platform.OS alır.
- **Mini-admin hesap açma (kayıt sistemi):** mini admin "Kullanıcılar" ekranından danışan/çalışan için **kullanıcı adı + şifre** hesabı açar (`POST /businesses/:id/members/create` → global `local:username` hesap + aktif `business_members`). Kişiye bilgiler verilir, normal "Giriş"le girer. App "Özel (kayıt sistemi)" ise sadece üyeler kullanır. (`app/members/[id].js` + `business.routes.js` + `client.createMember`)
- **Mini admin KILAVUZU (YENİ `app/guide.js`):** akordeon — Yapio/mini admin nedir, kurulum, ana sayfa editörü, 16 modül (MODULE_INFO'dan otomatik), kayıt sistemi & hesap açma (Ali örneği), booking, yayın/ücret, ödeme ayarları, güvenlik/sorumluluk. `business/[id].js`'e "Kılavuz" linki.
- Backend prod'a scp+init-db+restart deploy edildi, smoke-test geçti (platform yakalandı, business-login 401, member-create korumalı, admin /data 200).
- ⚠️ build 9 (önceki tur, Yapio) zaten TestFlight'a auto-submit oldu; build 10 onu geçer.
- **Hâlâ kalan:** #1 gerçek **pedometer** (expo-sensors + dev build).

### Önceki tur — Yapio + gerçek-app mini app + şifreli auth + dev admin (commit 4e80120, build 9 → TestFlight auto-submit)
- **Ad: yapp → Yapio.** "yapp" App Store'da alınmış (ASC otomatik "yapp (80c152)" yapmıştı) → ASC display adı + app.json name **Yapio**. Bundle `com.yapp.builder` aynı. ASC, CaloriDay ASC API key (QJT4TH5633) ile yönetildi.
- **Mini app runtime (`app/run/[slug].js`):** üst logo/ad/özet başlığı KALDIRILDI; alt **yatay kaydırılabilir özellik menüsü** (tab bar) — ilk sekme Ana Sayfa (landing), sonra her açık modül. Ekranın HER yerinden **yatay swipe + slide animasyon** (Animated + PanResponder) ile geçiş. Gerçek app hissi.
- **Booking (`src/modules/customer/Booking.js`):** uçak-bileti **takvim** — 28 günlük ay-grid (Pzt-başı), dolu/geçmiş gün soluk+kapalı, boş gün açık (müsaitlik gün-başına paralel `bookingSlots` ile çekilir), ilk boş gün otomatik seçili.
- **Mini app ANA SAYFA editörü (YENİ `app/manage/[id]/home.js`):** `landing_blocks` elle düzenle — metin/görsel/buton blok ekle/sil/sırala/içerik; görsel `_assets` pseudo-modüle `uploadModuleImage` ile. `business/[id].js`'e "Ana Sayfayı Düzenle" linki.
- **Auth GÜVENLİK reworku:** Gerçek **isim+şifre kayıt/giriş** (Node scrypt; `app_users.password_hash` + `local_sub` kolonları). Login'de "Zaten hesabın var mı?" giriş/kayıt geçişi. **/auth/dev KALDIRILDI**, **orion süper-admin backdoor KALDIRILDI**. Frontend `loginDev`/`authDev` temizlendi. (DEV_LOGIN artık anlamsız — endpoint yok.)
- **DEV SÜPER-ADMIN sunucu sayfası (YENİ `src/routes/admin.routes.js`):** app'ten BAĞIMSIZ, JWT yok. `https://167-233-44-62.sslip.io/yapp/admin`, sadece **ADMIN_KEY** (prod `.env`) ile açılır. Tüm sahipler + işletmeleri + içerik/kayıt sayıları, başvuru onay/red, işletme askıya/aktif, kullanıcı ban/unban. (#3 "süper admin her sahibin verisini ayrı görsün" burada karşılandı.)
- **app.json:** kullanılmayan `RECORD_AUDIO` izni silindi.
- Backend prod'a deploy edildi (scp + `npm run init-db` migration + `pm2 restart yapp`). Smoke-test geçti (register/login 200, /auth/dev 404, orion 401).
- **Kalan iş:** #1 gerçek **pedometer** (expo-sensors + dev build; FormLab `app/(client)/steps.js` reuse) — YAPILMADI.

### Önceki tur — G1–G6 (commit 350782d, TestFlight build 8)
- **Giriş:** isim + **şifre**. ScrollView + autofocus yok → terms onay kutusu erişilebilir, klavye kapanabilir.
- **Süper admin:** isim `orion` / şifre `1234` (rezerve; yanlış şifre = 401). is_admin + is_super verir. Eski "admin" backdoor kaldırıldı.
  Süper admin: `app/admin/sellers.js` (başvuru onay/red) + `app/admin/businesses.js` (işletme askıya al/aktifleştir) + kullanıcı ban.
- **seller-apply:** işletme türü soruları (tür/çalışan/fiziksel mekan/sunulan hizmet) + **zorunlu "online ürün satışı yapamam" onayı** (Apple kuralı bilgi kutusu).
- **Profil:** ödeme rehberi **sadece onaylı satıcıda**; "Destek & Geri Bildirim" → `mailto:o.y.baser@gmail.com`.
- **Run TAM EKRAN:** üstteki X/geri/başlık bar'ı kaldırıldı (gerçek app hissi). App ana sayfasında küçük yüzen ↓ (çıkış), modül içinde küçük yüzen ‹ (ana sayfaya). Çıkış ayrıca iOS kenar-swipe.
- **Özelleştirme:** app adı düzenlenebilir + logo yükleme (`/businesses/:id/logo`); logo her yerde ikon olur (`AppIcon logo` prop).
- **Özel app'ler (FormLab tarzı erişim):** `businesses.access_mode` public/private + `join_code`; `business_members` (pending/active/blocked). Private app açılınca **katılım kapısı**: kod gir→aktif, veya istek gönder→pending; satıcı `app/members/[id].js`'te onaylar/çıkarır. Sahip/personel her zaman erişir.
- Backend yeni kolon/tablo: app_users.is_super/banned, businesses.access_mode/join_code, business_members tablosu (prod'da OWNER→yapp yapıldı).

### Önceki: 16 modül (aşağıda detay)

**16 modülün TAMAMI aktif** (artık "yapım aşamasında" yok). Commit zinciri:
`da7d645`(CP1) → `f2aadd9`(CP2) → `c8ed8ba`(CP3) → `c77dd7d`(CP4) → `ebcf86a`(CP5) →
`40d446c`(Batch A/booking backbone) → `8e17237`(B) → `fc71fc6`(C) → `ccf3f81`(D).

### Modül mimarisi (ÖNEMLİ — generic backbone)
İki generic Postgres tablosu tüm modülleri besler (modül-başına tablo YOK):
- `module_items` (business_id, module, data jsonb, position) → **satıcı içeriği**
  (hizmetler, ürünler, kampanyalar, planlar, galeri görselleri, üyelik planları, ekip, duyurular, loyalty config).
- `module_entries` (business_id, module, user_id, data jsonb, status) → **müşteri/işlem kayıtları**
  (randevular, siparişler, yorumlar, ölçümler, mesajlar, takip, üyelikler, ödemeler, loyalty kartları).

Backend: `src/routes/modules.routes.js` — `/api/m/:businessId/:module/...`:
- `GET/POST/PUT/DELETE .../items` (yazma = requireBusinessRole admin)
- `GET/POST/PUT/DELETE .../entries` (GET: staff hepsini, müşteri kendi user_id'sini görür)
- `POST .../entries` body `target_user_id` → **staff, müşteri adına kayıt açar** (mesaj yanıtı, ödeme)
- `POST .../upload` (multer) → görseli item olarak ekler (gallery)
- `GET .../booking/slots?date=&duration=` → çalışma saatleri + dolu randevulardan boş slot üretir

Frontend: `src/modules/registry.js` → `CUSTOMER{}` + `MANAGE{}` map'leri (modül key → bileşen).
- `src/modules/customer/<Mod>.js` = müşteri görünümü (runtime `app/run/[slug].js` içinde render).
- `src/modules/manage/<Mod>.js` = satıcı yönetimi (`app/manage/[id]/[module].js` route'unda render).
- Yeni modül eklemek = 2 bileşen yaz + registry'ye ekle (yeni tablo/route gerekmez).
- Client API: `src/api/client.js` → getItems/createItem/.../getEntries/createEntry/createEntryFor/
  bookingSlots/uploadModuleImage/mediaUrl.

### 16 modülün durumu
| Modül | Müşteri | Satıcı | Not |
|---|---|---|---|
| booking | hizmet→tarih→slot→randevu, randevularım+iptal | hizmet CRUD, çalışma saati, randevu on/iptal | **bayrak, tam** |
| catalog | kategori-gruplu menü | ürün CRUD | |
| ordering | sepet→sipariş, siparişlerim | sipariş kuyruğu + durum akışı | catalog'a bağlı |
| campaigns | kampanya listesi | kampanya CRUD | |
| loyalty | damga kartı + ilerleme | hedef/ödül + müşteri kartına damga | kart müşteri açınca oluşur |
| subscriptions | plan→abone→üyelik kartı+QR kod | plan CRUD + üyeler + check-in | |
| records | kendi ölçümü gir/listele | müşteri ölçümleri (gruplu, salt-okunur) | dosya yükleme YOK (sonra) |
| plans | program oku (akordeon) | program CRUD | genel (müşteri-özel değil) |
| tracker | adım/su/kalori gir + bugün özeti | müşteri takipleri | telefon sensörü YOK, elle giriş |
| messaging | thread + gönder | thread listesi + yanıt | target_user_id ile çalışır |
| reviews | puan+yorum bırak, ortalama | ortalama + liste | |
| gallery | görsel ızgarası | görsel yükle/sil | |
| profile | adres(harita)/tel(ara)/saat | bilgileri düzenle | |
| staff | ekip listesi | ekip CRUD | |
| payments | kendi ödemeleri + toplam | ödeme defteri (ad/tutar/toplam) | tahsilat dev geçidinden; bu defter takip |
| push | uygulama içi duyuru listesi | duyuru yayınla | **gerçek APNs push YOK** — in-app; sonraki altyapı |

### Bilinen sınırlar / sonraki işler
- **Gerçek push (APNs/Expo Notifications)** kurulmadı — push modülü şimdilik in-app duyuru. Dev build + entitlement + token kaydı + Expo push send gerekir.
- **Records dosya yükleme** (PDF/PNG cihaz çıktısı) yok — şimdilik elle alanlar.
- **Payments müşteri-bağlama**: satıcı ödeme defteri müşteri user_id'sine bağlı değil (isim yazılıyor). Müşteri "Ödemelerim" ancak target_user_id ile bağlanırsa dolu görünür. Roster/müşteri seçici sonra.
- **Tracker** telefon pedometre entegrasyonu yok (elle giriş).
- Booking dışındaki modüller "fonksiyonel/sağlam" seviyede; booking "tam".

### ⚠️ DEPLOY GOTCHA (tekrar etme)
Prod'da `psql` ile **postgres superuser** olarak TABLO oluşturursan sahibi postgres olur →
`yapp` rolü "permission denied" alır. Yeni tablo eklersen mutlaka:
`ALTER TABLE x OWNER TO yapp; ALTER SEQUENCE x_id_seq OWNER TO yapp;`
(module_items/module_entries bunu yaşadı, düzeltildi.)

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
