// Müşteri ekip görünümü: çalışanlar.
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getItems } from '../../api/client';
import { COLORS } from '../../theme';
import { useLang } from '../../i18n';

export default function Staff({ businessId, theme }) {
  const { t } = useLang();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    try { setItems(await getItems(businessId, 'staff')); } finally { setLoading(false); }
  }, [businessId]);
  useEffect(() => { load(); }, [load]);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={theme} />;
  if (!items.length) return <View style={s.empty}><Ionicons name="people-outline" size={48} color={COLORS.muted} /><Text style={s.emptyText}>{t('no_team')}</Text></View>;

  return (
    <ScrollView contentContainerStyle={s.wrap}>
      {items.map((it) => (
        <View key={it.id} style={s.row}>
          <View style={[s.avatar, { backgroundColor: theme }]}><Text style={s.avatarText}>{(it.data.name || '?')[0].toUpperCase()}</Text></View>
          <View style={{ flex: 1 }}><Text style={s.name}>{it.data.name}</Text>{it.data.role ? <Text style={s.role}>{it.data.role}</Text> : null}</View>
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
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8 },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 19 },
  name: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  role: { fontSize: 13, color: COLORS.muted, marginTop: 1 },
});
