// Satıcı duyuru/bildirim: duyuru yayınla (uygulama içi). Gerçek push (APNs) sonraki altyapı.
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getItems, createItem, deleteItem } from '../../api/client';
import { useLang } from '../../i18n';
import { COLORS } from '../../theme';

export default function ManagePush({ businessId, theme }) {
  const { t } = useLang();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [f, setF] = useState({ title: '', body: '' });
  const load = useCallback(async () => {
    try { setItems(await getItems(businessId, 'push')); } finally { setLoading(false); }
  }, [businessId]);
  useEffect(() => { load(); }, [load]);

  const send = async () => {
    if (!f.title.trim()) return;
    await createItem(businessId, 'push', { title: f.title.trim(), body: f.body.trim(), date: new Date().toISOString() });
    setF({ title: '', body: '' }); load();
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={theme} />;
  return (
    <ScrollView contentContainerStyle={s.wrap}>
      <Text style={s.h}>{t('new_announcement')}</Text>
      <TextInput style={s.input} value={f.title} onChangeText={(v) => setF({ ...f, title: v })} placeholder={t('title_ph')} placeholderTextColor="#B0B0C0" />
      <TextInput style={[s.input, { minHeight: 70, textAlignVertical: 'top' }]} value={f.body} onChangeText={(v) => setF({ ...f, body: v })} placeholder={t('message_label')} placeholderTextColor="#B0B0C0" multiline />
      <TouchableOpacity style={[s.btn, { backgroundColor: theme }]} onPress={send}><Ionicons name="megaphone" size={18} color="#fff" /><Text style={s.btnText}>{t('publish')}</Text></TouchableOpacity>
      <Text style={s.note}>{t('push_note')}</Text>

      <Text style={s.h}>{t('history')} ({items.length})</Text>
      {items.map((it) => (
        <View key={it.id} style={s.row}>
          <View style={{ flex: 1 }}><Text style={s.title}>{it.data.title}</Text><Text style={s.body}>{it.data.body}</Text></View>
          <TouchableOpacity onPress={() => deleteItem(businessId, 'push', it.id).then(load)}><Ionicons name="trash-outline" size={20} color={COLORS.danger} /></TouchableOpacity>
        </View>
      ))}
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 18 },
  h: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginTop: 14, marginBottom: 10 },
  input: { backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, fontSize: 15, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border, marginBottom: 8 },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 12, paddingVertical: 13 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  note: { color: COLORS.muted, fontSize: 13, marginTop: 8 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8 },
  title: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  body: { fontSize: 13, color: COLORS.muted, marginTop: 2 },
});
