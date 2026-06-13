// Müşteri takip: günlük su/kalori gir, geçmişi gör. (Adım için ayrı "Adım Sayar" modülü var.)
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getEntries, createEntry } from '../../api/client';
import { useLang } from '../../i18n';
import { COLORS } from '../../theme';
import { localDate } from '../../dates';
import { SkeletonList, useRefresh } from '../../components/ui';
import { success } from '../../haptics';

export default function Tracker({ businessId, theme }) {
  const { t } = useLang();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [f, setF] = useState({ water: '', calorie: '' });

  const load = useCallback(async () => {
    try { setList((await getEntries(businessId, 'tracker')).entries || []); } finally { setLoading(false); }
  }, [businessId]);
  useEffect(() => { load(); }, [load]);
  const { refreshing, onRefresh } = useRefresh(load);

  const add = async () => {
    if (!f.water && !f.calorie) return;
    await createEntry(businessId, 'tracker', { date: localDate(), water: Number(f.water) || 0, calorie: Number(f.calorie) || 0 });
    setF({ water: '', calorie: '' }); success(); load();
  };

  if (loading) return <SkeletonList theme={theme} rows={3} />;

  const today = localDate();
  const todays = list.filter((e) => e.data.date === today);
  const sum = (k) => todays.reduce((a, e) => a + (e.data[k] || 0), 0);

  return (
    <ScrollView
      contentContainerStyle={s.wrap}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme} colors={[theme]} />}
    >
      <Text style={s.h}>{t('today')}</Text>
      <View style={s.stats}>
        <Stat icon="water" label={t('water_ml')} val={sum('water')} theme={theme} />
        <Stat icon="flame" label={t('calorie')} val={sum('calorie')} theme={theme} />
      </View>

      <Text style={s.h}>{t('add_entry')}</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Inp v={f.water} on={(v) => setF({ ...f, water: v })} ph={t('water_ml')} />
        <Inp v={f.calorie} on={(v) => setF({ ...f, calorie: v })} ph={t('calorie')} />
      </View>
      <TouchableOpacity style={[s.btn, { backgroundColor: theme }]} onPress={add}><Text style={s.btnText}>{t('add')}</Text></TouchableOpacity>

      <Text style={s.h}>{t('history')}</Text>
      {list.slice(0, 14).map((e) => (
        <View key={e.id} style={s.row}>
          <Text style={s.date}>{e.data.date}</Text>
          <Text style={s.vals}>{e.data.water || 0} ml · {e.data.calorie || 0} kcal</Text>
        </View>
      ))}
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const Stat = ({ icon, label, val, theme }) => (
  <View style={s.stat}>
    <Ionicons name={icon} size={22} color={theme} />
    <Text style={s.statVal}>{val}</Text>
    <Text style={s.statLabel}>{label}</Text>
  </View>
);
const Inp = ({ v, on, ph }) => <TextInput style={s.input} value={v} onChangeText={on} placeholder={ph} keyboardType="number-pad" placeholderTextColor="#B0B0C0" />;

const s = StyleSheet.create({
  wrap: { padding: 18 },
  h: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginTop: 14, marginBottom: 10 },
  stats: { flexDirection: 'row', gap: 10 },
  stat: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 16, alignItems: 'center', gap: 4 },
  statVal: { fontSize: 22, fontWeight: '900', color: COLORS.text },
  statLabel: { fontSize: 12, color: COLORS.muted },
  input: { flex: 1, backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, fontSize: 15, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border },
  btn: { borderRadius: 12, paddingVertical: 13, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 6 },
  date: { fontSize: 13, color: COLORS.muted, fontWeight: '600' },
  vals: { fontSize: 14, color: COLORS.text, fontWeight: '600' },
});
