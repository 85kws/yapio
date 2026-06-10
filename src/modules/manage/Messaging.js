// Satıcı mesajlaşma: müşteri thread'leri → seç → yanıtla.
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getEntries, createEntryFor } from '../../api/client';
import { COLORS } from '../../theme';

export default function ManageMessaging({ businessId, theme }) {
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(null); // customer user_id
  const [text, setText] = useState('');

  const load = useCallback(async () => {
    try { setAll((await getEntries(businessId, 'messaging')).entries || []); } finally { setLoading(false); }
  }, [businessId]);
  useEffect(() => { load(); }, [load]);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={theme} />;

  // thread = user_id (mesajların ait olduğu müşteri)
  const threads = {};
  all.forEach((m) => { const k = m.user_id; if (k != null) (threads[k] = threads[k] || { name: m.user_name, msgs: [] }).msgs.push(m); });

  if (open != null) {
    const t = threads[open] || { name: 'Müşteri', msgs: [] };
    const ordered = t.msgs.slice().reverse();
    const reply = async () => {
      if (!text.trim()) return; const x = text.trim(); setText('');
      // Müşterinin thread'ine (user_id=open) satıcı mesajı yaz
      await createEntryFor(businessId, 'messaging', Number(open), { text: x, from: 'seller' }, 'new');
      load();
    };
    return (
      <View style={{ flex: 1 }}>
        <TouchableOpacity style={s.threadHead} onPress={() => setOpen(null)}><Ionicons name="chevron-back" size={20} color={theme} /><Text style={[s.threadName, { color: theme }]}>{t.name || 'Müşteri'}</Text></TouchableOpacity>
        <ScrollView contentContainerStyle={s.wrap}>
          {ordered.map((m) => {
            const seller = m.data.from === 'seller';
            return <View key={m.id} style={[s.bubble, seller ? [s.mine, { backgroundColor: theme }] : s.theirs]}><Text style={[s.msgText, seller && { color: '#fff' }]}>{m.data.text}</Text></View>;
          })}
        </ScrollView>
        <View style={s.bar}>
          <TextInput style={s.input} value={text} onChangeText={setText} placeholder="Yanıt yaz..." placeholderTextColor="#B0B0C0" />
          <TouchableOpacity style={[s.send, { backgroundColor: theme }]} onPress={reply}><Ionicons name="send" size={20} color="#fff" /></TouchableOpacity>
        </View>
      </View>
    );
  }

  const keys = Object.keys(threads);
  return (
    <ScrollView contentContainerStyle={s.wrap}>
      <Text style={s.h}>Mesajlar ({keys.length})</Text>
      {keys.length === 0 && <Text style={s.empty}>Henüz mesaj yok.</Text>}
      {keys.map((k) => {
        const t = threads[k]; const last = t.msgs[0];
        return (
          <TouchableOpacity key={k} style={s.threadRow} onPress={() => setOpen(k)}>
            <View style={[s.avatar, { backgroundColor: theme }]}><Text style={s.avatarText}>{(t.name || '?')[0].toUpperCase()}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={s.tName}>{t.name || 'Müşteri'}</Text>
              <Text style={s.tLast} numberOfLines={1}>{last?.data.text}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 16 },
  h: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginBottom: 10 },
  empty: { color: COLORS.muted },
  threadRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 18 },
  tName: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  tLast: { fontSize: 13, color: COLORS.muted, marginTop: 2 },
  threadHead: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: '#fff' },
  threadName: { fontSize: 16, fontWeight: '800' },
  bubble: { maxWidth: '80%', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 8 },
  mine: { alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  theirs: { alignSelf: 'flex-start', backgroundColor: '#fff', borderBottomLeftRadius: 4 },
  msgText: { fontSize: 15, color: COLORS.text, lineHeight: 21 },
  bar: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: '#fff' },
  input: { flex: 1, backgroundColor: '#F1F1F7', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 11, fontSize: 15, color: COLORS.text },
  send: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});
