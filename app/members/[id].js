// Satıcı üye yönetimi: katılım kodu, bekleyen istekler (onay/blok), aktif üyeler (çıkar).
import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getBusiness, getMembers, memberAction } from '../../src/api/client';
import { COLORS, SIZES } from '../../src/theme';

export default function Members() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [biz, setBiz] = useState(null);
  const [members, setMembers] = useState([]);

  const load = useCallback(async () => {
    try {
      const [b, m] = await Promise.all([getBusiness(id), getMembers(id)]);
      setBiz(b.business); setMembers(m);
    } catch (e) { console.warn(e?.message); }
  }, [id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const theme = biz?.theme_json?.color || COLORS.primary;
  const act = async (userId, action) => { await memberAction(id, userId, action); load(); };

  const pending = members.filter((m) => m.status === 'pending');
  const active = members.filter((m) => m.status === 'active');

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={COLORS.primary} /><Text style={s.back}>Geri</Text>
        </TouchableOpacity>
      </View>
      {!biz ? <ActivityIndicator style={{ marginTop: 40 }} color={theme} /> : (
        <ScrollView contentContainerStyle={{ padding: SIZES.pad, paddingBottom: 40 }}>
          <Text style={s.title}>Üyeler</Text>
          <View style={[s.codeBox, { backgroundColor: theme }]}>
            <Text style={s.codeLabel}>Katılım Kodu</Text>
            <Text style={s.code}>{biz.join_code || '—'}</Text>
            <Text style={s.codeHint}>Müşterilerine bu kodu ver; girince otomatik üye olurlar.</Text>
          </View>

          <Text style={s.h}>Bekleyen İstekler ({pending.length})</Text>
          {pending.length === 0 && <Text style={s.empty}>Bekleyen istek yok.</Text>}
          {pending.map((m) => (
            <View key={m.id} style={s.row}>
              <View style={[s.avatar, { backgroundColor: theme }]}><Text style={s.avatarText}>{(m.user_name || '?')[0].toUpperCase()}</Text></View>
              <Text style={s.name}>{m.user_name || 'Kullanıcı'}</Text>
              <TouchableOpacity style={[s.mini, { backgroundColor: theme }]} onPress={() => act(m.user_id, 'approve')}><Text style={s.miniText}>Onayla</Text></TouchableOpacity>
              <TouchableOpacity style={s.miniGhost} onPress={() => act(m.user_id, 'remove')}><Ionicons name="close" size={18} color={COLORS.danger} /></TouchableOpacity>
            </View>
          ))}

          <Text style={s.h}>Aktif Üyeler ({active.length})</Text>
          {active.length === 0 && <Text style={s.empty}>Henüz üye yok.</Text>}
          {active.map((m) => (
            <View key={m.id} style={s.row}>
              <View style={[s.avatar, { backgroundColor: theme }]}><Text style={s.avatarText}>{(m.user_name || '?')[0].toUpperCase()}</Text></View>
              <Text style={s.name}>{m.user_name || 'Kullanıcı'}</Text>
              <TouchableOpacity style={s.miniGhost} onPress={() => act(m.user_id, 'remove')}><Ionicons name="trash-outline" size={18} color={COLORS.danger} /></TouchableOpacity>
            </View>
          ))}
          <View style={{ height: 30 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingHorizontal: SIZES.pad, paddingVertical: 8 },
  backBtn: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' },
  back: { color: COLORS.primary, fontSize: 17, fontWeight: '600' },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.text, marginBottom: 14 },
  codeBox: { borderRadius: 16, padding: 18, alignItems: 'center' },
  codeLabel: { color: '#fff', opacity: 0.9, fontWeight: '600' },
  code: { color: '#fff', fontSize: 36, fontWeight: '900', letterSpacing: 4, marginVertical: 4 },
  codeHint: { color: '#fff', opacity: 0.9, fontSize: 12, textAlign: 'center' },
  h: { fontSize: 17, fontWeight: '800', color: COLORS.text, marginTop: 20, marginBottom: 10 },
  empty: { color: COLORS.muted },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  name: { flex: 1, fontSize: 16, fontWeight: '700', color: COLORS.text },
  mini: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 9 },
  miniText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  miniGhost: { padding: 8 },
});
