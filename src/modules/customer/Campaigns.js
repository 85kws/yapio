// Müşteri kampanya görünümü: aktif kampanya listesi.
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getItems } from '../../api/client';
import { useLang } from '../../i18n';
import { COLORS } from '../../theme';

export default function Campaigns({ businessId, theme }) {
  const { t } = useLang();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    try { setItems(await getItems(businessId, 'campaigns')); } finally { setLoading(false); }
  }, [businessId]);
  useEffect(() => { load(); }, [load]);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={theme} />;
  if (!items.length) return <View style={s.empty}><Ionicons name="megaphone-outline" size={48} color={COLORS.muted} /><Text style={s.emptyText}>{t('no_campaigns')}</Text></View>;

  return (
    <ScrollView contentContainerStyle={s.wrap}>
      {items.map((it) => (
        <View key={it.id} style={[s.card, { borderLeftColor: theme }]}>
          {it.data.discount ? <View style={[s.badge, { backgroundColor: theme }]}><Text style={s.badgeText}>{it.data.discount}</Text></View> : null}
          <Text style={s.title}>{it.data.title}</Text>
          {it.data.desc ? <Text style={s.desc}>{it.data.desc}</Text> : null}
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
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, borderLeftWidth: 5 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10, marginBottom: 8 },
  badgeText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  title: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  desc: { fontSize: 14, color: COLORS.muted, marginTop: 4, lineHeight: 20 },
});
