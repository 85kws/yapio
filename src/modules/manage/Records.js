// Mini admin ölçüm yönetimi: MÜŞTERİ SEÇ → detaylı vücut analizi gir (çok alan) → kişinin geçmişi.
// Kişiye özel: createEntryFor ile seçilen müşterinin user_id'sine yazılır.
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getEntries, createEntryFor, deleteEntry, getMembers } from '../../api/client';
import { COLORS } from '../../theme';

// Detaylı vücut analizi alanları (Tanita/FormLab tarzı)
export const RECORD_FIELDS = [
  ['weight', 'Kilo (kg)'], ['fat', 'Yağ %'], ['fat_mass', 'Yağ Kütlesi (kg)'], ['muscle', 'Kas (kg)'],
  ['water', 'Su %'], ['bone', 'Kemik (kg)'], ['bmi', 'BMI'], ['visceral', 'İç Yağ'],
  ['metabolic_age', 'Metabolik Yaş'], ['bmr', 'Bazal Metabolizma'], ['protein', 'Protein %'], ['mineral', 'Mineral'],
  ['waist', 'Bel (cm)'], ['hip', 'Kalça (cm)'], ['chest', 'Göğüs (cm)'], ['arm', 'Kol (cm)'],
];

export default function ManageRecords({ businessId, theme }) {
  const [members, setMembers] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState(null);
  const [f, setF] = useState({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const [m, e] = await Promise.all([getMembers(businessId), getEntries(businessId, 'records')]);
      setMembers(m.filter((x) => x.status === 'active'));
      setEntries(e.entries || []);
    } catch (err) { console.warn(err?.message); } finally { setLoading(false); }
  }, [businessId]);
  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!sel) return Alert.alert('Müşteri seç', 'Önce bir müşteri seç.');
    if (!Object.values(f).some((v) => String(v).trim())) return Alert.alert('Boş', 'En az bir değer gir.');
    setSaving(true);
    try {
      await createEntryFor(businessId, 'records', sel, { date: new Date().toISOString().slice(0, 10), ...f });
      setF({}); await load();
    } catch (e) { Alert.alert('Hata', 'Kaydedilemedi'); } finally { setSaving(false); }
  };
  const del = (id) => Alert.alert('Sil', 'Bu ölçüm silinsin mi?', [
    { text: 'Vazgeç', style: 'cancel' },
    { text: 'Sil', style: 'destructive', onPress: async () => { await deleteEntry(businessId, 'records', id); load(); } },
  ]);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={theme} />;
  const recs = entries.filter((e) => Number(e.user_id) === Number(sel)).sort((a, b) => (a.data.date < b.data.date ? 1 : -1));
  const selName = members.find((m) => Number(m.user_id) === Number(sel))?.user_name;

  return (
    <ScrollView contentContainerStyle={s.wrap} keyboardShouldPersistTaps="handled">
      <Text style={s.h}>Müşteri Seç</Text>
      {members.length === 0 && <Text style={s.empty}>Aktif müşteri yok. "Kullanıcılar" ekranından hesap aç.</Text>}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
        {members.map((m) => {
          const on = Number(sel) === Number(m.user_id);
          return (
            <TouchableOpacity key={m.user_id} style={[s.chip, on && { backgroundColor: theme, borderColor: theme }]} onPress={() => setSel(m.user_id)}>
              <Text style={[s.chipText, on && { color: '#fff' }]}>{m.user_name || m.username || ('#' + m.user_id)}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {sel && (
        <>
          <Text style={s.h}>{selName} — Yeni Ölçüm</Text>
          <View style={s.grid}>
            {RECORD_FIELDS.map(([k, label]) => (
              <View key={k} style={s.cell}>
                <Text style={s.label}>{label}</Text>
                <TextInput style={s.input} value={f[k] || ''} onChangeText={(v) => setF({ ...f, [k]: v })} keyboardType="decimal-pad" placeholder="—" placeholderTextColor="#C8C8D0" />
              </View>
            ))}
          </View>
          <TextInput style={s.note} value={f.note || ''} onChangeText={(v) => setF({ ...f, note: v })} placeholder="Not (ops.)" placeholderTextColor="#B0B0C0" multiline />
          <TouchableOpacity style={[s.btn, { backgroundColor: theme }]} onPress={save} disabled={saving}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Kaydet</Text>}
          </TouchableOpacity>

          <Text style={s.h}>Geçmiş ({recs.length})</Text>
          {recs.length === 0 && <Text style={s.empty}>Bu müşteride ölçüm yok.</Text>}
          {recs.map((e) => (
            <View key={e.id} style={s.rec}>
              <View style={s.recTop}>
                <Text style={s.recDate}>{e.data.date}</Text>
                <TouchableOpacity onPress={() => del(e.id)}><Ionicons name="trash-outline" size={18} color={COLORS.danger} /></TouchableOpacity>
              </View>
              <View style={s.recVals}>
                {RECORD_FIELDS.filter(([k]) => e.data[k]).map(([k, label]) => (
                  <View key={k} style={s.recValBox}><Text style={s.recValLabel}>{label.replace(/ \(.*\)/, '')}</Text><Text style={s.recVal}>{e.data[k]}</Text></View>
                ))}
              </View>
              {e.data.note ? <Text style={s.recNote}>{e.data.note}</Text> : null}
            </View>
          ))}
        </>
      )}
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 18 },
  h: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginTop: 16, marginBottom: 10 },
  empty: { color: COLORS.muted, fontSize: 14 },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: '#fff' },
  chipText: { fontWeight: '700', color: COLORS.text, fontSize: 13 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  cell: { width: '48%', marginBottom: 10 },
  label: { fontSize: 12, color: COLORS.muted, fontWeight: '600', marginBottom: 4 },
  input: { backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, fontSize: 15, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border },
  note: { backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, fontSize: 15, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border, minHeight: 56, textAlignVertical: 'top', marginTop: 2 },
  btn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 12 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  rec: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8 },
  recTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  recDate: { fontSize: 14, fontWeight: '800', color: COLORS.text },
  recVals: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  recValBox: { backgroundColor: '#F7F7FB', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, minWidth: '30%' },
  recValLabel: { fontSize: 11, color: COLORS.muted },
  recVal: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  recNote: { fontSize: 13, color: COLORS.muted, marginTop: 8, fontStyle: 'italic' },
});
