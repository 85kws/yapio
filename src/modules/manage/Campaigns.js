// Satıcı kampanya yönetimi: kampanya ekle/sil.
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getItems, createItem, deleteItem } from '../../api/client';
import { COLORS } from '../../theme';

export default function ManageCampaigns({ businessId, theme }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [f, setF] = useState({ title: '', desc: '', discount: '' });

  const load = useCallback(async () => {
    try { setItems(await getItems(businessId, 'campaigns')); } finally { setLoading(false); }
  }, [businessId]);
  useEffect(() => { load(); }, [load]);

  const add = async () => {
    if (!f.title.trim()) return;
    await createItem(businessId, 'campaigns', { title: f.title.trim(), desc: f.desc.trim(), discount: f.discount.trim() });
    setF({ title: '', desc: '', discount: '' }); load();
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={theme} />;
  return (
    <ScrollView contentContainerStyle={s.wrap}>
      <Text style={s.h}>Kampanyalar ({items.length})</Text>
      {items.map((it) => (
        <View key={it.id} style={s.row}>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>{it.data.title} {it.data.discount ? <Text style={[s.disc, { color: theme }]}>{it.data.discount}</Text> : null}</Text>
            {it.data.desc ? <Text style={s.desc}>{it.data.desc}</Text> : null}
          </View>
          <TouchableOpacity onPress={() => deleteItem(businessId, 'campaigns', it.id).then(load)}><Ionicons name="trash-outline" size={20} color={COLORS.danger} /></TouchableOpacity>
        </View>
      ))}
      <Text style={s.h}>Yeni kampanya</Text>
      <TextInput style={s.input} value={f.title} onChangeText={(v) => setF({ ...f, title: v })} placeholder="Başlık (örn: Hafta Sonu)" placeholderTextColor="#B0B0C0" />
      <TextInput style={s.input} value={f.discount} onChangeText={(v) => setF({ ...f, discount: v })} placeholder="İndirim (örn: %20)" placeholderTextColor="#B0B0C0" />
      <TextInput style={s.input} value={f.desc} onChangeText={(v) => setF({ ...f, desc: v })} placeholder="Açıklama" placeholderTextColor="#B0B0C0" />
      <TouchableOpacity style={[s.addBtn, { backgroundColor: theme }]} onPress={add}><Ionicons name="add" size={20} color="#fff" /><Text style={s.addText}>Ekle</Text></TouchableOpacity>
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 18 },
  h: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginTop: 14, marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8 },
  title: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  disc: { fontWeight: '800' },
  desc: { fontSize: 13, color: COLORS.muted, marginTop: 2 },
  input: { backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, fontSize: 15, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border, marginBottom: 8 },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 12, paddingVertical: 14, marginTop: 4 },
  addText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
