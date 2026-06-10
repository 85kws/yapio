// Satıcı ödeme defteri: ödeme kaydı ekle, listele, toplam. (Tahsilat dev'in geçidinden; bu defter takip içindir.)
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getEntries, createEntry, deleteEntry } from '../../api/client';
import { COLORS } from '../../theme';

export default function ManagePayments({ businessId, theme }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [f, setF] = useState({ customer_name: '', amount: '', note: '' });

  const load = useCallback(async () => {
    try { setList((await getEntries(businessId, 'payments')).entries || []); } finally { setLoading(false); }
  }, [businessId]);
  useEffect(() => { load(); }, [load]);

  const add = async () => {
    if (!f.amount) return;
    await createEntry(businessId, 'payments', { customer_name: f.customer_name.trim(), amount: Number(f.amount) || 0, note: f.note.trim(), date: new Date().toISOString().slice(0, 10) }, 'paid');
    setF({ customer_name: '', amount: '', note: '' }); load();
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={theme} />;
  const total = list.reduce((a, e) => a + (e.data.amount || 0), 0);

  return (
    <ScrollView contentContainerStyle={s.wrap}>
      <View style={[s.totalBox, { backgroundColor: theme }]}>
        <Text style={s.totalLabel}>Toplam Tahsilat</Text>
        <Text style={s.totalNum}>{total.toLocaleString('tr-TR')} ₺</Text>
      </View>

      <Text style={s.h}>Ödeme ekle</Text>
      <TextInput style={s.input} value={f.customer_name} onChangeText={(v) => setF({ ...f, customer_name: v })} placeholder="Müşteri adı" placeholderTextColor="#B0B0C0" />
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TextInput style={[s.input, { flex: 1 }]} value={f.amount} onChangeText={(v) => setF({ ...f, amount: v })} placeholder="Tutar ₺" keyboardType="number-pad" placeholderTextColor="#B0B0C0" />
        <TextInput style={[s.input, { flex: 2 }]} value={f.note} onChangeText={(v) => setF({ ...f, note: v })} placeholder="Not (ops.)" placeholderTextColor="#B0B0C0" />
      </View>
      <TouchableOpacity style={[s.btn, { backgroundColor: theme }]} onPress={add}><Text style={s.btnText}>Kaydet</Text></TouchableOpacity>

      <Text style={s.h}>Kayıtlar ({list.length})</Text>
      {list.map((e) => (
        <View key={e.id} style={s.row}>
          <View style={{ flex: 1 }}>
            <Text style={s.name}>{e.data.customer_name || 'Müşteri'} · {e.data.amount} ₺</Text>
            <Text style={s.meta}>{e.data.date}{e.data.note ? ` — ${e.data.note}` : ''}</Text>
          </View>
          <TouchableOpacity onPress={() => deleteEntry(businessId, 'payments', e.id).then(load)}><Ionicons name="trash-outline" size={20} color={COLORS.danger} /></TouchableOpacity>
        </View>
      ))}
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 18 },
  totalBox: { borderRadius: 16, padding: 20, alignItems: 'center' },
  totalLabel: { color: '#fff', opacity: 0.9, fontWeight: '600' },
  totalNum: { color: '#fff', fontSize: 34, fontWeight: '900', marginTop: 4 },
  h: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginTop: 16, marginBottom: 10 },
  input: { backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, fontSize: 15, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border, marginBottom: 8 },
  btn: { borderRadius: 12, paddingVertical: 13, alignItems: 'center', marginTop: 2 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8 },
  name: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  meta: { fontSize: 13, color: COLORS.muted, marginTop: 2 },
});
