// Müşteri sipariş: katalogdan sepete ekle, sipariş ver. + Siparişlerim.
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getItems, getEntries, createEntry } from '../../api/client';
import { COLORS } from '../../theme';

const STATUS = { new: 'Alındı', preparing: 'Hazırlanıyor', ready: 'Hazır', done: 'Teslim edildi' };

export default function Ordering({ businessId, theme }) {
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState({});
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [its, ent] = await Promise.all([getItems(businessId, 'catalog'), getEntries(businessId, 'ordering')]);
      setItems(its); setOrders(ent.entries || []);
    } finally { setLoading(false); }
  }, [businessId]);
  useEffect(() => { load(); }, [load]);

  const qty = (id) => cart[id] || 0;
  const inc = (id) => setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  const dec = (id) => setCart((c) => ({ ...c, [id]: Math.max(0, (c[id] || 0) - 1) }));

  const lines = items.filter((i) => qty(i.id) > 0).map((i) => ({ name: i.data.name, price: i.data.price || 0, qty: qty(i.id) }));
  const total = lines.reduce((s, l) => s + l.price * l.qty, 0);

  const order = async () => {
    if (!lines.length) return;
    await createEntry(businessId, 'ordering', { lines, total }, 'new');
    setCart({}); Alert.alert('Sipariş alındı', `Toplam ${total} ₺. Ödemeyi teslimde / gel-al sırasında yaparsın.`); load();
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={theme} />;

  return (
    <ScrollView contentContainerStyle={s.wrap}>
      {orders.length > 0 && (
        <View style={{ marginBottom: 18 }}>
          <Text style={s.h}>Siparişlerim</Text>
          {orders.slice(0, 5).map((o) => (
            <View key={o.id} style={s.order}>
              <View style={{ flex: 1 }}>
                <Text style={s.orderName}>{(o.data.lines || []).map((l) => `${l.qty}× ${l.name}`).join(', ')}</Text>
                <Text style={s.orderMeta}>{o.data.total} ₺</Text>
              </View>
              <View style={[s.pill, { backgroundColor: theme + '18' }]}><Text style={[s.pillText, { color: theme }]}>{STATUS[o.status] || o.status}</Text></View>
            </View>
          ))}
        </View>
      )}

      <Text style={s.h}>Menü</Text>
      {items.length === 0 && <Text style={s.empty}>Ürün yok.</Text>}
      {items.map((it) => (
        <View key={it.id} style={s.row}>
          <View style={{ flex: 1 }}>
            <Text style={s.name}>{it.data.name}</Text>
            <Text style={s.price}>{it.data.price || 0} ₺</Text>
          </View>
          {qty(it.id) > 0 ? (
            <View style={s.stepper}>
              <TouchableOpacity onPress={() => dec(it.id)}><Ionicons name="remove-circle" size={28} color={theme} /></TouchableOpacity>
              <Text style={s.qty}>{qty(it.id)}</Text>
              <TouchableOpacity onPress={() => inc(it.id)}><Ionicons name="add-circle" size={28} color={theme} /></TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={[s.addBtn, { borderColor: theme }]} onPress={() => inc(it.id)}><Text style={[s.addText, { color: theme }]}>Ekle</Text></TouchableOpacity>
          )}
        </View>
      ))}
      {items.length > 0 ? <Text style={s.payNote}>Ödeme uygulamada alınmaz — siparişini ver, teslimde/gel-al sırasında öde.</Text> : null}
      <View style={{ height: 90 }} />
      {lines.length > 0 && (
        <TouchableOpacity style={[s.orderBtn, { backgroundColor: theme }]} onPress={order}>
          <Text style={s.orderBtnText}>Sipariş Ver · {total} ₺</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 18 },
  h: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginTop: 8, marginBottom: 10 },
  empty: { color: COLORS.muted },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8 },
  name: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  price: { fontSize: 14, color: COLORS.muted, marginTop: 2 },
  addBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5 },
  addText: { fontWeight: '700' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qty: { fontSize: 16, fontWeight: '800', color: COLORS.text, minWidth: 20, textAlign: 'center' },
  order: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8 },
  orderName: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  orderMeta: { fontSize: 13, color: COLORS.muted, marginTop: 2 },
  pill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  pillText: { fontWeight: '700', fontSize: 12 },
  orderBtn: { position: 'absolute', bottom: 20, left: 18, right: 18, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  orderBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  payNote: { fontSize: 12, color: COLORS.muted, textAlign: 'center', marginTop: 10, lineHeight: 17 },
});
