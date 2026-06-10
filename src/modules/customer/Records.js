// Müşteri ölçüm kaydı: kilo/yağ/kas + not. Kendi geçmişini görür, yeni ekler.
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { getEntries, createEntry } from '../../api/client';
import { COLORS } from '../../theme';

export default function Records({ businessId, theme }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [f, setF] = useState({ weight: '', fat: '', muscle: '', note: '' });

  const load = useCallback(async () => {
    try { setList((await getEntries(businessId, 'records')).entries || []); } finally { setLoading(false); }
  }, [businessId]);
  useEffect(() => { load(); }, [load]);

  const add = async () => {
    if (!f.weight && !f.note) return;
    await createEntry(businessId, 'records', { date: new Date().toISOString().slice(0, 10), ...f });
    setF({ weight: '', fat: '', muscle: '', note: '' }); load();
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={theme} />;
  return (
    <ScrollView contentContainerStyle={s.wrap}>
      <Text style={s.h}>Yeni Ölçüm</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Inp v={f.weight} on={(v) => setF({ ...f, weight: v })} ph="Kilo" />
        <Inp v={f.fat} on={(v) => setF({ ...f, fat: v })} ph="Yağ %" />
        <Inp v={f.muscle} on={(v) => setF({ ...f, muscle: v })} ph="Kas" />
      </View>
      <TextInput style={s.input} value={f.note} onChangeText={(v) => setF({ ...f, note: v })} placeholder="Not (ops.)" placeholderTextColor="#B0B0C0" />
      <TouchableOpacity style={[s.btn, { backgroundColor: theme }]} onPress={add}><Text style={s.btnText}>Kaydet</Text></TouchableOpacity>

      <Text style={s.h}>Geçmiş ({list.length})</Text>
      {list.length === 0 && <Text style={s.empty}>Henüz ölçüm yok.</Text>}
      {list.map((e) => (
        <View key={e.id} style={s.row}>
          <Text style={s.date}>{e.data.date}</Text>
          <Text style={s.vals}>{[e.data.weight && `${e.data.weight} kg`, e.data.fat && `%${e.data.fat} yağ`, e.data.muscle && `${e.data.muscle} kas`].filter(Boolean).join('  ·  ')}</Text>
          {e.data.note ? <Text style={s.note}>{e.data.note}</Text> : null}
        </View>
      ))}
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const Inp = ({ v, on, ph }) => <TextInput style={st.input} value={v} onChangeText={on} placeholder={ph} keyboardType="decimal-pad" placeholderTextColor="#B0B0C0" />;
const st = StyleSheet.create({ input: { flex: 1, backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, fontSize: 15, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border } });
const s = StyleSheet.create({
  wrap: { padding: 18 },
  h: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginTop: 14, marginBottom: 10 },
  input: { backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, fontSize: 15, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border, marginTop: 8 },
  btn: { borderRadius: 12, paddingVertical: 13, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  empty: { color: COLORS.muted },
  row: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8 },
  date: { fontSize: 13, color: COLORS.muted, fontWeight: '600' },
  vals: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginTop: 3 },
  note: { fontSize: 14, color: COLORS.muted, marginTop: 3 },
});
