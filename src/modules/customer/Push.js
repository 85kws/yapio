// Müşteri bildirimleri: işletme duyuruları (uygulama içi).
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getItems } from '../../api/client';
import { useLang } from '../../i18n';
import { COLORS } from '../../theme';
import { SkeletonList, EmptyState, useRefresh } from '../../components/ui';

export default function Push({ businessId, theme }) {
  const { t } = useLang();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    try { setItems(await getItems(businessId, 'push')); } finally { setLoading(false); }
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
        <EmptyState icon="notifications-outline" text={t('no_announcements')} theme={theme} />
      ) : (
        items.map((it) => (
          <View key={it.id} style={s.card}>
            <View style={[s.dot, { backgroundColor: theme }]} />
            <View style={{ flex: 1 }}>
              <Text style={s.title}>{it.data.title}</Text>
              {it.data.body ? <Text style={s.body}>{it.data.body}</Text> : null}
              {it.data.date ? <Text style={s.date}>{new Date(it.data.date).toLocaleDateString('tr-TR')}</Text> : null}
            </View>
          </View>
        ))
      )}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 18, flexGrow: 1 },
  card: { flexDirection: 'row', gap: 12, backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10 },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 6 },
  title: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  body: { fontSize: 14, color: COLORS.muted, marginTop: 4, lineHeight: 20 },
  date: { fontSize: 12, color: COLORS.muted, marginTop: 6 },
});
