// Mini admin program yönetimi: MÜŞTERİ SEÇ → kişiye özel program (başlık + bölümler) ata.
// Bölümler: ör. Kahvaltı/Öğle/Akşam ya da Pazartesi/Salı ya da Hareket 1/2/3. createEntryFor ile kişiye yazılır.
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getEntries, createEntryFor, deleteEntry, getMembers } from '../../api/client';
import { COLORS } from '../../theme';

const emptySection = () => ({ heading: '', content: '' });

export default function ManagePlans({ businessId, theme }) {
  const [members, setMembers] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState(null);
  const [title, setTitle] = useState('');
  const [sections, setSections] = useState([emptySection()]);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const [m, e] = await Promise.all([getMembers(businessId), getEntries(businessId, 'plans')]);
      setMembers(m.filter((x) => x.status === 'active'));
      setEntries(e.entries || []);
    } catch (err) { console.warn(err?.message); } finally { setLoading(false); }
  }, [businessId]);
  useEffect(() => { load(); }, [load]);

  const setSec = (i, patch) => setSections((ss) => ss.map((x, idx) => idx === i ? { ...x, ...patch } : x));
  const addSec = () => setSections((ss) => [...ss, emptySection()]);
  const rmSec = (i) => setSections((ss) => ss.length > 1 ? ss.filter((_, idx) => idx !== i) : ss);

  const save = async () => {
    if (!sel) return Alert.alert('Müşteri seç', 'Önce bir müşteri seç.');
    if (!title.trim()) return Alert.alert('Başlık', 'Program başlığı gir.');
    const secs = sections.filter((x) => x.heading.trim() || x.content.trim());
    setSaving(true);
    try {
      await createEntryFor(businessId, 'plans', sel, { title: title.trim(), sections: secs, date: new Date().toISOString().slice(0, 10) });
      setTitle(''); setSections([emptySection()]); await load();
      Alert.alert('Atandı', 'Program müşteriye atandı.');
    } catch (e) { Alert.alert('Hata', 'Atanamadı'); } finally { setSaving(false); }
  };
  const del = (id) => Alert.alert('Sil', 'Program silinsin mi?', [
    { text: 'Vazgeç', style: 'cancel' },
    { text: 'Sil', style: 'destructive', onPress: async () => { await deleteEntry(businessId, 'plans', id); load(); } },
  ]);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={theme} />;
  const progs = entries.filter((e) => Number(e.user_id) === Number(sel)).sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
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
          <Text style={s.h}>{selName} — Yeni Program</Text>
          <TextInput style={s.input} value={title} onChangeText={setTitle} placeholder="Program başlığı (örn: 1. Hafta Diyeti)" placeholderTextColor="#B0B0C0" />
          {sections.map((sec, i) => (
            <View key={i} style={s.secBox}>
              <View style={s.secHead}>
                <TextInput style={[s.input, { flex: 1, marginBottom: 0 }]} value={sec.heading} onChangeText={(v) => setSec(i, { heading: v })} placeholder={`Bölüm başlığı (örn: Kahvaltı)`} placeholderTextColor="#B0B0C0" />
                {sections.length > 1 ? <TouchableOpacity onPress={() => rmSec(i)} style={{ padding: 6 }}><Ionicons name="close-circle" size={22} color={COLORS.muted} /></TouchableOpacity> : null}
              </View>
              <TextInput style={[s.input, s.multi]} value={sec.content} onChangeText={(v) => setSec(i, { content: v })} placeholder="İçerik (öğün/hareket detayı...)" placeholderTextColor="#B0B0C0" multiline />
            </View>
          ))}
          <TouchableOpacity style={s.addSec} onPress={addSec}><Ionicons name="add" size={18} color={theme} /><Text style={[s.addSecText, { color: theme }]}>Bölüm ekle</Text></TouchableOpacity>
          <TouchableOpacity style={[s.btn, { backgroundColor: theme }]} onPress={save} disabled={saving}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Müşteriye Ata</Text>}
          </TouchableOpacity>

          <Text style={s.h}>{selName} — Programları ({progs.length})</Text>
          {progs.length === 0 && <Text style={s.empty}>Bu müşteride program yok.</Text>}
          {progs.map((e) => (
            <View key={e.id} style={s.prog}>
              <View style={s.progTop}>
                <Text style={s.progTitle}>{e.data.title}</Text>
                <TouchableOpacity onPress={() => del(e.id)}><Ionicons name="trash-outline" size={18} color={COLORS.danger} /></TouchableOpacity>
              </View>
              {(e.data.sections || []).map((sec, i) => (
                <View key={i} style={{ marginTop: 6 }}>
                  {sec.heading ? <Text style={s.progSecH}>{sec.heading}</Text> : null}
                  {sec.content ? <Text style={s.progSecC}>{sec.content}</Text> : null}
                </View>
              ))}
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
  input: { backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, fontSize: 15, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border, marginBottom: 8 },
  multi: { minHeight: 70, textAlignVertical: 'top' },
  secBox: { backgroundColor: '#F7F7FB', borderRadius: 12, padding: 10, marginBottom: 8 },
  secHead: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  addSec: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 10, marginBottom: 6 },
  addSecText: { fontWeight: '700' },
  btn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 6 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  prog: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8 },
  progTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  progTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  progSecH: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  progSecC: { fontSize: 14, color: COLORS.muted, marginTop: 1, lineHeight: 20 },
});
