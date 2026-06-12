// İşletme hesabı başvurusu — yasal bilgiler (Apple Developer kaydı benzeri). Manuel onaya gider.
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { sellerApply } from '../src/api/client';
import { useAuth } from '../src/context/AuthContext';
import { COLORS, SIZES } from '../src/theme';
import { useLang } from '../src/i18n';

export default function SellerApply() {
  const router = useRouter();
  const { setUser } = useAuth();
  const { t } = useLang();
  const [type, setType] = useState('individual');
  const [f, setF] = useState({ legal_name: '', company_title: '', national_id: '', tax_no: '', tax_office: '', address: '', city: '', phone: '', email: '', website: '', business_type: '', employee_count: '', offerings: '' });
  const [hasLocation, setHasLocation] = useState('yes');
  const [agree, setAgree] = useState(false);
  const [ackSales, setAckSales] = useState(false);
  const [busy, setBusy] = useState(false);
  const set = (k) => (v) => setF((s) => ({ ...s, [k]: v }));

  const submit = async () => {
    if (!agree) return Alert.alert('Onay gerekli', 'Satıcı sözleşmesini onaylamalısın.');
    if (!ackSales) return Alert.alert('Onay gerekli', 'Online ürün satışı yapılamayacağını onaylamalısın.');
    setBusy(true);
    try {
      const user = await sellerApply({ account_type: type, ...f, has_location: hasLocation, agreement: true, no_online_sales_ack: true });
      setUser(user);
      Alert.alert('Başvuru alındı', 'Başvurun incelemeye gönderildi. Onaylanınca işletme app\'i kurabilirsin.', [
        { text: 'Tamam', onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert('Hata', e?.response?.data?.error || 'Başvuru gönderilemedi');
    } finally { setBusy(false); }
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={COLORS.primary} />
          <Text style={s.back}>{t('back')}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ padding: SIZES.pad, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <Text style={s.title}>İşletme Hesabı Başvurusu</Text>
        <Text style={s.sub}>Bu bilgiler hem seni hem platformu yasal olarak korur. Doğru ve eksiksiz doldur.</Text>

        <Text style={s.label}>Hesap tipi</Text>
        <View style={s.segment}>
          {[['individual', t('individual')], ['company', t('company')]].map(([v, l]) => (
            <TouchableOpacity key={v} style={[s.segItem, type === v && s.segActive]} onPress={() => setType(v)}>
              <Text style={[s.segText, type === v && s.segTextActive]}>{l}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Field label={type === 'company' ? 'Yetkili Ad Soyad *' : 'Ad Soyad *'} value={f.legal_name} onChange={set('legal_name')} placeholder="Yasal ad" />
        {type === 'company' ? (
          <>
            <Field label="Ticari Unvan *" value={f.company_title} onChange={set('company_title')} placeholder="Örn: ABC Güzellik Ltd. Şti." />
            <Field label="Vergi No *" value={f.tax_no} onChange={set('tax_no')} placeholder="Vergi numarası" keyboardType="number-pad" />
            <Field label="Vergi Dairesi" value={f.tax_office} onChange={set('tax_office')} placeholder="Örn: Çankaya VD" />
          </>
        ) : (
          <Field label="TC Kimlik No *" value={f.national_id} onChange={set('national_id')} placeholder="11 haneli TCKN" keyboardType="number-pad" />
        )}
        <Field label="Adres *" value={f.address} onChange={set('address')} placeholder="Açık adres" />
        <Field label="Şehir *" value={f.city} onChange={set('city')} placeholder="Ankara" />
        <Field label="Telefon *" value={f.phone} onChange={set('phone')} placeholder="+90..." keyboardType="phone-pad" />
        <Field label="E-posta" value={f.email} onChange={set('email')} placeholder="ornek@eposta.com" keyboardType="email-address" />
        <Field label="Web / Instagram" value={f.website} onChange={set('website')} placeholder="@kullanici veya https://" />

        <Text style={s.heading}>İşletmen hakkında</Text>
        <Field label="Ne tür bir işletme? *" value={f.business_type} onChange={set('business_type')} placeholder="Örn: Erkek kuaförü, restoran, diyetisyen" />
        <Field label="Çalışan sayısı" value={f.employee_count} onChange={set('employee_count')} placeholder="Örn: 3" keyboardType="number-pad" />
        <Text style={s.label}>Fiziksel mekanın var mı?</Text>
        <View style={s.segment}>
          {[['yes', 'Evet'], ['no', 'Hayır']].map(([v, l]) => (
            <TouchableOpacity key={v} style={[s.segItem, hasLocation === v && s.segActive]} onPress={() => setHasLocation(v)}>
              <Text style={[s.segText, hasLocation === v && s.segTextActive]}>{l}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Field label="Hangi hizmetleri sunuyorsun?" value={f.offerings} onChange={set('offerings')} placeholder="Kısaca yaz" />

        <View style={s.warnBox}>
          <Ionicons name="information-circle" size={22} color="#B7791F" />
          <Text style={s.warnText}>
            yapp'te yalnızca <Text style={{ fontWeight: '800' }}>fiziksel hizmet</Text> sunabilirsin (randevu, üyelik, seans, masa siparişi). Uygulama içinde <Text style={{ fontWeight: '800' }}>dijital/online ürün satışı yapılamaz</Text> (Apple kuralı). Ödemeler kendi iyzico/Stripe hesabına geçer.
          </Text>
        </View>
        <TouchableOpacity style={s.agreeRow} onPress={() => setAckSales((v) => !v)} activeOpacity={0.7}>
          <View style={[s.checkbox, ackSales && s.checkboxOn]}>{ackSales ? <Ionicons name="checkmark" size={15} color="#fff" /> : null}</View>
          <Text style={s.agreeText}>Online/dijital ürün satışı yapamayacağımı anladım ve kabul ediyorum.</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.agreeRow} onPress={() => setAgree((v) => !v)} activeOpacity={0.7}>
          <View style={[s.checkbox, agree && s.checkboxOn]}>{agree ? <Ionicons name="checkmark" size={15} color="#fff" /> : null}</View>
          <Text style={s.agreeText}>
            <Text style={s.link} onPress={() => router.push('/terms')}>Satıcı Sözleşmesi ve Kullanım Şartları</Text>'nı okudum, kabul ediyorum. Verdiğim bilgilerin doğru olduğunu beyan ederim.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={[s.submitBtn, (!agree || !ackSales) && { opacity: 0.4 }]} onPress={submit} disabled={busy}>
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={s.submitText}>Başvuruyu Gönder</Text>}
        </TouchableOpacity>
        <Text style={s.note}>Başvurun manuel incelenir. Onaylanınca işletme app'i kurabilirsin.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const Field = ({ label, value, onChange, placeholder, keyboardType }) => (
  <View style={{ marginBottom: 14 }}>
    <Text style={s.label}>{label}</Text>
    <TextInput style={s.input} value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor="#B0B0C0" keyboardType={keyboardType} autoCapitalize="none" />
  </View>
);

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingHorizontal: SIZES.pad, paddingVertical: 8 },
  backBtn: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' },
  back: { color: COLORS.primary, fontSize: 17, fontWeight: '600' },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.text },
  sub: { fontSize: 14, color: COLORS.muted, marginTop: 6, marginBottom: 18, lineHeight: 20 },
  label: { fontSize: 13, fontWeight: '700', color: COLORS.muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 16, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border },
  segment: { flexDirection: 'row', backgroundColor: '#ECECF4', borderRadius: 12, padding: 4, marginBottom: 14 },
  segItem: { flex: 1, paddingVertical: 11, borderRadius: 9, alignItems: 'center' },
  segActive: { backgroundColor: '#fff' },
  segText: { fontWeight: '700', color: COLORS.muted },
  segTextActive: { color: COLORS.primary },
  heading: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginTop: 8, marginBottom: 12 },
  warnBox: { flexDirection: 'row', gap: 12, backgroundColor: '#FFF7E6', borderRadius: 14, padding: 16, marginTop: 8, marginBottom: 6 },
  warnText: { flex: 1, fontSize: 13, color: COLORS.text, lineHeight: 20 },
  agreeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 6, marginBottom: 18 },
  checkbox: { width: 24, height: 24, borderRadius: 7, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  checkboxOn: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  agreeText: { flex: 1, fontSize: 13, color: COLORS.muted, lineHeight: 19 },
  link: { color: COLORS.primary, fontWeight: '700' },
  submitBtn: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  submitText: { color: '#fff', fontWeight: '800', fontSize: 17 },
  note: { textAlign: 'center', color: COLORS.muted, fontSize: 13, marginTop: 12 },
});
