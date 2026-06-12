// Mini admin mesajlaşma: WhatsApp tarzı — kişi listesi (en yeni üstte) → seç → thread → yanıtla.
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getEntries, createEntryFor } from '../../api/client';
import { COLORS } from '../../theme';

const fmtTime = (iso) => {
  if (!iso) return '';
  const d = new Date(iso); const t = new Date();
  return d.toDateString() === t.toDateString()
    ? d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
};

export default function ManageMessaging({ businessId, theme }) {
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(null);
  const [text, setText] = useState('');
  const [q, setQ] = useState('');
  const ref = useRef(null);

  const load = useCallback(async () => {
    try { setAll((await getEntries(businessId, 'messaging')).entries || []); } finally { setLoading(false); }
  }, [businessId]);
  useEffect(() => { load(); }, [load]);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={theme} />;

  // thread = müşteri user_id. msgs backend'den created_at DESC gelir.
  const threads = {};
  all.forEach((m) => { const k = m.user_id; if (k != null) (threads[k] = threads[k] || { id: k, name: m.user_name, msgs: [] }).msgs.push(m); });
  const list = Object.values(threads).sort((a, b) => (a.msgs[0]?.created_at < b.msgs[0]?.created_at ? 1 : -1));

  if (open != null) {
    const t = threads[open] || { name: 'Müşteri', msgs: [] };
    const ordered = t.msgs.slice().reverse(); // eskiden yeniye
    const reply = async () => {
      if (!text.trim()) return; const x = text.trim(); setText('');
      await createEntryFor(businessId, 'messaging', Number(open), { text: x, from: 'seller' }, 'new');
      load();
    };
    return (
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
        <TouchableOpacity style={s.threadHead} onPress={() => setOpen(null)}>
          <Ionicons name="chevron-back" size={22} color={theme} />
          <View style={[s.avatarSm, { backgroundColor: theme }]}><Text style={s.avatarSmText}>{(t.name || '?')[0].toUpperCase()}</Text></View>
          <Text style={s.threadName}>{t.name || 'Müşteri'}</Text>
        </TouchableOpacity>
        <ScrollView ref={ref} contentContainerStyle={s.wrap} onContentSizeChange={() => ref.current?.scrollToEnd({ animated: true })}>
          {ordered.map((m) => {
            const seller = m.data.from === 'seller';
            return (
              <View key={m.id} style={[s.bubbleWrap, seller ? { alignItems: 'flex-end' } : { alignItems: 'flex-start' }]}>
                <View style={[s.bubble, seller ? [s.mine, { backgroundColor: theme }] : s.theirs]}>
                  <Text style={[s.msgText, seller && { color: '#fff' }]}>{m.data.text}</Text>
                </View>
                <Text style={s.time}>{fmtTime(m.created_at)}</Text>
              </View>
            );
          })}
        </ScrollView>
        <View style={s.bar}>
          <TextInput style={s.input} value={text} onChangeText={setText} placeholder="Yanıt yaz..." placeholderTextColor="#B0B0C0" />
          <TouchableOpacity style={[s.send, { backgroundColor: theme }]} onPress={reply}><Ionicons name="send" size={20} color="#fff" /></TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  const shown = list.filter((t) => !q.trim() || (t.name || '').toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <View style={{ flex: 1 }}>
      <View style={s.searchWrap}>
        <Ionicons name="search" size={18} color={COLORS.muted} />
        <TextInput style={s.search} value={q} onChangeText={setQ} placeholder="Kişi ara..." placeholderTextColor="#B0B0C0" />
      </View>
      <ScrollView contentContainerStyle={{ padding: 12 }}>
        {list.length === 0 && <Text style={s.empty}>Henüz mesaj yok. Müşteriler yazınca burada görünür.</Text>}
        {shown.map((t) => {
          const last = t.msgs[0];
          return (
            <TouchableOpacity key={t.id} style={s.threadRow} onPress={() => setOpen(String(t.id))}>
              <View style={[s.avatar, { backgroundColor: theme }]}><Text style={s.avatarText}>{(t.name || '?')[0].toUpperCase()}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.tName}>{t.name || 'Müşteri'}</Text>
                <Text style={s.tLast} numberOfLines={1}>{last?.data.from === 'seller' ? 'Sen: ' : ''}{last?.data.text}</Text>
              </View>
              <Text style={s.tTime}>{fmtTime(last?.created_at)}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  empty: { color: COLORS.muted, textAlign: 'center', marginTop: 40 },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, margin: 12, marginBottom: 0, backgroundColor: '#F1F1F7', borderRadius: 12, paddingHorizontal: 12 },
  search: { flex: 1, paddingVertical: 10, fontSize: 15, color: COLORS.text },
  threadRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8 },
  avatar: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 18 },
  avatarSm: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  avatarSmText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  tName: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  tLast: { fontSize: 13, color: COLORS.muted, marginTop: 2 },
  tTime: { fontSize: 12, color: COLORS.muted },
  threadHead: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: '#fff' },
  threadName: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  wrap: { padding: 16, paddingBottom: 8 },
  bubbleWrap: { marginBottom: 8 },
  bubble: { maxWidth: '82%', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  mine: { borderBottomRightRadius: 4 },
  theirs: { backgroundColor: '#fff', borderBottomLeftRadius: 4 },
  msgText: { fontSize: 15, color: COLORS.text, lineHeight: 21 },
  time: { fontSize: 10, color: COLORS.muted, marginTop: 2, marginHorizontal: 4 },
  bar: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: '#fff' },
  input: { flex: 1, backgroundColor: '#F1F1F7', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 11, fontSize: 15, color: COLORS.text },
  send: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});
