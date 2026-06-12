// İşletmelerim: onaylı satıcının app'leri + yeni kurma. (Profil'den erişilir.)
import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { myBusinesses } from '../src/api/client';
import { COLORS, SIZES } from '../src/theme';
import { AppIcon } from '../src/icons';
import { GuideAccordion } from './guide';

const STATUS = { draft: { t: 'Taslak', c: '#8A8AA3' }, active: { t: 'Yayında', c: COLORS.success }, suspended: { t: 'Askıda', c: COLORS.danger } };

export default function MyBusinesses() {
  const router = useRouter();
  const [list, setList] = useState([]);
  const [showGuide, setShowGuide] = useState(false);

  const load = useCallback(async () => {
    try {
      const m = await myBusinesses();
      setList(m);
      // Hiç app'i olmayan (yeni onaylı) satıcı → ilk girişte kılavuz popup'ı (bir kez)
      if (m.length === 0) {
        const seen = await SecureStore.getItemAsync('yapio_guide_seen');
        if (!seen) setShowGuide(true);
      }
    } catch (e) { console.warn('mine', e?.message); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const closeGuide = async () => { try { await SecureStore.setItemAsync('yapio_guide_seen', '1'); } catch {} setShowGuide(false); };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={COLORS.primary} />
          <Text style={s.back}>Geri</Text>
        </TouchableOpacity>
        {list.length > 0 ? (
          <TouchableOpacity style={s.newBtn} onPress={() => router.push('/onboarding')}>
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={s.newText}>Yeni</Text>
          </TouchableOpacity>
        ) : <View style={{ width: 60 }} />}
      </View>

      <FlatList
        data={list}
        keyExtractor={(x) => String(x.id)}
        contentContainerStyle={s.list}
        ListHeaderComponent={<Text style={s.title}>İşletmelerim</Text>}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="briefcase-outline" size={64} color={COLORS.muted} style={{ marginBottom: 14 }} />
            <Text style={s.emptyTitle}>İlk işletme app'ini kur</Text>
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
              <AppIcon sectorKey={item.sector_key} color={theme} size={54} logo={item.logo_url} />
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

      <Modal visible={showGuide} animationType="slide" onRequestClose={closeGuide}>
        <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
          <ScrollView contentContainerStyle={{ padding: SIZES.pad, paddingBottom: 30 }}>
            <Text style={s.title}>Hoş geldin! 👋</Text>
            <Text style={s.guideSub}>İlk uygulamanı kurmadan önce nasıl çalıştığını oku. Sonra Profil &gt; Kılavuz'dan tekrar bakabilirsin.</Text>
            <GuideAccordion startOpen={0} />
            <TouchableOpacity style={s.gotIt} onPress={closeGuide}>
              <Text style={s.gotItText}>Anladım, Başlayalım</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SIZES.pad, paddingVertical: 8 },
  backBtn: { flexDirection: 'row', alignItems: 'center', width: 60 },
  back: { color: COLORS.primary, fontSize: 17, fontWeight: '600' },
  newBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  newText: { color: '#fff', fontWeight: '700' },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.text, marginBottom: 12 },
  list: { paddingHorizontal: SIZES.pad, paddingBottom: 30, flexGrow: 1 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: SIZES.radius, padding: 14, marginBottom: 12, gap: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  name: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  status: { fontSize: 13, fontWeight: '600' },
  role: { fontSize: 13, color: COLORS.muted },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, paddingTop: 50 },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
  emptyText: { fontSize: 15, color: COLORS.muted, textAlign: 'center', lineHeight: 22, marginBottom: 22 },
  emptyBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 36, paddingVertical: 14, borderRadius: 14 },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  guideSub: { fontSize: 14, color: COLORS.muted, marginTop: 4, marginBottom: 16, lineHeight: 20 },
  gotIt: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  gotItText: { color: '#fff', fontWeight: '800', fontSize: 17 },
});
