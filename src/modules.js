// Modül kataloğu: her modülün adı, kısa açıklaması ve AYRINTILI özeti (ne yapar).
// İkon = src/icons.js moduleIcon(key). Onboarding, yönetim ve runtime ortak kullanır.

export const MODULE_INFO = {
  booking: {
    label: 'Randevu',
    short: 'Hizmet seç, uygun saatten randevu al.',
    detail: 'Müşterileriniz hizmetlerinizi (örn. saç kesimi, kontrol seansı) görür, personel ve uygun saat seçip randevu alır. Çakışan saatler otomatik engellenir. Randevu öncesi otomatik hatırlatma bildirimi gider. Siz takvimden tüm randevuları yönetirsiniz: onaylama, erteleme, iptal.',
  },
  catalog: {
    label: 'Menü / Katalog',
    short: 'Ürün ve fiyatları göster.',
    detail: 'Ürün veya hizmetlerinizi kategori kategori, fotoğraf ve fiyatlarıyla listeler. Restoran menüsü, fiyat listesi, hizmet kataloğu gibi. Müşteri telefonundan inceler. Fiyatları istediğiniz an güncellersiniz.',
  },
  ordering: {
    label: 'Sipariş',
    short: 'Sepete ekle, sipariş ver.',
    detail: 'Müşteri menüden ürün seçip sepete ekler, gel-al veya masa siparişi verir (sadece fiziksel teslim). Siparişler size anlık düşer; hazırlanıyor/hazır durumunu işaretlersiniz. Müşteri durumu telefonundan takip eder.',
  },
  campaigns: {
    label: 'Kampanya',
    short: 'İndirim ve fırsat duyur.',
    detail: 'Kampanya, indirim kodu ve fırsat banner’ları oluşturursunuz. Tek tuşla tüm müşterilere push bildirim gönderirsiniz ("Bugün %20 indirim"). Süreli kampanyalar otomatik biter.',
  },
  loyalty: {
    label: 'Sadakat',
    short: 'Damga topla, ödül kazan.',
    detail: 'Dijital damga/puan kartı. Müşteri her alışverişte damga toplar ("10 kahve al, 1 bedava"). Ödül otomatik tanımlanır. Kağıt kart derdi yok; müşteri telefonunda görür.',
  },
  subscriptions: {
    label: 'Üyelik',
    short: 'Paket/üyelik yönet, QR ile giriş.',
    detail: 'Aylık üyelik veya seans paketi satarsınız (spor üyeliği, 10 seans paketi). Müşteri üyelik durumunu görür; girişte QR okutarak check-in yapar. Bitince yenileme hatırlatması gider.',
  },
  payments: {
    label: 'Ödeme',
    short: 'Ödeme al ve takip et.',
    detail: 'Kendi iyzico/Stripe hesabınızı bağlarsınız; para DOĞRUDAN sizin hesabınıza geçer (yapp dokunmaz). Müşteri uygulama içinden öder, taksit/bakiye takibi yapılır. Sadece fiziksel hizmet için (Apple kuralı).',
  },
  records: {
    label: 'Ölçüm / Kayıt',
    short: 'Ölçüm ve dosya kayıtları.',
    detail: 'Müşteriye özel ölçüm/veri kayıtları tutarsınız (vücut analizi, kan değerleri, tedavi notu) ve PDF/PNG dosya yüklersiniz (cihaz çıktısı gibi). Müşteri kendi geçmiş ölçümlerini ve grafiğini görür.',
  },
  plans: {
    label: 'Program',
    short: 'Diyet/antrenman programı.',
    detail: 'Müşteriye özel yapılandırılmış program hazırlarsınız: diyet listesi (öğün öğün), antrenman planı, tedavi programı. Müşteri programını telefonundan takip eder.',
  },
  tracker: {
    label: 'Takip',
    short: 'Adım, kalori, su takibi.',
    detail: 'Müşteri günlük adım, kalori ve su tüketimini takip eder (telefon sensörü + elle giriş). Hedef belirlenir, ilerleme grafikle gösterilir. Spor ve diyet için ideal.',
  },
  messaging: {
    label: 'Mesaj',
    short: 'İşletmeyle iletişim.',
    detail: 'Müşteri ile birebir mesajlaşma veya tek yönlü duyuru. Sorular, randevu değişiklikleri, bilgilendirmeler tek kanaldan. WhatsApp karmaşası yok.',
  },
  push: {
    label: 'Bildirim',
    short: 'Hatırlatma ve duyurular.',
    detail: 'Push bildirim altyapısı: randevu hatırlatması, ödeme zamanı, kampanya, doğum günü kutlaması. Otomatik (zamanlı) veya elle (toplu) gönderim. Müşteriyi geri getiren en güçlü araç.',
  },
  gallery: {
    label: 'Galeri',
    short: 'Çalışmalarını sergile.',
    detail: 'Fotoğraf galerisi / portföy. Öncesi-sonrası, çalışma örnekleri, mekan fotoğrafları. Müşteri işinizin kalitesini görür, güven kazanır (kuaför, dövme, fotoğrafçı için kritik).',
  },
  profile: {
    label: 'Profil / Konum',
    short: 'Adres, saatler, iletişim.',
    detail: 'İşletme künyesi: adres, harita üzerinde konum + yol tarifi, çalışma saatleri, telefon, sosyal medya. Müşteri tek dokunuşla arar veya yol tarifi alır.',
  },
  reviews: {
    label: 'Yorumlar',
    short: 'Müşteri değerlendirmeleri.',
    detail: 'Müşteriler hizmet sonrası puan ve yorum bırakır. Ortalama puan profilde görünür. Olumlu yorumlar yeni müşteri çeker; siz yorumları yönetirsiniz.',
  },
  staff: {
    label: 'Ekip',
    short: 'Çalışanları yönet.',
    detail: 'Birden fazla personel tanımlarsınız (operatör, asistan) ve rol verirsiniz. Her personelin kendi takvimi/randevuları olur. Çok personelli işletmeler için.',
  },
};

export const MODULE_KEYS = Object.keys(MODULE_INFO);
export const moduleLabel = (k) => MODULE_INFO[k]?.label || k;
