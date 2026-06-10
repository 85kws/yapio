// Satıcı sadakat yönetimi: hedef+ödül ayarı, müşteri kartlarına damga ekleme.
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getItems, createItem, updateItem, getEntries, updateEntry } from '../../api/client';
import { COLORS } from '../../theme';

export default function ManageLoyalty({ businessId, theme }) {
  const [config, setConfig] = useState(null);
  const [cards, setCards] = useState([]);
  const [goal, setGoal] = useState('10');
  const [reward, setReward] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [items, ent] = await Promise.all([getItems(businessId, 'loyalty'), getEntries(businessId, 'loyalty')]);
      const cfg = items[0] || null;
      setConfig(cfg);
      if (cfg) { setGoal(String(cfg.data.goal || 10)); setReward(cfg.data.reward || ''); }
      setCards(ent.entries || []);
    } finally { setLoading(false); }
  }, [businessId]);
  useEffect(() => { load(); }, [load]);

  const saveConfig = async () => {
    const data = { goal: Number(goal) || 10, reward: reward.trim() };
    if (config) await updateItem(businessId, 'loyalty', config.id, data);
    else await createItem(businessId, 'loyalty', data);
    load();
  };
  const stamp = async (card, delta) => {
    const g = Number(goal) || 10;
    const next = Math.max(0, Math.min(g, (card.data.stamps || 0) + delta));
    await updateEntry(businessId, 'loyalty', card.id, { data: { ...card.data, stamps: next } });
    load();
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={theme} />;
  return (
    <ScrollView contentContainerStyle={s.wrap}>
      <Text style={s.h}>Kart Ayarı</Text>
      <Text style={s.lbl}>Hedef (kaç damgada ödül)</Text>
      <TextInput style={s.input} value={goal} onChangeText={setGoal} keyboardType="number-pad" placeholderTextColor="#B0B0C0" />
      <Text style={s.lbl}>Ödül</Text>
      <TextInput style={s.input} value={reward} onChangeText={setReward} placeholder="Örn: 1 ürün bedava" placeholderTextColor="#B0B0C0" />
      <TouchableOpacity style={[s.save, { backgroundColor: theme }]} onPress={saveConfig}><Text style={s.saveText}>Kaydet</Text></TouchableOpacity>

      <Text style={s.h}>Müşteri Kartları ({cards.length})</Text>
      {cards.length === 0 && <Text style={s.empty}>Henüz kart yok. Müşteri sadakat sekmesini açınca kartı oluşur.</Text>}
      {cards.map((c) => (
        <View key={c.id} style={s.card}>
          <View style={{ flex: 1 }}>
            <Text style={s.who}>{c.user_name || 'Müşteri'}</Text>
            <Text style={s.meta}>{c.data.stamps || 0} / {goal} damga</Text>
          </View>
          <TouchableOpacity onPress={() => stamp(c, -1)}><Ionicons name="remove-circle-outline" size={28} color={COLORS.muted} /></TouchableOpacity>
          <TouchableOpacity onPress={() => stamp(c, 1)}><Ionicons name="add-circle" size={28} color={theme} /></TouchableOpacity>
        </View>
      ))}
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 18 },
  h: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginTop: 14, marginBottom: 10 },
  lbl: { fontSize: 13, color: COLORS.muted, fontWeight: '600', marginBottom: 6 },
  input: { backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, fontSize: 15, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border, marginBottom: 10 },
  save: { borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  empty: { color: COLORS.muted },
  card: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8 },
  who: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  meta: { fontSize: 13, color: COLORS.muted, marginTop: 2 },
});
