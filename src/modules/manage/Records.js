// Satıcı ölçüm görünümü: tüm müşterilerin ölçümleri (müşteriye göre gruplu, salt-okunur).
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { getEntries } from '../../api/client';
import { COLORS } from '../../theme';

export default function ManageRecords({ businessId, theme }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    try { setList((await getEntries(businessId, 'records')).entries || []); } finally { setLoading(false); }
  }, [businessId]);
  useEffect(() => { load(); }, [load]);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={theme} />;

  const byUser = {};
  list.forEach((e) => { const k = e.user_name || 'Müşteri'; (byUser[k] = byUser[k] || []).push(e); });

  return (
    <ScrollView contentContainerStyle={s.wrap}>
      <Text style={s.h}>Müşteri Ölçümleri</Text>
      {list.length === 0 && <Text style={s.empty}>Müşteriler ölçüm girince burada görünür.</Text>}
      {Object.entries(byUser).map(([name, recs]) => (
        <View key={name} style={s.card}>
          <Text style={s.who}>{name}</Text>
          {recs.map((e) => (
            <Text key={e.id} style={s.rec}>
              <Text style={s.date}>{e.data.date}  </Text>
              {[e.data.weight && `${e.data.weight}kg`, e.data.fat && `%${e.data.fat}`, e.data.muscle && `${e.data.muscle}`].filter(Boolean).join(' · ')}
              {e.data.note ? `  — ${e.data.note}` : ''}
            </Text>
          ))}
        </View>
      ))}
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 18 },
  h: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginBottom: 10 },
  empty: { color: COLORS.muted },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10 },
  who: { fontSize: 16, fontWeight: '800', color: COLORS.text, marginBottom: 6 },
  rec: { fontSize: 14, color: COLORS.text, marginTop: 3, lineHeight: 20 },
  date: { color: COLORS.muted, fontWeight: '600' },
});
