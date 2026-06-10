// Müşteri program görünümü: programları aç/oku.
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getItems } from '../../api/client';
import { COLORS } from '../../theme';

export default function Plans({ businessId, theme }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(null);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    try { setItems(await getItems(businessId, 'plans')); } finally { setLoading(false); }
  }, [businessId]);
  useEffect(() => { load(); }, [load]);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={theme} />;
  if (!items.length) return <View style={s.empty}><Ionicons name="clipboard-outline" size={48} color={COLORS.muted} /><Text style={s.emptyText}>Henüz program eklenmemiş.</Text></View>;

  return (
    <ScrollView contentContainerStyle={s.wrap}>
      {items.map((it) => {
        const isOpen = open === it.id;
        return (
          <TouchableOpacity key={it.id} style={s.card} activeOpacity={0.8} onPress={() => setOpen(isOpen ? null : it.id)}>
            <View style={s.cardTop}>
              <Text style={s.title}>{it.data.title}</Text>
              <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={20} color={COLORS.muted} />
            </View>
            {isOpen ? <Text style={s.body}>{it.data.body}</Text> : null}
          </TouchableOpacity>
        );
      })}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 18 },
  empty: { padding: 50, alignItems: 'center', gap: 12 },
  emptyText: { color: COLORS.muted, fontSize: 15 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 16, fontWeight: '700', color: COLORS.text, flex: 1 },
  body: { fontSize: 15, color: COLORS.text, marginTop: 10, lineHeight: 23 },
});
