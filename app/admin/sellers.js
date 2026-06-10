// Admin: bekleyen satıcı başvurularını incele, onayla/reddet.
import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { adminPending, adminApprove, adminReject } from '../../src/api/client';
import { COLORS, SIZES } from '../../src/theme';

export default function AdminSellers() {
  const router = useRouter();
  const [list, setList] = useState([]);

  const load = useCallback(async () => {
    try { setList(await adminPending()); } catch (e) { Alert.alert('Hata', e?.response?.data?.error || 'Yetki yok'); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const approve = async (id) => { await adminApprove(id); load(); };
  const reject = (id) => {
    Alert.alert('Reddet', 'Bu başvuru reddedilsin mi?', [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Reddet', style: 'destructive', onPress: async () => { await adminReject(id, 'Bilgiler yetersiz'); load(); } },
    ]);
  };

  const Row = ({ k, v }) => v ? <Text style={s.row}><Text style={s.k}>{k}: </Text>{v}</Text> : null;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={COLORS.primary} />
          <Text style={s.back}>Geri</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ padding: SIZES.pad, paddingBottom: 40 }}>
        <Text style={s.title}>Satıcı Başvuruları</Text>
        <Text style={s.sub}>{list.length} bekleyen başvuru</Text>

        {list.length === 0 && <Text style={s.empty}>Bekleyen başvuru yok.</Text>}

        {list.map((a) => {
          const p = a.seller_profile || {};
          return (
            <View key={a.id} style={s.card}>
              <Text style={s.name}>{p.legal_name || a.name}</Text>
              <Text style={s.badge}>{p.account_type === 'company' ? 'Şirket' : 'Şahıs'}</Text>
              <Row k="Unvan" v={p.company_title} />
              <Row k="TCKN" v={p.national_id} />
              <Row k="Vergi No" v={p.tax_no} />
              <Row k="Vergi D." v={p.tax_office} />
              <Row k="Adres" v={[p.address, p.city].filter(Boolean).join(', ')} />
              <Row k="Telefon" v={p.phone} />
              <Row k="E-posta" v={p.email} />
              <Row k="Web" v={p.website} />
              <View style={s.actions}>
                <TouchableOpacity style={[s.btn, s.reject]} onPress={() => reject(a.id)}>
                  <Text style={s.rejectText}>Reddet</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.btn, s.approve]} onPress={() => approve(a.id)}>
                  <Ionicons name="checkmark" size={16} color="#fff" />
                  <Text style={s.approveText}>Onayla</Text>
                </TouchableOpacity>
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
  title: { fontSize: 26, fontWeight: '800', color: COLORS.text },
  sub: { fontSize: 14, color: COLORS.muted, marginTop: 4, marginBottom: 16 },
  empty: { textAlign: 'center', color: COLORS.muted, marginTop: 40 },
  card: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  name: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  badge: { alignSelf: 'flex-start', backgroundColor: '#EEF', color: COLORS.primary, fontWeight: '700', fontSize: 12, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, marginTop: 6, marginBottom: 8, overflow: 'hidden' },
  row: { fontSize: 14, color: COLORS.text, marginTop: 3, lineHeight: 20 },
  k: { color: COLORS.muted, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  btn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 12 },
  reject: { backgroundColor: '#FDECEC' },
  rejectText: { color: COLORS.danger, fontWeight: '700' },
  approve: { backgroundColor: COLORS.success },
  approveText: { color: '#fff', fontWeight: '700' },
});
