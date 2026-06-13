# Codemagic ile iOS Build (EAS alternatifi)

EAS bedava iOS kotası dolunca Yapio'yu **Codemagic** ile derleyip TestFlight'a atarsın.
Mac gerekmez (Codemagic bulutta macOS kullanır). Ayda **500 dakika bedava**.

İmza (sertifika + provisioning) **App Store Connect API key** ile otomatik yönetilir —
elinde zaten var: `~/caloriday-ios-signing/AuthKey_QJT4TH5633.p8`.

---

## ÖN ŞART: repo bir Git host'unda olmalı

Codemagic local repoyu göremez; önce **GitHub/GitLab/Bitbucket**'a push'la.
Repo daha önce hiç push'lanmadıysa (GitHub örneği):

```bash
# 1) GitHub'da boş bir repo aç (web): github.com/new  -> ad: yapp  (Private seçebilirsin)
# 2) PC'de remote ekle + push (master dalı):
cd ~/yapp
git remote add origin https://github.com/<KULLANICI_ADIN>/yapp.git
git push -u origin master
```

> Not: GitHub Actions'tan farklı olarak Codemagic'te **private repo** olması sorun değil,
> bedava dakikalar yine geçerli.

---

## ADIMLAR (Codemagic web arayüzü)

1. **codemagic.io** → giriş yap (GitHub hesabınla giriş en kolayı).
2. **Add application** → Git host'unu seç → `yapp` reposunu seç.
   - "Select a workflow" sorarsa: **codemagic.yaml** (reponun içindeki) seçilsin.
3. **App Store Connect entegrasyonu** (imza + yükleme için), bir kez:
   - Sağ üst **Teams** → (takımın) → **Integrations** → **App Store Connect** → **Add key**:
     | Alan | Değer |
     |---|---|
     | **Name** | `Yapio ASC`  *(codemagic.yaml'daki adla birebir aynı!)* |
     | **Issuer ID** | `662f4083-11b0-40dd-8e49-1fbecf6e3c90` |
     | **Key ID** | `QJT4TH5633` |
     | **API key (.p8)** | `~/caloriday-ios-signing/AuthKey_QJT4TH5633.p8` dosyasını yükle |
4. Uygulama sayfasında → **Start new build** → workflow: **Yapio iOS → TestFlight** → başlat.
5. ~15-25 dk sonra build biter, `.ipa` otomatik **TestFlight**'a yüklenir
   (Apple işleme ~5-10 dk, sonra TestFlight'ta görünür).

---

## Sık takılınan yerler

- **Workspace/scheme adı:** `codemagic.yaml` `ios/Yapio.xcworkspace` + scheme `Yapio` varsayıyor
  (app.json `name: "Yapio"`). Build "scheme not found" derse, prebuild log'unda üretilen gerçek
  ad neyse onu `XCODE_WORKSPACE`/`XCODE_SCHEME`'e yaz.
- **instance_type:** Bedava planda `mac_mini_m2` çalışmazsa `mac_mini_m1` yap.
- **İlk build'de profil yoksa** Codemagic API key ile otomatik üretir; ekstra bir şey gerekmez.
- Crash fix'i (`expo 56.0.11` hizalama) `npm ci` ile lock'tan gelir → bu build düzgün açılır.

---

## Neden bu işe yarıyor

iOS .ipa derlemek için Apple'ın Xcode'u (yalnız macOS) şart. Codemagic bulutta macOS VM verir,
`expo prebuild` ile native iOS projesini üretir, imzalar, derler ve TestFlight'a atar.
Mantık EAS ile aynı; sadece sağlayıcı farklı ve bedava kotası ayrı.
