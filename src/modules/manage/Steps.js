// Mini admin adım sayar ayarı: günlük adım hedefi belirle (müşterilerin telefonu sayar).
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getItems, createItem, updateItem } from '../../api/client';
import { COLORS } from '../../theme';

export default function ManageSteps({ businessId, theme }) {
  const [item, setItem] = useState(null);
  const [goal, setGoal] = useState('8000');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try { const its = await getItems(businessId, 'steps'); const it = its?.[0]; setItem(it || null); if (it?.data?.goal) setGoal(String(it.data.goal)); }
    finally { setLoading(false); }
  }, [businessId]);
  useEffect(() => { load(); }, [load]);

  const save = async () => {
    const g = Number(goal) || 8000;
    setSaving(true);
    try {
      if (item) await updateItem(businessId, 'steps', item.id, { goal: g });
      else await createItem(businessId, 'steps', { goal: g });
      await load();
      Alert.alert('Kaydedildi', `Günlük adım hedefi: ${g.toLocaleString('tr-TR')}`);
    } catch (e) { Alert.alert('Hata', 'Kaydedilemedi'); } finally { setSaving(false); }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={theme} />;
  return (
    <ScrollView contentContainerStyle={s.wrap}>
      <View style={[s.card, { borderColor: theme }]}>
        <Ionicons name="walk" size={28} color={theme} />
        <Text style={s.title}>Adım Sayar</Text>
        <Text style={s.desc}>Müşterilerin günlük adımı telefonlarının hareket sensöründen otomatik sayılır. Sen sadece hedefi belirlersin; herkes ilerlemesini kendi ekranında görür.</Text>
      </View>
      <Text style={s.label}>Günlük adım hedefi</Text>
      <TextInput style={s.input} value={goal} onChangeText={setGoal} keyboardType="number-pad" placeholder="8000" placeholderTextColor="#B0B0C0" />
      <TouchableOpacity style={[s.btn, { backgroundColor: theme }]} onPress={save} disabled={saving}>
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Kaydet</Text>}
      </TouchableOpacity>
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 18 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, borderWidth: 1.5, alignItems: 'flex-start', gap: 6 },
  title: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  desc: { fontSize: 14, color: COLORS.muted, lineHeight: 20 },
  label: { fontSize: 13, fontWeight: '700', color: COLORS.muted, marginTop: 18, marginBottom: 8 },
  input: { backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, fontSize: 16, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border },
  btn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 12 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
