// Mini admin ölçüm yönetimi: MÜŞTERİ SEÇ → detaylı vücut analizi gir (çok alan) → kişinin geçmişi.
// Kişiye özel: createEntryFor ile seçilen müşterinin user_id'sine yazılır.
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getEntries, createEntryFor, deleteEntry, getMembers } from '../../api/client';
import { useLang } from '../../i18n';
import { COLORS } from '../../theme';
import { localDate } from '../../dates';

// Detaylı vücut analizi alanları (Tanita/FormLab tarzı) — etiketler i18n fld_<key>
export const RECORD_FIELDS = ['weight', 'fat', 'fat_mass', 'muscle', 'water', 'bone', 'bmi', 'visceral', 'metabolic_age', 'bmr', 'protein', 'mineral', 'waist', 'hip', 'chest', 'arm'];

export default function ManageRecords({ businessId, theme }) {
  const { t } = useLang();
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
    if (!sel) return Alert.alert(t('select_customer'));
    if (!Object.values(f).some((v) => String(v).trim())) return Alert.alert(t('empty'), t('enter_a_value'));
    setSaving(true);
    try {
      await createEntryFor(businessId, 'records', sel, { date: localDate(), ...f });
      setF({}); await load();
    } catch (e) { Alert.alert(t('error'), t('not_saved')); } finally { setSaving(false); }
  };
  const del = (id) => Alert.alert(t('delete'), t('delete_record_q'), [
    { text: t('cancel'), style: 'cancel' },
    { text: t('delete'), style: 'destructive', onPress: async () => { await deleteEntry(businessId, 'records', id); load(); } },
  ]);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={theme} />;
  const recs = entries.filter((e) => Number(e.user_id) === Number(sel)).sort((a, b) => (a.data.date < b.data.date ? 1 : -1));
  const selName = members.find((m) => Number(m.user_id) === Number(sel))?.user_name;

  return (
    <ScrollView contentContainerStyle={s.wrap} keyboardShouldPersistTaps="handled">
      <Text style={s.h}>{t('select_customer')}</Text>
      {members.length === 0 && <Text style={s.empty}>{t('no_active_customers')}</Text>}
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
          <Text style={s.h}>{selName} — {t('new_measurement')}</Text>
          <View style={s.grid}>
            {RECORD_FIELDS.map((k) => (
              <View key={k} style={s.cell}>
                <Text style={s.label}>{t('fld_' + k)}</Text>
                <TextInput style={s.input} value={f[k] || ''} onChangeText={(v) => setF({ ...f, [k]: v })} keyboardType="decimal-pad" placeholder="—" placeholderTextColor="#C8C8D0" />
              </View>
            ))}
          </View>
          <TextInput style={s.note} value={f.note || ''} onChangeText={(v) => setF({ ...f, note: v })} placeholder={t('note_opt')} placeholderTextColor="#B0B0C0" multiline />
          <TouchableOpacity style={[s.btn, { backgroundColor: theme }]} onPress={save} disabled={saving}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>{t('save')}</Text>}
          </TouchableOpacity>

          <Text style={s.h}>{t('history')} ({recs.length})</Text>
          {recs.length === 0 && <Text style={s.empty}>{t('no_record_customer')}</Text>}
          {recs.map((e) => (
            <View key={e.id} style={s.rec}>
              <View style={s.recTop}>
                <Text style={s.recDate}>{e.data.date}</Text>
                <TouchableOpacity onPress={() => del(e.id)}><Ionicons name="trash-outline" size={18} color={COLORS.danger} /></TouchableOpacity>
              </View>
              <View style={s.recVals}>
                {RECORD_FIELDS.filter((k) => e.data[k]).map((k) => (
                  <View key={k} style={s.recValBox}><Text style={s.recValLabel}>{t('fld_' + k).replace(/ \(.*\)/, '')}</Text><Text style={s.recVal}>{e.data[k]}</Text></View>
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
