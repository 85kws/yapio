// Mini admin KILAVUZU — tüm özellikler, adminlik, ayarlar nasıl çalışır (çok ayrıntılı).
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../src/theme';
import { MODULE_INFO } from '../src/modules';
import { moduleIcon } from '../src/icons';

const SECTIONS = [
  {
    icon: 'rocket-outline', title: 'Yapio nedir, mini admin kimdir?',
    body: [
      'Yapio, işletmelerin kendi "mini uygulamasını" kurduğu bir uygulama dükkânıdır. Tek tek uygulama yazmazsın; modülleri seçip kendi mini app\'ini oluşturursun.',
      'Sen bu mini app\'in yöneticisisin = "mini admin". Sayfayı düzenler, özellikleri açar/kapatır, müşteri/danışan hesapları açarsın.',
      'Müşterilerin mini app\'ini Yapio içinden bulur, açar ve kullanır. Sen tüm randevu/sipariş/mesaj/ödeme akışını yönetirsin.',
    ],
  },
  {
    icon: 'construct-outline', title: 'Uygulamanı kurma',
    body: [
      '1) "İşletmem / + Yeni" ile başla. Sektörünü seç (kuaför, klinik, restoran...).',
      '2) Bir şablon seç — şablon, sektörüne uygun özellikleri ve örnek ana sayfayı hazır getirir.',
      '3) İşletme bilgilerini gir (ad, adres, telefon, çalışma saati). İstediğin an "İşletmem" ekranından değiştirebilirsin.',
      '4) Logonu yükle (işletme ekranında ikona dokun). Logo her yerde uygulama ikonun olur.',
    ],
  },
  {
    icon: 'create-outline', title: 'Ana sayfanı düzenleme',
    body: [
      'İşletme ekranı > "Ana Sayfayı Düzenle". Mini app açılınca görünen içeriği sen kurarsın.',
      'Bloklar: METİN (başlık/normal, sola/ortaya/sağa), GÖRSEL (galeriden yükle), BUTON (bir özelliğe götürür, telefonu arar veya link açar).',
      'Blokları ekle, yukarı/aşağı taşıyarak sırala, sil. "Önizle" ile gerçek görünümü gör, "Kaydet" ile yayınla.',
      'İpucu: en üste kısa bir karşılama metni + bir "Randevu Al" butonu koy; müşteri girer girmez ne yapacağını bilsin.',
    ],
  },
  {
    icon: 'apps-outline', title: 'Özellikler (modüller) nasıl çalışır?',
    modules: true,
  },
  {
    icon: 'lock-closed-outline', title: 'Kayıt sistemi & hesap açma',
    body: [
      'Mini app\'ini "Özel (kayıt sistemi)" yaparsan, herkes giremez — sadece senin izin verdiğin kişiler kullanır. Sadece özel danışanlarla çalışan işletmeler için idealdir.',
      'İşletme ekranı > Erişim > "Özel (kayıt sistemi)" seç. Sonra "Kullanıcılar" ekranını aç.',
      'HESAP AÇ: kullanıcı adı + şifre belirleyip kişiye verirsin. Örnek: güzellik merkezine Ali geldi, "bana hesap açar mısın?" dedi. Sen kullanıcı adı "ali", şifre "12345" yaparsın ve Ali\'ye verirsin.',
      'Ali, Yapio giriş ekranında "Giriş" ile bu bilgilerle girer ve senin uygulamanı kullanır. Kullanıcı adı alınmışsa benzersiz bir ad seç (örn. isme şube ekle).',
      'Alternatif: KATILIM KODU. Kodu paylaşırsın, kodu girenler otomatik üye olur. Onay bekleyenleri de elle onaylar/çıkarırsın.',
    ],
  },
  {
    icon: 'calendar-outline', title: 'Randevu sistemi (Booking)',
    body: [
      'Önce "Çalışma Saatleri"ni gir (açılış–kapanış). Sonra "Hizmetler" ekle: ad, süre (dk), fiyat.',
      'Müşteri mini app\'te hizmeti seçer, takvimden uygun günü seçer (dolu/geçmiş günler soluk, boş günler açık), boş saati seçip randevu alır. Çakışan saatler otomatik engellenir.',
      'Gelen randevuları "Yönet"ten onaylar veya iptal edersin.',
    ],
  },
  {
    icon: 'rocket-outline', title: 'Yayınlama & ücret',
    body: [
      'Hazır olunca "Yayınla". Yayınlamadan önce tahmini aylık ücret gösterilir.',
      'Abonelik YOK — sadece kullandığın kadar ödersin. Açtığın ağır modüller + aktif müşteri + bildirim + medya kullanımına göre hesaplanır.',
      'İlk birkaç aktif müşteri ücretsizdir; ötesi müşteri başına küçük bir ücrettir. Yayınlayınca app vitrinde görünür.',
    ],
  },
  {
    icon: 'card-outline', title: 'Ödeme ayarları',
    body: [
      'Müşteriden ücret alacaksan kendi ödeme geçidini (iyzico/Stripe) bağlarsın — para doğrudan sana gelir, Yapio araya girmez.',
      'İşletme ekranı > "Ödeme Ayarları" rehberini takip et.',
      'Not: Yapio yalnızca FİZİKSEL hizmet ödemelerini destekler (Apple kuralı). Dijital/online ürün satışı yapılamaz.',
    ],
  },
  {
    icon: 'shield-checkmark-outline', title: 'Güvenlik & sorumluluk',
    body: [
      'Müşteri şifrelerini güvenli sakla, kimseyle paylaşma. Bir hesabı kapatmak için "Kullanıcılar"dan çıkar.',
      'Uygulama içi sohbetler denetlenebilir; yasa dışı içerik tespit edilirse platform müdahale edip işletmeyi askıya alabilir.',
      'Sözleşmelere ve KVKK\'ya uy. Sadece gerçek, izinli kişilere hesap aç.',
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
            Object.keys(MODULE_INFO).map((k) => (
              <View key={k} style={s.mod}>
                <View style={s.modHead}>
                  <Ionicons name={moduleIcon(k)} size={16} color={theme} />
                  <Text style={s.modLabel}>{MODULE_INFO[k].label}</Text>
                </View>
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

export default function Guide() {
  const router = useRouter();
  const [open, setOpen] = useState(0);
  const theme = COLORS.primary;
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={COLORS.primary} /><Text style={s.back}>Geri</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ padding: SIZES.pad, paddingBottom: 40 }}>
        <Text style={s.title}>Mini Admin Kılavuzu</Text>
        <Text style={s.sub}>Tüm özellikler, ayarlar ve adminlik adım adım. Bir başlığa dokun, açılsın.</Text>
        {SECTIONS.map((sec, i) => (
          <Item key={i} section={sec} theme={theme} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingHorizontal: SIZES.pad, paddingVertical: 8 },
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
