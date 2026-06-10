// Vitrin: aktif işletme app'lerini keşfet, ara, sektöre göre filtrele.
import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getStorefront, getSectors } from '../../src/api/client';
import { COLORS, SIZES } from '../../src/theme';
import { AppIcon, sectorIcon } from '../../src/icons';

export default function Storefront() {
  const router = useRouter();
  const [apps, setApps] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [search, setSearch] = useState('');
  const [sector, setSector] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [a, s] = await Promise.all([getStorefront({ search: search || undefined, sector: sector || undefined }), getSectors()]);
      setApps(a); setSectors(s);
    } catch (e) { console.warn('storefront load', e?.message); }
  }, [search, sector]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <Text style={s.title}>Vitrin</Text>
      <View style={s.searchBox}>
        <Ionicons name="search" size={18} color={COLORS.muted} />
        <TextInput
          style={s.searchInput}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={load}
          placeholder="İşletme ara..."
          placeholderTextColor="#B0B0C0"
          returnKeyType="search"
        />
      </View>

      <View style={{ height: 44 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>
          <Chip label="Tümü" active={!sector} onPress={() => { setSector(null); }} />
          {sectors.map((sec) => (
            <Chip key={sec.key} iconName={sectorIcon(sec.key)} label={sec.name} active={sector === sec.key} onPress={() => setSector(sec.key)} />
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={apps}
        keyExtractor={(x) => String(x.id)}
        contentContainerStyle={s.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={s.empty}>Bu filtrede aktif app yok.{'\n'}İşletmem sekmesinden kendi app'ini yayınla.</Text>}
        renderItem={({ item }) => {
          const theme = item.theme_json?.color || COLORS.primary;
          return (
            <TouchableOpacity style={s.card} activeOpacity={0.8} onPress={() => router.push(`/store/${item.share_slug}`)}>
              <AppIcon sectorKey={item.sector_key} color={theme} size={54} />
              <View style={{ flex: 1 }}>
                <Text style={s.cardName}>{item.name}</Text>
                <Text style={s.cardSector}>{item.sector_name || 'İşletme'}</Text>
                {item.description ? <Text style={s.cardDesc} numberOfLines={1}>{item.description}</Text> : null}
              </View>
              {item.installed
                ? <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                : <Ionicons name="chevron-forward" size={24} color={theme} />}
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const Chip = ({ label, iconName, active, onPress }) => (
  <TouchableOpacity style={[c.chip, active && c.chipActive]} onPress={onPress}>
    {iconName ? <Ionicons name={iconName} size={15} color={active ? '#fff' : COLORS.text} style={{ marginRight: 6 }} /> : null}
    <Text style={[c.chipText, active && c.chipTextActive]} numberOfLines={1}>{label}</Text>
  </TouchableOpacity>
);

const c = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#ECECF4', marginRight: 8 },
  chipActive: { backgroundColor: COLORS.primary },
  chipText: { color: COLORS.text, fontWeight: '600', fontSize: 13 },
  chipTextActive: { color: '#fff' },
});

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  title: { fontSize: 30, fontWeight: '800', color: COLORS.text, paddingHorizontal: SIZES.pad, paddingTop: 8, paddingBottom: 10 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: SIZES.pad, borderRadius: 12, paddingHorizontal: 12, gap: 8, borderWidth: 1, borderColor: COLORS.border },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 16, color: COLORS.text },
  chips: { paddingHorizontal: SIZES.pad, paddingVertical: 8, alignItems: 'center' },
  list: { paddingHorizontal: SIZES.pad, paddingBottom: 30, flexGrow: 1 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: SIZES.radius, padding: 14, marginBottom: 12, gap: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  iconBox: { width: 54, height: 54, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 28 },
  cardName: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  cardSector: { fontSize: 13, color: COLORS.muted, marginTop: 1 },
  cardDesc: { fontSize: 13, color: COLORS.muted, marginTop: 2 },
  installed: { color: COLORS.success, fontSize: 20, fontWeight: '800', paddingHorizontal: 6 },
  openArrow: { fontSize: 30, fontWeight: '300', paddingHorizontal: 8 },
  empty: { textAlign: 'center', color: COLORS.muted, marginTop: 60, lineHeight: 22 },
});
