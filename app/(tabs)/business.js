// İşletmem sekmesi — sadece mini admin (onaylı satıcı) görür. İşletmeler + hızlı Mesajlar/Yönet.
import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { myBusinesses } from '../../src/api/client';
import { useLang } from '../../src/i18n';
import { COLORS, SIZES } from '../../src/theme';
import { AppIcon } from '../../src/icons';

const STK = { draft: ['st_draft', '#8A8AA3'], active: ['st_active', COLORS.success], suspended: ['st_suspended', COLORS.danger] };

export default function BusinessTab() {
  const router = useRouter();
  const { t } = useLang();
  const [list, setList] = useState([]);

  const load = useCallback(async () => { try { setList(await myBusinesses()); } catch (e) { console.warn(e?.message); } }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <Text style={s.title}>{t('tab_business')}</Text>
        {list.length > 0 ? (
          <TouchableOpacity style={s.newBtn} onPress={() => router.push('/onboarding')}>
            <Ionicons name="add" size={18} color="#fff" /><Text style={s.newText}>{t('new')}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <FlatList
        data={list}
        keyExtractor={(x) => String(x.id)}
        contentContainerStyle={s.list}
        ListEmptyComponent={
          <View style={s.empty}>
            <Ionicons name="briefcase-outline" size={56} color={COLORS.muted} style={{ marginBottom: 14 }} />
            <Text style={s.emptyTitle}>{t('first_app_title')}</Text>
            <Text style={s.emptyText}>{t('first_app_desc')}</Text>
            <TouchableOpacity style={s.emptyBtn} onPress={() => router.push('/onboarding')}><Text style={s.emptyBtnText}>{t('start_now')}</Text></TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => {
          const st = STK[item.status] || STK.draft;
          const theme = item.theme_json?.color || COLORS.primary;
          return (
            <View style={s.card}>
              <TouchableOpacity style={s.cardMain} onPress={() => router.push(`/business/${item.id}`)} activeOpacity={0.8}>
                <AppIcon sectorKey={item.sector_key} color={theme} size={48} logo={item.logo_url} />
                <View style={{ flex: 1 }}>
                  <Text style={s.name}>{item.name}</Text>
                  <View style={s.statusRow}><View style={[s.dot, { backgroundColor: st[1] }]} /><Text style={[s.status, { color: st[1] }]}>{t(st[0])}</Text></View>
                </View>
                <Ionicons name="settings-outline" size={20} color={COLORS.muted} />
              </TouchableOpacity>
              <View style={s.actions}>
                <TouchableOpacity style={s.action} onPress={() => router.push(`/manage/${item.id}/messaging`)}>
                  <Ionicons name="chatbubbles-outline" size={18} color={theme} /><Text style={[s.actionT, { color: theme }]}>{t('messages')}</Text>
                </TouchableOpacity>
                <View style={s.sep} />
                <TouchableOpacity style={s.action} onPress={() => router.push(`/business/${item.id}`)}>
                  <Ionicons name="construct-outline" size={18} color={theme} /><Text style={[s.actionT, { color: theme }]}>{t('manage')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SIZES.pad, paddingTop: 8, paddingBottom: 6 },
  title: { fontSize: 30, fontWeight: '800', color: COLORS.text },
  newBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  newText: { color: '#fff', fontWeight: '700' },
  list: { paddingHorizontal: SIZES.pad, paddingBottom: 30, flexGrow: 1 },
  card: { backgroundColor: COLORS.card, borderRadius: SIZES.radius, marginBottom: 12, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  cardMain: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 14 },
  name: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  status: { fontSize: 13, fontWeight: '600' },
  actions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: COLORS.border },
  action: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12 },
  actionT: { fontWeight: '700', fontSize: 14 },
  sep: { width: 1, backgroundColor: COLORS.border },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, paddingTop: 50 },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text, marginBottom: 8, textAlign: 'center' },
  emptyText: { fontSize: 15, color: COLORS.muted, textAlign: 'center', lineHeight: 22, marginBottom: 22 },
  emptyBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 36, paddingVertical: 14, borderRadius: 14 },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
