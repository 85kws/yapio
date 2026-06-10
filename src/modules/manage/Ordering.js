// Satıcı sipariş yönetimi: gelen siparişler + durum geçişi.
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { getEntries, updateEntry } from '../../api/client';
import { COLORS } from '../../theme';

const FLOW = { new: 'preparing', preparing: 'ready', ready: 'done' };
const LABEL = { new: 'Hazırlamaya Başla', preparing: 'Hazır', ready: 'Teslim Edildi', done: 'Tamamlandı' };
const STATUS = { new: 'Yeni', preparing: 'Hazırlanıyor', ready: 'Hazır', done: 'Teslim' };

export default function ManageOrdering({ businessId, theme }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try { setOrders((await getEntries(businessId, 'ordering')).entries || []); } finally { setLoading(false); }
  }, [businessId]);
  useEffect(() => { load(); }, [load]);

  const advance = async (o) => { const next = FLOW[o.status]; if (next) { await updateEntry(businessId, 'ordering', o.id, { status: next }); load(); } };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={theme} />;

  const active = orders.filter((o) => o.status !== 'done');
  return (
    <ScrollView contentContainerStyle={s.wrap}>
      <Text style={s.h}>Aktif Siparişler ({active.length})</Text>
      {active.length === 0 && <Text style={s.empty}>Aktif sipariş yok.</Text>}
      {active.map((o) => (
        <View key={o.id} style={s.card}>
          <View style={s.cardTop}>
            <Text style={s.who}>{o.user_name || 'Müşteri'}</Text>
            <View style={[s.pill, { backgroundColor: theme + '18' }]}><Text style={[s.pillText, { color: theme }]}>{STATUS[o.status]}</Text></View>
          </View>
          {(o.data.lines || []).map((l, i) => <Text key={i} style={s.line}>{l.qty}× {l.name} — {l.price * l.qty} ₺</Text>)}
          <Text style={s.total}>Toplam: {o.data.total} ₺</Text>
          {FLOW[o.status] && (
            <TouchableOpacity style={[s.btn, { backgroundColor: theme }]} onPress={() => advance(o)}><Text style={s.btnText}>{LABEL[o.status]}</Text></TouchableOpacity>
          )}
        </View>
      ))}
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 18 },
  h: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginBottom: 10 },
  empty: { color: COLORS.muted },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  who: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  pillText: { fontWeight: '700', fontSize: 12 },
  line: { fontSize: 14, color: COLORS.text, marginTop: 2 },
  total: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginTop: 8 },
  btn: { borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 12 },
  btnText: { color: '#fff', fontWeight: '800' },
});
