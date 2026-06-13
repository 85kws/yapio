// Müşteri mesajlaşma: işletmeyle birebir thread.
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, RefreshControl, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getEntries, createEntry } from '../../api/client';
import { useLang } from '../../i18n';
import { COLORS } from '../../theme';
import { SkeletonList, useRefresh } from '../../components/ui';
import { light } from '../../haptics';

const fmtTime = (iso) => {
  if (!iso) return '';
  const d = new Date(iso), now = new Date();
  return d.toDateString() === now.toDateString()
    ? d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
};

export default function Messaging({ businessId, theme }) {
  const { t } = useLang();
  const [msgs, setMsgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const ref = useRef(null);

  const load = useCallback(async () => {
    try {
      const e = (await getEntries(businessId, 'messaging')).entries || [];
      setMsgs(e.slice().reverse());
    } finally { setLoading(false); }
  }, [businessId]);
  useEffect(() => { load(); }, [load]);
  const { refreshing, onRefresh } = useRefresh(load);

  const send = async () => {
    if (!text.trim()) return;
    const body = text.trim(); setText(''); light();
    await createEntry(businessId, 'messaging', { text: body, from: 'customer' });
    load();
  };

  if (loading) return <SkeletonList theme={theme} rows={3} />;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <ScrollView ref={ref} contentContainerStyle={s.wrap} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme} colors={[theme]} />} onContentSizeChange={() => ref.current?.scrollToEnd({ animated: true })}>
        {msgs.length === 0 && <Text style={s.empty}>{t('write_first_message')}</Text>}
        {msgs.map((m) => {
          const mine = m.data.from === 'customer';
          return (
            <View key={m.id} style={[s.bubbleWrap, mine ? { alignItems: 'flex-end' } : { alignItems: 'flex-start' }]}>
              <View style={[s.bubble, mine ? [s.mine, { backgroundColor: theme }] : s.theirs]}>
                <Text style={[s.msgText, mine && { color: '#fff' }]}>{m.data.text}</Text>
              </View>
              <Text style={s.time}>{fmtTime(m.created_at)}</Text>
            </View>
          );
        })}
      </ScrollView>
      <View style={s.bar}>
        <TextInput style={s.input} value={text} onChangeText={setText} placeholder={t('message_ph')} placeholderTextColor="#B0B0C0" />
        <TouchableOpacity style={[s.send, { backgroundColor: theme }]} onPress={send}><Ionicons name="send" size={20} color="#fff" /></TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 16, paddingBottom: 8 },
  empty: { textAlign: 'center', color: COLORS.muted, marginTop: 40 },
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
