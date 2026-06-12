// Satıcı profil yönetimi: açıklama, adres, telefon, çalışma saatleri.
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { getBusiness, updateBusiness } from '../../api/client';
import { useLang } from '../../i18n';
import { COLORS } from '../../theme';

export default function ManageProfile({ businessId, theme }) {
  const { t } = useLang();
  const [f, setF] = useState({ description: '', address: '', phone: '', open: '09:00', close: '19:00' });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const b = (await getBusiness(businessId)).business || {};
      setF({ description: b.description || '', address: b.address || '', phone: b.phone || '', open: b.hours_json?.open || '09:00', close: b.hours_json?.close || '19:00' });
    } finally { setLoading(false); }
  }, [businessId]);
  useEffect(() => { load(); }, [load]);

  const save = async () => {
    await updateBusiness(businessId, { description: f.description, address: f.address, phone: f.phone, hours_json: { open: f.open, close: f.close } });
    Alert.alert(t('saved'), t('profile_updated'));
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={theme} />;
  return (
    <ScrollView contentContainerStyle={s.wrap}>
      <Field label={t('desc_label')} value={f.description} onChange={(v) => setF({ ...f, description: v })} multi />
      <Field label={t('address_label')} value={f.address} onChange={(v) => setF({ ...f, address: v })} />
      <Field label={t('phone_label')} value={f.phone} onChange={(v) => setF({ ...f, phone: v })} kb="phone-pad" />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}><Field label={t('open_time')} value={f.open} onChange={(v) => setF({ ...f, open: v })} /></View>
        <View style={{ flex: 1 }}><Field label={t('close_time')} value={f.close} onChange={(v) => setF({ ...f, close: v })} /></View>
      </View>
      <TouchableOpacity style={[s.btn, { backgroundColor: theme }]} onPress={save}><Text style={s.btnText}>{t('save')}</Text></TouchableOpacity>
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const Field = ({ label, value, onChange, multi, kb }) => (
  <View style={{ marginBottom: 14 }}>
    <Text style={s.label}>{label}</Text>
    <TextInput style={[s.input, multi && { minHeight: 80, textAlignVertical: 'top' }]} value={value} onChangeText={onChange} multiline={multi} keyboardType={kb} placeholderTextColor="#B0B0C0" />
  </View>
);

const s = StyleSheet.create({
  wrap: { padding: 18 },
  label: { fontSize: 13, fontWeight: '700', color: COLORS.muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, fontSize: 15, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border },
  btn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
