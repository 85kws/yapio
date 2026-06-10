// Müşteri ödemeleri: kendi ödeme kayıtları (salt-okunur).
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getEntries } from '../../api/client';
import { COLORS } from '../../theme';

export default function Payments({ businessId, theme }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    try { setList((await getEntries(businessId, 'payments')).entries || []); } finally { setLoading(false); }
  }, [businessId]);
  useEffect(() => { load(); }, [load]);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={theme} />;
  if (!list.length) return <View style={s.empty}><Ionicons name="card-outline" size={48} color={COLORS.muted} /><Text style={s.emptyText}>Ödeme kaydın yok.</Text></View>;

  const total = list.reduce((a, e) => a + (e.data.amount || 0), 0);
  return (
    <ScrollView contentContainerStyle={s.wrap}>
      <View style={[s.totalBox, { backgroundColor: theme }]}>
        <Text style={s.totalLabel}>Toplam Ödeme</Text>
        <Text style={s.totalNum}>{total.toLocaleString('tr-TR')} ₺</Text>
      </View>
      {list.map((e) => (
        <View key={e.id} style={s.row}>
          <View style={{ flex: 1 }}><Text style={s.amount}>{e.data.amount} ₺</Text><Text style={s.meta}>{e.data.date}{e.data.note ? ` — ${e.data.note}` : ''}</Text></View>
          <View style={[s.pill, { backgroundColor: COLORS.success + '18' }]}><Text style={[s.pillText, { color: COLORS.success }]}>Ödendi</Text></View>
        </View>
      ))}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 18 },
  empty: { padding: 50, alignItems: 'center', gap: 12 },
  emptyText: { color: COLORS.muted, fontSize: 15 },
  totalBox: { borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 14 },
  totalLabel: { color: '#fff', opacity: 0.9, fontWeight: '600' },
  totalNum: { color: '#fff', fontSize: 34, fontWeight: '900', marginTop: 4 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8 },
  amount: { fontSize: 17, fontWeight: '800', color: COLORS.text },
  meta: { fontSize: 13, color: COLORS.muted, marginTop: 2 },
  pill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  pillText: { fontWeight: '700', fontSize: 12 },
});
