// Süper admin: tüm işletmeler — askıya al / aktifleştir / aç.
import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { adminBusinesses, adminBusinessAction } from '../../src/api/client';
import { COLORS, SIZES } from '../../src/theme';
import { AppIcon } from '../../src/icons';

const STATUS = { draft: { t: 'Taslak', c: COLORS.muted }, active: { t: 'Yayında', c: COLORS.success }, suspended: { t: 'Askıda', c: COLORS.danger } };

export default function AdminBusinesses() {
  const router = useRouter();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try { setList(await adminBusinesses()); } catch (e) { Alert.alert('Hata', e?.response?.data?.error || 'Yetki yok'); } finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const act = async (b, action) => { await adminBusinessAction(b.id, action); load(); };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}><Ionicons name="chevron-back" size={22} color={COLORS.primary} /><Text style={s.back}>Geri</Text></TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ padding: SIZES.pad, paddingBottom: 40 }}>
        <Text style={s.title}>Tüm İşletmeler</Text>
        {loading && <ActivityIndicator color={COLORS.primary} style={{ marginTop: 20 }} />}
        {list.map((b) => {
          const st = STATUS[b.status] || STATUS.draft;
          const theme = b.theme_json?.color || COLORS.primary;
          return (
            <View key={b.id} style={s.card}>
              <TouchableOpacity style={s.cardTop} onPress={() => router.push(`/run/${b.share_slug}`)}>
                <AppIcon sectorKey={b.sector_key} color={theme} size={46} />
                <View style={{ flex: 1 }}>
                  <Text style={s.name}>{b.name}</Text>
                  <Text style={s.owner}>{b.owner_name} · <Text style={{ color: st.c, fontWeight: '700' }}>{st.t}</Text>{b.access_mode === 'private' ? ' · özel' : ''}</Text>
                </View>
              </TouchableOpacity>
              <View style={s.actions}>
                {b.status === 'suspended' ? (
                  <TouchableOpacity style={[s.btn, { backgroundColor: COLORS.success }]} onPress={() => act(b, 'activate')}><Text style={s.btnText}>Aktifleştir</Text></TouchableOpacity>
                ) : (
                  <TouchableOpacity style={[s.btn, { backgroundColor: COLORS.danger }]} onPress={() => act(b, 'suspend')}><Text style={s.btnText}>Askıya Al</Text></TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingHorizontal: SIZES.pad, paddingVertical: 8 },
  backBtn: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' },
  back: { color: COLORS.primary, fontSize: 17, fontWeight: '600' },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.text, marginBottom: 14 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  name: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  owner: { fontSize: 13, color: COLORS.muted, marginTop: 2 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  btn: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 10 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
