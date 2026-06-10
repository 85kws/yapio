// Dev onboarding sihirbazı: sektör → şablon → bilgi → oluştur.
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getSectors, getTemplates, createBusiness } from '../src/api/client';
import { COLORS, SIZES } from '../src/theme';
import { sectorIcon, moduleIcon } from '../src/icons';
import { MODULE_INFO } from '../src/modules';
import ModuleInfoModal from '../src/components/ModuleInfoModal';

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [sectors, setSectors] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [sector, setSector] = useState(null);
  const [template, setTemplate] = useState(null);
  const [form, setForm] = useState({ name: '', address: '', phone: '', description: '' });
  const [busy, setBusy] = useState(false);
  const [infoModule, setInfoModule] = useState(null);

  useEffect(() => { getSectors().then(setSectors).catch(() => {}); }, []);
  useEffect(() => {
    if (sector) getTemplates(sector.key).then((t) => { setTemplates(t); setTemplate(t[0] || null); }).catch(() => {});
  }, [sector]);

  const create = async () => {
    if (!form.name.trim()) return Alert.alert('İsim gerekli', 'İşletme adını gir.');
    setBusy(true);
    try {
      const biz = await createBusiness({
        name: form.name.trim(), sector_key: sector.key, template_key: template?.key,
        address: form.address.trim() || undefined, phone: form.phone.trim() || undefined,
        description: form.description.trim() || undefined,
      });
      router.replace(`/business/${biz.id}`);
    } catch (e) {
      Alert.alert('Hata', e?.response?.data?.error || e?.message || 'Oluşturulamadı');
    } finally { setBusy(false); }
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => (step > 1 ? setStep(step - 1) : router.back())}>
          <Ionicons name="chevron-back" size={22} color={COLORS.primary} />
          <Text style={s.back}>Geri</Text>
        </TouchableOpacity>
        <Text style={s.stepLabel}>Adım {step}/3</Text>
        <View style={{ width: 60 }} />
      </View>
      <View style={s.progress}><View style={[s.progressFill, { width: `${(step / 3) * 100}%` }]} /></View>

      {step === 1 && (
        <>
          <Text style={s.title}>Sektörünü seç</Text>
          <ScrollView contentContainerStyle={s.gridWrap}>
            {sectors.map((sec) => (
              <TouchableOpacity key={sec.key} style={[s.sectorCard, sector?.key === sec.key && s.sectorActive]} onPress={() => { setSector(sec); setStep(2); }}>
                <View style={s.sectorIconBox}><Ionicons name={sectorIcon(sec.key)} size={28} color={COLORS.primary} /></View>
                <Text style={s.sectorName}>{sec.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}

      {step === 2 && (
        <>
          <Text style={s.title}>Şablon seç</Text>
          <Text style={s.sub}>{sector?.name} için hazır kurulum. Özelliğe dokun → ne yaptığını gör:</Text>
          <ScrollView contentContainerStyle={{ padding: SIZES.pad }}>
            {templates.map((t) => (
              <TouchableOpacity key={t.key} style={[s.tplCard, template?.key === t.key && { borderColor: t.color, borderWidth: 2 }]} onPress={() => setTemplate(t)}>
                <View style={s.tplHead}>
                  <View style={[s.tplIcon, { backgroundColor: t.color }]}><Ionicons name={sectorIcon(t.sector_key)} size={22} color="#fff" /></View>
                  <Text style={s.tplName}>{t.name}</Text>
                  {template?.key === t.key ? <Ionicons name="checkmark-circle" size={22} color={t.color} /> : null}
                </View>
                <View style={s.modules}>
                  {(t.modules || []).map((m) => (
                    <TouchableOpacity key={m} style={s.modChip} onPress={() => setInfoModule(m)}>
                      <Ionicons name={moduleIcon(m)} size={14} color={COLORS.text} />
                      <Text style={s.modText}>{MODULE_INFO[m]?.label || m}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={s.nextBtn} onPress={() => setStep(3)} disabled={!template}>
              <Text style={s.nextText}>Devam</Text>
            </TouchableOpacity>
          </ScrollView>
        </>
      )}

      {step === 3 && (
        <ScrollView contentContainerStyle={{ padding: SIZES.pad }}>
          <Text style={s.title}>İşletme bilgileri</Text>
          <Field label="İşletme adı *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Örn: Yiğit Berber" />
          <Field label="Kısa açıklama" value={form.description} onChange={(v) => setForm({ ...form, description: v })} placeholder="Müşteriye görünecek tanıtım" />
          <Field label="Adres" value={form.address} onChange={(v) => setForm({ ...form, address: v })} placeholder="Çankaya, Ankara" />
          <Field label="Telefon" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="+90..." keyboardType="phone-pad" />
          <TouchableOpacity style={s.createBtn} onPress={create} disabled={busy}>
            {busy ? <ActivityIndicator color="#fff" /> : <Text style={s.createText}>App'i Oluştur</Text>}
          </TouchableOpacity>
          <Text style={s.hint}>App taslak olarak kaydedilir. Sonra düzenleyip yayınlarsın.</Text>
        </ScrollView>
      )}

      <ModuleInfoModal moduleKey={infoModule} theme={template?.color || COLORS.primary} onClose={() => setInfoModule(null)} />
    </SafeAreaView>
  );
}

const Field = ({ label, value, onChange, placeholder, keyboardType }) => (
  <View style={{ marginBottom: 14 }}>
    <Text style={s.fieldLabel}>{label}</Text>
    <TextInput style={s.input} value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor="#B0B0C0" keyboardType={keyboardType} />
  </View>
);

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SIZES.pad, paddingVertical: 10 },
  backBtn: { flexDirection: 'row', alignItems: 'center' },
  back: { color: COLORS.primary, fontSize: 17, fontWeight: '600' },
  stepLabel: { color: COLORS.muted, fontWeight: '600' },
  progress: { height: 4, backgroundColor: COLORS.border, marginHorizontal: SIZES.pad, borderRadius: 2 },
  progressFill: { height: 4, backgroundColor: COLORS.primary, borderRadius: 2 },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.text, paddingHorizontal: SIZES.pad, paddingTop: 18, paddingBottom: 6 },
  sub: { fontSize: 14, color: COLORS.muted, paddingHorizontal: SIZES.pad, marginBottom: 6 },
  gridWrap: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', padding: SIZES.pad },
  sectorCard: { width: '48%', backgroundColor: COLORS.card, borderRadius: 16, padding: 18, marginBottom: 12, alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  sectorActive: { borderColor: COLORS.primary },
  sectorIconBox: { width: 52, height: 52, borderRadius: 14, backgroundColor: '#EEEcFB', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  sectorName: { fontSize: 14, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  tplCard: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 2, borderColor: 'transparent' },
  tplHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tplIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  tplName: { fontSize: 17, fontWeight: '700', color: COLORS.text, flex: 1 },
  check: { fontSize: 22, fontWeight: '800' },
  modules: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  modChip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#F1F1F7', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  modText: { fontSize: 12, color: COLORS.text, fontWeight: '600' },
  nextBtn: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  nextText: { color: '#fff', fontWeight: '800', fontSize: 17 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: COLORS.muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 16, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border },
  createBtn: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  createText: { color: '#fff', fontWeight: '800', fontSize: 17 },
  hint: { textAlign: 'center', color: COLORS.muted, fontSize: 13, marginTop: 12 },
});
