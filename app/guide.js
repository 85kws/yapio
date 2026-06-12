// Mini admin KILAVUZU — tüm özellikler, adminlik, ayarlar acemiye anlatır gibi (çok ayrıntılı).
// GuideAccordion: hem bu ekranda hem ilk-giriş popup'ında kullanılır.
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../src/theme';
import { MODULE_INFO } from '../src/modules';
import { moduleIcon } from '../src/icons';

export const GUIDE_SECTIONS = [
  {
    icon: 'rocket-outline', title: 'Yapio nedir, mini admin kimdir?',
    body: [
      'Yapio, işletmelerin kendi "mini uygulamasını" kurduğu bir uygulama dükkânıdır. Kod yazmazsın; hazır özellikleri (modülleri) seçip kendi mini app\'ini oluşturursun.',
      'Sen bu mini app\'in yöneticisisin = "mini admin". Sayfanı düzenler, özellikleri açıp kapatır, müşteri/danışan hesapları açar, randevu-mesaj-program-ölçümleri yönetirsin.',
      'Müşterilerin mini app\'ini Yapio içinden bulup kullanır.',
    ],
  },
  {
    icon: 'construct-outline', title: 'Uygulamanı kurma (adım adım)',
    body: [
      '1) Profil > İşletmelerim > "Hemen Başla" (veya sağ üstte "Yeni").',
      '2) Sektörünü seç (kuaför, klinik, restoran, eczane...).',
      '3) Hazır şablon seç — sektörüne uygun özellikler ve örnek ana sayfa otomatik gelir.',
      '4) İşletme adı/bilgilerini gir. Sonra İşletmem ekranından her şeyi değiştirebilirsin.',
      '5) Logonu yükle: İşletmem ekranında yuvarlak ikona dokun → galeriden seç.',
    ],
  },
  {
    icon: 'toggle-outline', title: 'Özellikleri (modülleri) açma / yönetme',
    body: [
      'İşletmem ekranını aç. "Özellikler" listesinde her modülün yanında bir AÇMA/KAPAMA anahtarı (switch) var.',
      'Bir özelliği açmak: anahtara dokun, yeşil olsun. Kapatmak: tekrar dokun.',
      'Özellik açılınca yanında "Yönet" tuşu çıkar. Ona bas → o özelliğin içeriğini eklersin (örn. randevuda hizmet ekle, menüde ürün ekle).',
      'Bir özelliğin ne işe yaradığını görmek: adının yanındaki (i) bilgi simgesine dokun.',
      'Müşteri, mini app\'i açınca sadece AÇIK özellikleri alttaki menüde görür.',
    ],
  },
  {
    icon: 'create-outline', title: 'Ana sayfanı düzenleme',
    body: [
      'İşletmem > "Ana Sayfayı Düzenle". Mini app açılınca görünen içeriği sen kurarsın.',
      'Blok ekle: Metin (başlık/normal, hizalama), Görsel (galeriden), Buton (bir özelliğe götürür, telefonu arar veya link açar).',
      'Blokları yukarı/aşağı taşıyarak sırala, sil. "Önizle" ile gör, "Kaydet" ile yayınla.',
      'İpucu: en üste kısa karşılama + "Randevu Al" butonu koy.',
    ],
  },
  {
    icon: 'color-palette-outline', title: 'Tema rengi & arka plan',
    body: [
      'İşletmem > "Tema & Arka Plan". Hazır renklerden seç ya da kendi renk kodunu (#) gir.',
      'Arka plan: Düz renk, Desen (10 çeşit — önizlemeli) veya kendi Fotoğrafın.',
      '(Desen ve foto arka plan, üst paketlerde aktif olur.)',
    ],
  },
  {
    icon: 'apps-outline', title: 'Tüm özellikler ne işe yarar?',
    modules: true,
  },
  {
    icon: 'lock-closed-outline', title: 'Kayıt sistemi & müşteri hesabı açma',
    body: [
      'Mini app\'ini "Özel (kayıt sistemi)" yaparsan herkes giremez — sadece senin açtığın kişiler kullanır. Özel danışanlarla çalışan işletmeler için.',
      'İşletmem > Erişim > "Özel (kayıt sistemi)" seç. Sonra "Kullanıcılar" ekranını aç.',
      'HESAP AÇ: kullanıcı adı + şifre belirle, kişiye ver. Örnek: Ali geldi, hesap istedi → kullanıcı adı "ali", şifre "12345" yaparsın, Ali\'ye verirsin.',
      'Ali, Yapio giriş ekranında "Giriş" ile bu bilgilerle girer ve senin uygulamanı kullanır. Kullanıcı adı alınmışsa benzersiz seç.',
      'Alternatif: KATILIM KODU paylaş — kodu girenler üye olur. İstek gelenleri "Kullanıcılar"dan onaylar/çıkarırsın.',
    ],
  },
  {
    icon: 'calendar-outline', title: 'Randevu sistemi',
    body: [
      'Randevu özelliğini aç > "Yönet". Önce "Çalışma Saatleri" gir. Sonra "Hizmetler" ekle (ad, süre, fiyat).',
      'Müşteri hizmeti seçer, takvimden boş gün/saat seçip randevu alır (dolu günler soluk). Çakışan saat otomatik engellenir.',
      'Gelen randevuları "Yönet"ten onaylar/iptal edersin; müşteriye otomatik bildirim gider.',
    ],
  },
  {
    icon: 'chatbubbles-outline', title: 'Mesajlaşma',
    body: [
      'Müşteriler sana tek tek yazar. Sen "Mesaj" özelliğini açınca, WhatsApp gibi bir kişi listesi görürsün.',
      'Bir kişiye dokun → onun sohbetini aç → yanıt yaz. Yeni mesaj gelince bildirim alırsın.',
    ],
  },
  {
    icon: 'clipboard-outline', title: 'Program & ölçüm (kişiye özel)',
    body: [
      'Program: müşteri seç → başlık + bölümlerle (Kahvaltı/Öğle... veya Pazartesi/Salı...) program hazırla, ata. Müşteri kendi programını görür.',
      'Ölçüm: müşteri seç → detaylı vücut analizi gir (kilo, yağ, kas, BMI, bel...). Birden çok ölçüm = geçmiş. Müşteri kendi geçmişini ve kilo değişimini görür.',
    ],
  },
  {
    icon: 'notifications-outline', title: 'Bildirimler',
    body: [
      'Yapio otomatik bildirim gönderir: yeni katılım isteği, yeni mesaj, yeni randevu (sana); randevu onayı/iptali, yeni program/ölçüm, üyelik onayı (müşteriye); randevu yaklaşınca hatırlatma.',
      'Ayrı bir şey yapman gerekmez — özellikleri kullandıkça bildirimler kendiliğinden gider.',
    ],
  },
  {
    icon: 'rocket-outline', title: 'Yayınlama',
    body: [
      'Hazır olunca İşletmem > "Yayınla". App vitrinde görünür, müşterilerin bulup kullanır.',
      'Yayınlamak ücretsiz. Paket/limit yükseltmeleri ileride App Store üzerinden olacak.',
    ],
  },
  {
    icon: 'card-outline', title: 'Sipariş & ödeme',
    body: [
      'Sipariş özelliğiyle müşteri menüden sipariş verir; sen siparişleri görür, durumunu (hazırlanıyor/hazır) işaretlersin.',
      'ÖNEMLİ: Uygulama içinde PARA TAHSİL EDİLMEZ. Müşteri siparişini verir, ödemeyi teslimde / gel-al sırasında fiziksel yapar. (Apple kuralı: dijital içi ödeme yok.)',
    ],
  },
  {
    icon: 'shield-checkmark-outline', title: 'Güvenlik & sorumluluk (önemli)',
    body: [
      'KİŞİSEL VERİ (KVKK/GDPR): Müşteri verilerini (ad, telefon, ölçüm, mesaj, sağlık bilgisi) yalnızca hizmet için, kişinin izniyle topla. Veri sorumlusu SENSİN. Müşteri "verimi sil" derse silmelisin (Kullanıcılar > çıkar; ilgili kayıtları sil).',
      'ŞİFRELER: Açtığın hesapların şifrelerini kişiye güvenli ilet, kimseyle paylaşma, herkese aynı şifreyi verme. Bir kişinin erişimini kapatmak için Kullanıcılar\'dan çıkar.',
      'SAĞLIK VERİSİ (klinik/diyet/estetik): Girdiğin ölçüm/program tıbbi sorumluluğundadır. Uygulama bir ARAÇTIR; teşhis/tedavi aracı değildir. Yanlış/eksik bilgiden doğan sonuçtan sen sorumlusun.',
      'SOHBET DENETİMİ: Uygulama içi mesajlar denetlenebilir. Yasa dışı, taciz, dolandırıcılık içerik tespit edilirse işletmen askıya alınır ve gerekirse yetkililere bildirilir.',
      'DOĞRU KULLANIM: Sahte hesap açma; kişileri izinsiz ekleme; yanıltıcı içerik/kampanya yasak. Sadece gerçek, rızası olan kişilere hesap aç.',
      'ÖDEME & VERGİ: Fiziksel tahsilat, fatura ve vergi yükümlülüğü tamamen sana aittir; Yapio aracı değildir, ödemeye karışmaz.',
      'İÇERİK: Yüklediğin görsel/metinlerin haklarına sahip olmalısın. Telif/marka ihlali yasaktır.',
      'Şüphen varsa: gizliliği koru, az veri tut, izin al. Sözleşmeyi (Profil > Kullanım Sözleşmesi) oku.',
    ],
  },
];

