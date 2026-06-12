// Satıcı randevu yönetimi: hizmetler (CRUD), çalışma saatleri, gelen randevular.
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getItems, createItem, deleteItem, getEntries, updateEntry, getBusiness, updateBusiness } from '../../api/client';
import { useLang } from '../../i18n';
import { COLORS } from '../../theme';

export default function ManageBooking({ businessId, theme }) {
  const { t } = useLang();
  const [services, setServices] = useState([]);
  const [appts, setAppts] = useState([]);
  const [hours, setHours] = useState({ open: '09:00', close: '19:00' });
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [dur, setDur] = useState('30');
  const [price, setPrice] = useState('');

  const load = useCallback(async () => {
    try {
      const [its, ent, biz] = await Promise.all([getItems(businessId, 'booking'), getEntries(businessId, 'booking'), getBusiness(businessId)]);
      setServices(its); setAppts(ent.entries || []);
      if (biz.business?.hours_json?.open) setHours({ open: biz.business.hours_json.open, close: biz.business.hours_json.close || '19:00' });
    } catch (e) { console.warn(e?.message); } finally { setLoading(false); }
  }, [businessId]);
  useEffect(() => { load(); }, [load]);

  const addService = async () => {
    if (!name.trim()) return;
    await createItem(businessId, 'booking', { name: name.trim(), duration_min: Number(dur) || 30, price: Number(price) || 0 });
    setName(''); setDur('30'); setPrice(''); load();
  };
  const saveHours = async () => { await updateBusiness(businessId, { hours_json: hours }); Alert.alert(t('saved'), `${t('hours_saved')}: ${hours.open}-${hours.close}`); };
  const setStatus = async (id, status) => { await updateEntry(businessId, 'booking', id, { status }); load(); };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={theme} />;

  const pending = appts.filter((a) => a.status !== 'cancelled');

  return (
    <ScrollView contentContainerStyle={s.wrap}>
      <Text style={s.h}>{t('working_hours')}</Text>
      <View style={s.hoursRow}>
        <TimeBox label={t('open_time')} value={hours.open} onChange={(v) => setHours((h) => ({ ...h, open: v }))} />
        <TimeBox label={t('close_time')} value={hours.close} onChange={(v) => setHours((h) => ({ ...h, close: v }))} />
        <TouchableOpacity style={[s.saveBtn, { backgroundColor: theme }]} onPress={saveHours}><Text style={s.saveText}>{t('save')}</Text></TouchableOpacity>
      </View>

      <Text style={s.h}>{t('services')}</Text>
      {services.map((sv) => (
        <View key={sv.id} style={s.svc}>
          <View style={{ flex: 1 }}>
            <Text style={s.svcName}>{sv.data.name}</Text>
            <Text style={s.svcMeta}>{sv.data.duration_min} {t('dk')}{sv.data.price ? ` · ${sv.data.price} ₺` : ''}</Text>
          </View>
          <TouchableOpacity onPress={() => { deleteItem(businessId, 'booking', sv.id).then(load); }}><Ionicons name="trash-outline" size={20} color={COLORS.danger} /></TouchableOpacity>
        </View>
      ))}
      <View style={s.addBox}>
        <TextInput style={[s.input, { flex: 2 }]} value={name} onChangeText={setName} placeholder={t('service_name_ph')} placeholderTextColor="#B0B0C0" />
        <TextInput style={[s.input, { flex: 1 }]} value={dur} onChangeText={setDur} placeholder={t('dk')} keyboardType="number-pad" placeholderTextColor="#B0B0C0" />
        <TextInput style={[s.input, { flex: 1 }]} value={price} onChangeText={setPrice} placeholder="₺" keyboardType="number-pad" placeholderTextColor="#B0B0C0" />
        <TouchableOpacity style={[s.addBtn, { backgroundColor: theme }]} onPress={addService}><Ionicons name="add" size={22} color="#fff" /></TouchableOpacity>
      </View>

      <Text style={s.h}>{t('appointments')} ({pending.length})</Text>
      {pending.length === 0 && <Text style={s.empty}>{t('no_appointments')}</Text>}
      {pending.map((a) => (
        <View key={a.id} style={s.appt}>
          <View style={{ flex: 1 }}>
            <Text style={s.apptName}>{a.data.service_name} · {a.user_name || 'Müşteri'}</Text>
            <Text style={s.apptMeta}>{a.data.date} · {a.data.time}{a.status === 'confirmed' ? ` · ${t('confirmed_short')}` : ''}</Text>
          </View>
          {a.status !== 'confirmed' && (
            <TouchableOpacity style={[s.miniBtn, { backgroundColor: theme }]} onPress={() => setStatus(a.id, 'confirmed')}><Text style={s.miniText}>{t('approve')}</Text></TouchableOpacity>
          )}
          <TouchableOpacity style={s.miniGhost} onPress={() => setStatus(a.id, 'cancelled')}><Text style={s.miniGhostText}>{t('cancel_short')}</Text></TouchableOpacity>
        </View>
      ))}
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const TimeBox = ({ label, value, onChange }) => (
  <View style={{ flex: 1 }}>
    <Text style={s.tLabel}>{label}</Text>
    <TextInput style={s.input} value={value} onChangeText={onChange} placeholder="09:00" placeholderTextColor="#B0B0C0" />
  </View>
);

const s = StyleSheet.create({
  wrap: { padding: 18 },
  h: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginTop: 16, marginBottom: 10 },
  empty: { color: COLORS.muted, fontSize: 14 },
  hoursRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  tLabel: { fontSize: 12, color: COLORS.muted, fontWeight: '600', marginBottom: 4 },
  input: { backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border },
  saveBtn: { paddingHorizontal: 16, paddingVertical: 11, borderRadius: 10 },
  saveText: { color: '#fff', fontWeight: '700' },
  svc: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8 },
  svcName: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  svcMeta: { fontSize: 13, color: COLORS.muted, marginTop: 2 },
  addBox: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  addBtn: { width: 44, height: 42, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  appt: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8 },
  apptName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  apptMeta: { fontSize: 13, color: COLORS.muted, marginTop: 2 },
  miniBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 9 },
  miniText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  miniGhost: { paddingHorizontal: 10, paddingVertical: 8 },
  miniGhostText: { color: COLORS.danger, fontWeight: '700', fontSize: 13 },
});
