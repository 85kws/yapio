// İşletmem: sahip olunan işletme app'leri + yeni kurma girişi.
import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { myBusinesses } from '../../src/api/client';
import { COLORS, SIZES } from '../../src/theme';
import { AppIcon } from '../../src/icons';

const STATUS = { draft: { t: 'Taslak', c: '#8A8AA3' }, active: { t: 'Yayında', c: COLORS.success }, suspended: { t: 'Askıda', c: COLORS.danger } };

export default function Business() {
  const router = useRouter();
  const [list, setList] = useState([]);

  const load = useCallback(async () => {
    try { setList(await myBusinesses()); } catch (e) { console.warn('mine', e?.message); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <Text style={s.title}>İşletmem</Text>
        {list.length > 0 ? (
          <TouchableOpacity style={s.newBtn} onPress={() => router.push('/onboarding')}>
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={s.newText}>Yeni</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        data={list}
        keyExtractor={(x) => String(x.id)}
        contentContainerStyle={s.list}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="briefcase-outline" size={64} color={COLORS.muted} style={{ marginBottom: 14 }} />
            <Text style={s.emptyTitle}>İşletme app'ini kur</Text>
            <Text style={s.emptyText}>Sektörünü seç, hazır şablonla dakikalar içinde kendi uygulamanı yayınla — randevu, menü, sadakat, push.</Text>
            <TouchableOpacity style={s.emptyBtn} onPress={() => router.push('/onboarding')}>
              <Text style={s.emptyBtnText}>Hemen Başla</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => {
          const st = STATUS[item.status] || STATUS.draft;
          const theme = item.theme_json?.color || COLORS.primary;
          return (
            <TouchableOpacity style={s.card} onPress={() => router.push(`/business/${item.id}`)} activeOpacity={0.8}>
              <AppIcon sectorKey={item.sector_key} color={theme} size={54} />
              <View style={{ flex: 1 }}>
                <Text style={s.name}>{item.name}</Text>
                <View style={s.statusRow}>
                  <View style={[s.dot, { backgroundColor: st.c }]} />
                  <Text style={[s.status, { color: st.c }]}>{st.t}</Text>
                  <Text style={s.role}> · {item.role}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={22} color={COLORS.muted} />
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SIZES.pad, paddingTop: 8, paddingBottom: 10 },
  title: { fontSize: 30, fontWeight: '800', color: COLORS.text },
  newBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  newText: { color: '#fff', fontWeight: '700' },
  list: { paddingHorizontal: SIZES.pad, paddingBottom: 30, flexGrow: 1 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: SIZES.radius, padding: 14, marginBottom: 12, gap: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  icon: { width: 54, height: 54, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 28 },
  name: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  status: { fontSize: 13, fontWeight: '600' },
  role: { fontSize: 13, color: COLORS.muted },
  arrow: { fontSize: 28, color: COLORS.muted, fontWeight: '300' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, paddingTop: 50 },
  emptyEmoji: { fontSize: 60, marginBottom: 14 },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
  emptyText: { fontSize: 15, color: COLORS.muted, textAlign: 'center', lineHeight: 22, marginBottom: 22 },
  emptyBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 36, paddingVertical: 14, borderRadius: 14 },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
