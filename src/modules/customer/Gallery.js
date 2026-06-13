// Müşteri galeri görünümü: görsel ızgarası.
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, RefreshControl, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getItems, mediaUrl } from '../../api/client';
import { useLang } from '../../i18n';
import { COLORS } from '../../theme';
import { SkeletonList, EmptyState, useRefresh } from '../../components/ui';

const W = (Dimensions.get('window').width - 18 * 2 - 12) / 2;

export default function Gallery({ businessId, theme }) {
  const { t } = useLang();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    try { setItems(await getItems(businessId, 'gallery')); } finally { setLoading(false); }
  }, [businessId]);
  useEffect(() => { load(); }, [load]);
  const { refreshing, onRefresh } = useRefresh(load);
  const rc = <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme} colors={[theme]} />;

  if (loading) return <SkeletonList theme={theme} rows={3} />;

  return (
    <ScrollView contentContainerStyle={s.wrap} refreshControl={rc}>
      {!items.length ? (
        <EmptyState icon="images-outline" text={t('no_images')} theme={theme} />
      ) : (
        <View style={s.grid}>
          {items.map((it) => <Image key={it.id} source={{ uri: mediaUrl(it.data.url) }} style={s.img} />)}
        </View>
      )}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 18, flexGrow: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  img: { width: W, height: W, borderRadius: 12, backgroundColor: '#ECECF4' },
});
