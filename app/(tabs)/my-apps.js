// App'lerim: kullanıcının indirdiği işletme app'leri.
import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { getInstalls } from '../../src/api/client';
import { COLORS, SIZES } from '../../src/theme';
import { AppIcon } from '../../src/icons';

export default function MyApps() {
  const router = useRouter();
  const [apps, setApps] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try { setApps(await getInstalls()); } catch (e) { console.warn('installs', e?.message); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <Text style={s.title}>App'lerim</Text>
      <FlatList
        data={apps}
        keyExtractor={(x) => String(x.id)}
        numColumns={3}
        contentContainerStyle={s.grid}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={s.empty}>Henüz app indirmedin.{'\n'}Vitrin'den keşfet.</Text>}
        renderItem={({ item }) => {
          const theme = item.theme_json?.color || COLORS.primary;
          return (
            <TouchableOpacity style={s.appItem} onPress={() => router.push(`/run/${item.share_slug}`)} activeOpacity={0.8}>
              <AppIcon sectorKey={item.sector_key} color={theme} size={64} radius={16} logo={item.logo_url} />
              <Text style={s.name} numberOfLines={1}>{item.name}</Text>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  title: { fontSize: 30, fontWeight: '800', color: COLORS.text, paddingHorizontal: SIZES.pad, paddingTop: 8, paddingBottom: 10 },
  grid: { paddingHorizontal: 10, paddingBottom: 30, flexGrow: 1 },
  appItem: { width: '33.33%', alignItems: 'center', marginVertical: 12 },
  icon: { width: 64, height: 64, borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  iconText: { fontSize: 32 },
  name: { fontSize: 12, color: COLORS.text, marginTop: 6, fontWeight: '600', textAlign: 'center', paddingHorizontal: 4 },
  empty: { textAlign: 'center', color: COLORS.muted, marginTop: 60, lineHeight: 22 },
});
