// Satıcı üyelik yönetimi: planlar (CRUD) + üyeler + giriş (check-in).
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getItems, createItem, deleteItem, getEntries, updateEntry } from '../../api/client';
import { COLORS } from '../../theme';
import { useLang } from '../../i18n';
import QRScanner from '../../components/QRScanner';

export default function ManageSubscriptions({ businessId, theme }) {
  const { t } = useLang();
  const [plans, setPlans] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [f, setF] = useState({ name: '', price: '', period: 'ay' });
  const [scanOpen, setScanOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const [its, ent] = await Promise.all([getItems(businessId, 'subscriptions'), getEntries(businessId, 'subscriptions')]);
      setPlans(its); setMembers((ent.entries || []).filter((e) => e.status !== 'cancelled'));
    } finally { setLoading(false); }
  }, [businessId]);
  useEffect(() => { load(); }, [load]);

  const add = async () => {
    if (!f.name.trim()) return;
    await createItem(businessId, 'subscriptions', { name: f.name.trim(), price: Number(f.price) || 0, period: f.period });
    setF({ name: '', price: '', period: 'ay' }); load();
  };
  const checkin = async (m) => { await updateEntry(businessId, 'subscriptions', m.id, { data: { ...m.data, checkins: (m.data.checkins || 0) + 1 } }); load(); };

  // QR okutunca: yapio:sub:<businessId>:<entryId> → ilgili üyeye +1 check-in.
  const onScan = async (raw) => {
    setScanOpen(false);
    const p = String(raw).split(':');
    const m = (p[0] === 'yapio' && p[1] === 'sub' && String(p[2]) === String(businessId))
      ? members.find((x) => String(x.id) === String(p[3])) : null;
    if (!m) return Alert.alert(t('invalid_qr_title'), t('invalid_qr_body'));
    await checkin(m);
    Alert.alert(t('checkin_done'), `${m.user_name || t('member')} · ${(m.data.checkins || 0) + 1} ${t('entries_word')}`);
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={theme} />;
  return (
    <ScrollView contentContainerStyle={s.wrap}>
      <Text style={s.h}>{t('plans_h')}</Text>
      {plans.map((p) => (
        <View key={p.id} style={s.row}>
          <View style={{ flex: 1 }}><Text style={s.name}>{p.data.name}</Text><Text style={s.meta}>{p.data.price} ₺ / {p.data.period}</Text></View>
          <TouchableOpacity onPress={() => deleteItem(businessId, 'subscriptions', p.id).then(load)}><Ionicons name="trash-outline" size={20} color={COLORS.danger} /></TouchableOpacity>
        </View>
      ))}
      <View style={s.addBox}>
        <TextInput style={[s.input, { flex: 2 }]} value={f.name} onChangeText={(v) => setF({ ...f, name: v })} placeholder={t('plan_name_ph')} placeholderTextColor="#B0B0C0" />
        <TextInput style={[s.input, { flex: 1 }]} value={f.price} onChangeText={(v) => setF({ ...f, price: v })} placeholder="₺" keyboardType="number-pad" placeholderTextColor="#B0B0C0" />
        <TouchableOpacity style={[s.addBtn, { backgroundColor: theme }]} onPress={add}><Ionicons name="add" size={22} color="#fff" /></TouchableOpacity>
      </View>

      <View style={s.memberHead}>
        <Text style={s.h}>{t('members_label')} ({members.length})</Text>
        <TouchableOpacity style={[s.scanBtn, { backgroundColor: theme }]} onPress={() => setScanOpen(true)}>
          <Ionicons name="qr-code-outline" size={16} color="#fff" />
          <Text style={s.scanText}>{t('scan_qr')}</Text>
        </TouchableOpacity>
      </View>
      {members.length === 0 && <Text style={s.empty}>{t('no_members')}</Text>}
      {members.map((m) => (
        <View key={m.id} style={s.row}>
          <View style={{ flex: 1 }}>
            <Text style={s.name}>{m.user_name || t('member')} · #{m.id}</Text>
            <Text style={s.meta}>{m.data.plan_name} · {m.data.checkins || 0} {t('entries_word')}</Text>
          </View>
          <TouchableOpacity style={[s.checkBtn, { backgroundColor: theme }]} onPress={() => checkin(m)}><Text style={s.checkText}>{t('checkin_plus')}</Text></TouchableOpacity>
        </View>
      ))}
      <View style={{ height: 30 }} />
      <QRScanner visible={scanOpen} theme={theme} onClose={() => setScanOpen(false)} onScan={onScan} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 18 },
  h: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginTop: 14, marginBottom: 10 },
  empty: { color: COLORS.muted },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8 },
  name: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  meta: { fontSize: 13, color: COLORS.muted, marginTop: 2 },
  addBox: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  input: { backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, fontSize: 15, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border },
  addBtn: { width: 44, height: 42, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  checkBtn: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10 },
  checkText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  memberHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  scanBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  scanText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
