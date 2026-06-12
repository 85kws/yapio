// Satıcı ekip yönetimi: çalışan ekle/sil (ad, görev).
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getItems, createItem, deleteItem } from '../../api/client';
import { useLang } from '../../i18n';
import { COLORS } from '../../theme';

export default function ManageStaff({ businessId, theme }) {
  const { t } = useLang();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [f, setF] = useState({ name: '', role: '' });
  const load = useCallback(async () => {
    try { setItems(await getItems(businessId, 'staff')); } finally { setLoading(false); }
  }, [businessId]);
  useEffect(() => { load(); }, [load]);

  const add = async () => {
    if (!f.name.trim()) return;
    await createItem(businessId, 'staff', { name: f.name.trim(), role: f.role.trim() });
    setF({ name: '', role: '' }); load();
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={theme} />;
  return (
    <ScrollView contentContainerStyle={s.wrap}>
      <Text style={s.h}>{t('team')} ({items.length})</Text>
      {items.map((it) => (
        <View key={it.id} style={s.row}>
          <View style={[s.avatar, { backgroundColor: theme }]}><Text style={s.avatarText}>{(it.data.name || '?')[0].toUpperCase()}</Text></View>
          <View style={{ flex: 1 }}><Text style={s.name}>{it.data.name}</Text>{it.data.role ? <Text style={s.role}>{it.data.role}</Text> : null}</View>
          <TouchableOpacity onPress={() => deleteItem(businessId, 'staff', it.id).then(load)}><Ionicons name="trash-outline" size={20} color={COLORS.danger} /></TouchableOpacity>
        </View>
      ))}
      <View style={s.addBox}>
        <TextInput style={[s.input, { flex: 2 }]} value={f.name} onChangeText={(v) => setF({ ...f, name: v })} placeholder={t('name_surname')} placeholderTextColor="#B0B0C0" />
        <TextInput style={[s.input, { flex: 1 }]} value={f.role} onChangeText={(v) => setF({ ...f, role: v })} placeholder={t('role_ph')} placeholderTextColor="#B0B0C0" />
        <TouchableOpacity style={[s.addBtn, { backgroundColor: theme }]} onPress={add}><Ionicons name="add" size={22} color="#fff" /></TouchableOpacity>
      </View>
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 18 },
  h: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8 },
  avatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 17 },
  name: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  role: { fontSize: 13, color: COLORS.muted, marginTop: 1 },
  addBox: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  input: { backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, fontSize: 15, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border },
  addBtn: { width: 44, height: 42, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});