function Item({ section, theme, open, onToggle }) {
  return (
    <View style={s.card}>
      <TouchableOpacity style={s.head} onPress={onToggle} activeOpacity={0.7}>
        <View style={[s.iconBox, { backgroundColor: theme + '22' }]}><Ionicons name={section.icon} size={20} color={theme} /></View>
        <Text style={s.htitle}>{section.title}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={20} color={COLORS.muted} />
      </TouchableOpacity>
      {open && (
        <View style={s.body}>
          {section.modules ? (
            Object.keys(MODULE_INFO).filter((k) => k !== 'payments').map((k) => (
              <View key={k} style={s.mod}>
                <View style={s.modHead}><Ionicons name={moduleIcon(k)} size={16} color={theme} /><Text style={s.modLabel}>{MODULE_INFO[k].label}</Text></View>
                <Text style={s.modDetail}>{MODULE_INFO[k].detail}</Text>
              </View>
            ))
          ) : (
            section.body.map((p, i) => <Text key={i} style={s.p}>{p}</Text>)
          )}
        </View>
      )}
    </View>
  );
}

// Hem ekranda hem popup'ta kullanılan akordeon.
export function GuideAccordion({ theme = COLORS.primary, startOpen = 0 }) {
  const [open, setOpen] = useState(startOpen);
  return GUIDE_SECTIONS.map((sec, i) => (
    <Item key={i} section={sec} theme={theme} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
  ));
}

