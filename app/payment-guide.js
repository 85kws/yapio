// Ödeme bağlama rehberi (in-app). DEV_ODEME_REHBERI.md içeriğinin uygulama içi hâli.
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../src/theme';

const Step = ({ n, title, children }) => (
  <View style={s.step}>
    <View style={s.stepNum}><Text style={s.stepNumText}>{n}</Text></View>
    <View style={{ flex: 1 }}>
      <Text style={s.stepTitle}>{title}</Text>
      <Text style={s.stepBody}>{children}</Text>
    </View>
  </View>
);

export default function PaymentGuide() {
  const router = useRouter();
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={COLORS.primary} />
          <Text style={s.back}>Geri</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ padding: SIZES.pad, paddingBottom: 40 }}>
        <Text style={s.title}>Ödeme Bağlama</Text>

        <View style={s.callout}>
          <Ionicons name="shield-checkmark" size={22} color={COLORS.success} />
          <Text style={s.calloutText}>
            Para <Text style={{ fontWeight: '800' }}>doğrudan senin banka hesabına</Text> gider. yapp paraya dokunmaz, kesmez. POS cihazı gibi düşün — biz sadece "öde" tuşunu senin hesabına bağlarız.
          </Text>
        </View>

        <Text style={s.h2}>iyzico (Türkiye — önerilen)</Text>
        <Step n="1" title="iyzico hesabı aç">iyzico.com → Üye Ol. İşletme adı, vergi no veya TC, telefon, e-posta ve <Text style={s.b}>IBAN</Text> (para buraya gelir) gir. Belge isterse foto yükle. Onay 1-2 iş günü.</Step>
        <Step n="2" title="API anahtarını al">iyzico → Ayarlar → API Anahtarları. İki uzun yazı var: <Text style={s.b}>API Key</Text> ve <Text style={s.b}>Secret Key</Text>. Kopyala (elle yazma).</Step>
        <Step n="3" title="yapp'e yapıştır">Buradan "iyzico Bağla" → iki kutuya yapıştır → Kaydet ve Test Et. Yeşil "Bağlantı başarılı" görünce bitti.</Step>

        <Text style={s.h2}>Stripe (döviz / yurtdışı)</Text>
        <Step n="1" title="Stripe hesabı aç">stripe.com → Sign up. Ülke, işletme tipi, IBAN gir.</Step>
        <Step n="2" title="Tek tuşla bağla">"Stripe Bağla" → Stripe'a giriş → "yapp'e izin ver" → Onayla. Otomatik döner, bitti. (API kopyalama yok.)</Step>

        <Text style={s.h2}>Bağladıktan sonra</Text>
        <Text style={s.p}>• Müşteri app'inde "Öde" der, kart girer.{'\n'}• Para senin iyzico/Stripe hesabına düşer.{'\n'}• Banka komisyonu (~%2-3) iyzico/Stripe'ındır, yapp'in değil.{'\n'}• Hesabına 1-3 iş gününde geçer.{'\n'}• Kart bilgisi yapp'e veya sana hiç gelmez (PCI güvenli).</Text>

        <View style={s.note}>
          <Ionicons name="information-circle" size={18} color={COLORS.muted} />
          <Text style={s.noteText}>Sadece fiziksel hizmet (randevu, üyelik, seans) için. Apple kuralı gereği uygulama içi dijital içerik satışı bu yöntemle yapılamaz.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingHorizontal: SIZES.pad, paddingVertical: 10 },
  backBtn: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' },
  back: { color: COLORS.primary, fontSize: 17, fontWeight: '600' },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.text, marginBottom: 16 },
  callout: { flexDirection: 'row', gap: 12, backgroundColor: '#E7F7EF', borderRadius: 14, padding: 16, marginBottom: 20 },
  calloutText: { flex: 1, fontSize: 14, color: COLORS.text, lineHeight: 21 },
  h2: { fontSize: 19, fontWeight: '800', color: COLORS.text, marginTop: 18, marginBottom: 12 },
  step: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  stepNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  stepNumText: { color: '#fff', fontWeight: '800' },
  stepTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 3 },
  stepBody: { fontSize: 14, color: COLORS.muted, lineHeight: 21 },
  b: { fontWeight: '700', color: COLORS.text },
  p: { fontSize: 14, color: COLORS.text, lineHeight: 24 },
  note: { flexDirection: 'row', gap: 10, backgroundColor: '#F1F1F7', borderRadius: 12, padding: 14, marginTop: 18 },
  noteText: { flex: 1, fontSize: 13, color: COLORS.muted, lineHeight: 19 },
});
