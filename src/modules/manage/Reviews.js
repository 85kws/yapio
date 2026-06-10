// Satıcı yorum görünümü: ortalama + tüm yorumlar (salt-okunur).
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getEntries } from '../../api/client';
import { COLORS } from '../../theme';

export default function ManageReviews({ businessId, theme }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    try { setList((await getEntries(businessId, 'reviews')).entries || []); } finally { setLoading(false); }
  }, [businessId]);
  useEffect(() => { load(); }, [load]);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={theme} />;
  const avg = list.length ? (list.reduce((a, e) => a + (e.data.rating || 0), 0) / list.length).toFixed(1) : '—';

  return (
    <ScrollView contentContainerStyle={s.wrap}>
      <View style={s.avgBox}>
        <Text style={[s.avgNum, { color: theme }]}>{avg}</Text>
        <View style={{ flexDirection: 'row' }}>{[1, 2, 3, 4, 5].map((i) => <Ionicons key={i} name={i <= Math.round(Number(avg) || 0) ? 'star' : 'star-outline'} size={18} color={theme} />)}</View>
        <Text style={s.avgCount}>{list.length} değerlendirme</Text>
      </View>
      {list.map((e) => (
        <View key={e.id} style={s.row}>
          <View style={s.rowTop}>
            <Text style={s.who}>{e.user_name || 'Müşteri'}</Text>
            <View style={{ flexDirection: 'row' }}>{[1, 2, 3, 4, 5].map((i) => <Ionicons key={i} name={i <= (e.data.rating || 0) ? 'star' : 'star-outline'} size={14} color={theme} />)}</View>
          </View>
          {e.data.comment ? <Text style={s.comment}>{e.data.comment}</Text> : null}
        </View>
      ))}
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 18 },
  avgBox: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 20, gap: 6, marginBottom: 14 },
  avgNum: { fontSize: 44, fontWeight: '900' },
  avgCount: { color: COLORS.muted, fontSize: 13 },
  row: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  who: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  comment: { fontSize: 14, color: COLORS.muted, marginTop: 4, lineHeight: 20 },
});
