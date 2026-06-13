// Müşteri kampanya görünümü: aktif kampanya listesi.
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getItems } from '../../api/client';
import { useLang } from '../../i18n';
import { COLORS } from '../../theme';
import { SkeletonList, EmptyState, useRefresh } from '../../components/ui';

export default function Campaigns({ businessId, theme }) {
  const { t } = useLang();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    try { setItems(await getItems(businessId, 'campaigns')); } finally { setLoading(false); }
  }, [businessId]);
  useEffect(() => { load(); }, [load]);
  const { refreshing, onRefresh } = useRefresh(load);

  return (
    <ScrollView
      contentContainerStyle={s.wrap}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme} colors={[theme]} />}
    >
      {loading ? (
        <SkeletonList theme={theme} />
      ) : !items.length ? (
        <EmptyState icon="megaphone-outline" text={t('no_campaigns')} theme={theme} />
      ) : (
        items.map((it) => (
          <View key={it.id} style={[s.card, { borderLeftColor: theme }]}>
            {it.data.discount ? <View style={[s.badge, { backgroundColor: theme }]}><Text style={s.badgeText}>{it.data.discount}</Text></View> : null}
            <Text style={s.title}>{it.data.title}</Text>
            {it.data.desc ? <Text style={s.desc}>{it.data.desc}</Text> : null}
          </View>
        ))
      )}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 18, flexGrow: 1 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, borderLeftWidth: 5 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10, marginBottom: 8 },
  badgeText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  title: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  desc: { fontSize: 14, color: COLORS.muted, marginTop: 4, lineHeight: 20 },
});
