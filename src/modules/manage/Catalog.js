// Satıcı menü/katalog yönetimi: ürün ekle/sil (ad, fiyat, kategori, açıklama).
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getItems, createItem, deleteItem } from '../../api/client';
import { COLORS } from '../../theme';

export default function ManageCatalog({ businessId, theme }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [f, setF] = useState({ name: '', price: '', category: '', desc: '' });

  const load = useCallback(async () => {
    try { setItems(await getItems(businessId, 'catalog')); } finally { setLoading(false); }
  }, [businessId]);
  useEffect(() => { load(); }, [load]);

  const add = async () => {
    if (!f.name.trim()) return;
    await createItem(businessId, 'catalog', { name: f.name.trim(), price: Number(f.price) || 0, category: f.category.trim() || 'Genel', desc: f.desc.trim() });
    setF({ name: '', price: '', category: '', desc: '' }); load();
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={theme} />;

  return (
    <ScrollView contentContainerStyle={s.wrap}>
      <Text style={s.h}>Ürünler ({items.length})</Text>
      {items.map((it) => (
        <View key={it.id} style={s.row}>
          <View style={{ flex: 1 }}>
            <Text style={s.name}>{it.data.name} {it.data.price ? <Text style={s.price}>· {it.data.price} ₺</Text> : null}</Text>
            <Text style={s.meta}>{it.data.category}{it.data.desc ? ` — ${it.data.desc}` : ''}</Text>
          </View>
          <TouchableOpacity onPress={() => deleteItem(businessId, 'catalog', it.id).then(load)}><Ionicons name="trash-outline" size={20} color={COLORS.danger} /></TouchableOpacity>
        </View>
      ))}

      <Text style={s.h}>Yeni ürün</Text>
      <TextInput style={s.input} value={f.name} onChangeText={(v) => setF({ ...f, name: v })} placeholder="Ürün adı" placeholderTextColor="#B0B0C0" />
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TextInput style={[s.input, { flex: 1 }]} value={f.price} onChangeText={(v) => setF({ ...f, price: v })} placeholder="Fiyat ₺" keyboardType="number-pad" placeholderTextColor="#B0B0C0" />
        <TextInput style={[s.input, { flex: 1 }]} value={f.category} onChangeText={(v) => setF({ ...f, category: v })} placeholder="Kategori" placeholderTextColor="#B0B0C0" />
      </View>
      <TextInput style={s.input} value={f.desc} onChangeText={(v) => setF({ ...f, desc: v })} placeholder="Açıklama (ops.)" placeholderTextColor="#B0B0C0" />
      <TouchableOpacity style={[s.addBtn, { backgroundColor: theme }]} onPress={add}><Ionicons name="add" size={20} color="#fff" /><Text style={s.addText}>Ekle</Text></TouchableOpacity>
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 18 },
  h: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginTop: 14, marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8 },
  name: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  price: { color: COLORS.muted, fontWeight: '600' },
  meta: { fontSize: 13, color: COLORS.muted, marginTop: 2 },
  input: { backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, fontSize: 15, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border, marginBottom: 8 },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 12, paddingVertical: 14, marginTop: 4 },
  addText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
