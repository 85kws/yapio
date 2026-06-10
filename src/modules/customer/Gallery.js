// Müşteri galeri görünümü: görsel ızgarası.
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, ActivityIndicator, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getItems, mediaUrl } from '../../api/client';
import { COLORS } from '../../theme';

const W = (Dimensions.get('window').width - 18 * 2 - 12) / 2;

export default function Gallery({ businessId, theme }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    try { setItems(await getItems(businessId, 'gallery')); } finally { setLoading(false); }
  }, [businessId]);
  useEffect(() => { load(); }, [load]);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={theme} />;
  if (!items.length) return <View style={s.empty}><Ionicons name="images-outline" size={48} color={COLORS.muted} /><Text style={s.emptyText}>Henüz görsel yok.</Text></View>;

  return (
    <ScrollView contentContainerStyle={s.wrap}>
      <View style={s.grid}>
        {items.map((it) => <Image key={it.id} source={{ uri: mediaUrl(it.data.url) }} style={s.img} />)}
      </View>
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 18 },
  empty: { padding: 50, alignItems: 'center', gap: 12 },
  emptyText: { color: COLORS.muted, fontSize: 15 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  img: { width: W, height: W, borderRadius: 12, backgroundColor: '#ECECF4' },
});
