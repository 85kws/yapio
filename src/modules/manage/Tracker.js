// Satıcı takip görünümü: müşterilerin son takip kayıtları (salt-okunur).
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { getEntries } from '../../api/client';
import { useLang } from '../../i18n';
import { COLORS } from '../../theme';

export default function ManageTracker({ businessId, theme }) {
  const { t } = useLang();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    try { setList((await getEntries(businessId, 'tracker')).entries || []); } finally { setLoading(false); }
  }, [businessId]);
  useEffect(() => { load(); }, [load]);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={theme} />;
  const byUser = {};
  list.forEach((e) => { const k = e.user_name || t('user'); (byUser[k] = byUser[k] || []).push(e); });

  return (
    <ScrollView contentContainerStyle={s.wrap}>
      <Text style={s.h}>{t('customer_tracking')}</Text>
      {list.length === 0 && <Text style={s.empty}>{t('tracking_empty')}</Text>}
      {Object.entries(byUser).map(([name, recs]) => (
        <View key={name} style={s.card}>
          <Text style={s.who}>{name}</Text>
          {recs.slice(0, 5).map((e) => (
            <Text key={e.id} style={s.rec}><Text style={s.date}>{e.data.date}  </Text>{e.data.steps || 0} {t('steps_word')} · {e.data.water || 0} ml · {e.data.calorie || 0} kcal</Text>
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
  rec: { fontSize: 14, color: COLORS.text, marginTop: 3 },
  date: { color: COLORS.muted, fontWeight: '600' },
});