export default function Guide() {
  const router = useRouter();
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.headerBar}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={COLORS.primary} /><Text style={s.back}>Geri</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ padding: SIZES.pad, paddingBottom: 40 }}>
        <Text style={s.title}>Mini Admin Kılavuzu</Text>
        <Text style={s.sub}>Tüm özellikler, ayarlar ve adminlik adım adım. Bir başlığa dokun, açılsın.</Text>
        <GuideAccordion />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  headerBar: { paddingHorizontal: SIZES.pad, paddingVertical: 8 },
  backBtn: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' },
  back: { color: COLORS.primary, fontSize: 17, fontWeight: '600' },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.text },
  sub: { fontSize: 14, color: COLORS.muted, marginTop: 4, marginBottom: 16, lineHeight: 20 },
  card: { backgroundColor: COLORS.card, borderRadius: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  iconBox: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  htitle: { flex: 1, fontSize: 16, fontWeight: '800', color: COLORS.text },
  body: { paddingHorizontal: 16, paddingBottom: 14, paddingTop: 2 },
  p: { fontSize: 14.5, color: COLORS.text, lineHeight: 22, marginBottom: 10 },
  mod: { marginBottom: 14 },
  modHead: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 3 },
  modLabel: { fontSize: 15, fontWeight: '800', color: COLORS.text },
  modDetail: { fontSize: 13.5, color: COLORS.muted, lineHeight: 20 },
});
