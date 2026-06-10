# Ödeme Bağlama Rehberi (İşletmeler İçin) — Adım Adım, En Basit Anlatım

> Bu rehber, yapp'te app açan **işletme sahibi** içindir. Amacımız: müşterinden gelen
> para **doğrudan senin banka hesabına** gitsin. **yapp paraya dokunmaz.** Biz sadece
> "ödeme al" tuşunu senin hesabına bağlarız.

---

## 0. Önce şunu anla (en önemli kısım)

Düşün ki dükkanına bir **POS cihazı** (kredi kartı makinesi) koyuyorsun.
- O makineyi **banka/ödeme şirketi** verir.
- Para **senin hesabına** geçer.
- yapp = sadece o makineyi uygulamanın içine koyan kişi. Paranı görmez, tutmaz, kesmez.

Yani: **Senin paran = senin hesabın.** yapp komisyon almaz (sadece app'ini yayında tutmak için aylık yapp ücreti ödersin — o ayrı, ödeme panelimizden).

İki seçenek var:
- **iyzico** → Türkiye'desin, müşterilerin TL ödüyor. **Bunu seç.** (En kolay, Türk kartları sorunsuz)
- **Stripe** → Yurtdışı müşterin var, döviz alıyorsun.

---

## 1. iyzico ile Bağlama (Türkiye — önerilen)

### Adım 1 — iyzico hesabı aç
1. Telefonun veya bilgisayardan **iyzico.com** sitesine gir.
2. Sağ üstte **"Üye Ol"** / **"Hemen Başla"** tuşuna bas.
3. İşletme bilgilerini gir:
   - İşletme adı (örn: "Nilhan Diyet Danışmanlık")
   - Vergi numarası **veya** TC kimlik (şahıs işletmesiysen TC yeter)
   - Telefon, e-posta
   - **IBAN** (paranın geleceği banka hesabı — buraya çok dikkat, doğru yaz)
4. iyzico kimlik/işletme belgesi isteyebilir → telefonla foto çek, yükle.
5. Onay genelde **1-2 iş günü** sürer. Onaylanınca e-posta gelir.

### Adım 2 — API anahtarını al (yapp'e yapıştıracağın 2 şifre)
1. iyzico'ya gir → sol menüden **"Ayarlar"** → **"API Anahtarları"** (veya "Settings → API Keys").
2. Orada iki uzun yazı göreceksin:
   - **API Key** (örnek: `sandbox-AbCdEf123...`)
   - **Secret Key** (örnek: `sandbox-XyZ987...`)
3. Bunların yanındaki **"Kopyala"** tuşuna bas. (Elle yazma, hata olur.)

> ⚠️ Bu iki şifre senin kasanın anahtarı gibidir. **Kimseyle paylaşma.** yapp bunları şifreli saklar, ekranda bir daha göstermez.

### Adım 3 — yapp'e yapıştır
1. yapp uygulamasında **işletme panelin** → **"Ödeme Ayarları"** ekranına gir.
2. **"iyzico Bağla"** tuşuna bas.
3. Açılan iki kutuya:
   - Üst kutu → **API Key** (yapıştır)
   - Alt kutu → **Secret Key** (yapıştır)
4. **"Kaydet ve Test Et"** tuşuna bas.
5. Yeşil **"Bağlantı başarılı ✅"** yazısını görürsen → **bitti!** Artık müşterilerin app'inden ödeme yapabilir, para senin IBAN'ına geçer.

---

## 2. Stripe ile Bağlama (yurtdışı / döviz)

### Adım 1 — Stripe hesabı aç
1. **stripe.com** → **"Start now"** / **"Sign up"**.
2. E-posta + şifre ile kayıt ol.
3. Ülke seç, işletme tipini gir (şahıs / şirket), IBAN gir.

### Adım 2 — yapp'ten tek tuşla bağla (Stripe daha kolay)
1. yapp panelinde **"Ödeme Ayarları"** → **"Stripe Bağla"**.
2. Seni Stripe sitesine atar → Stripe hesabınla **giriş yap**.
3. Stripe **"yapp'e izin ver"** sorar → **"Onayla"** bas.
4. Otomatik geri döner, **"Bağlandı ✅"** yazar. Bitti.

> Stripe'ta API kopyalama yok; "izin ver" tuşuyla otomatik bağlanır (buna *Stripe Connect* denir).

---

## 3. Bağladıktan sonra ne olur?

- Müşteri app'inde **"Öde"** tuşuna basınca kart bilgisini girer.
- Para **senin** iyzico/Stripe hesabına düşer.
- iyzico/Stripe kendi küçük işlem komisyonunu keser (örn. %2-3 — bu bankacılık komisyonu, yapp'in değil).
- Para hesabına genelde **1-3 iş günü** içinde geçer (iyzico/Stripe ayarına göre).
- yapp panelinde "Ödemeler" ekranında tüm işlemleri **görürsün** (ama paraya dokunmayız).

---

## 4. Sık Sorulanlar (mala anlatır gibi)

**S: yapp paramı tutuyor mu, kesiyor mu?**
C: Hayır. Para direkt senin hesabına. yapp app'ini yayında tutmak için aylık ücret alır, o kadar. Müşteri ödemesine karışmaz.

**S: Hangisini seçeyim?**
C: Türkiye'desin, TL alıyorsan → **iyzico**. Yurtdışı/döviz → Stripe.

**S: API Key / Secret Key nedir, korkutucu geldi.**
C: İki tane uzun şifre. iyzico panelinden **kopyala-yapıştır** yapıyorsun, o kadar. Hiçbir şey yazmıyorsun.

**S: Yanlış IBAN yazdım?**
C: iyzico/Stripe panelinden düzeltirsin. Para o yeni hesaba gider.

**S: Müşteri parasını iade edebilir miyim?**
C: Evet, yapp panelinde "Ödemeler → İade" ile. İade de senin hesabından gider.

**S: Güvenli mi?**
C: Evet. Kart bilgisi yapp'e veya sana **hiç gelmez**; doğrudan iyzico/Stripe'ın güvenli sistemine gider (PCI uyumlu). Sen sadece "ödendi/ödenmedi" bilgisini görürsün.

---

## 5. Takıldın mı?
yapp panelinde **"Yardım → Ödeme Bağlama"** videosunu izle veya destek hattına yaz.
Bağlanması toplam **10 dakika** sürer (iyzico onayı hariç).
