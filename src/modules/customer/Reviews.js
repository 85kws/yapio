// Müşteri yorumlar: puan + yorum bırak, tüm yorumları gör.
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getEntries, createEntry } from '../../api/client';
import { useLang } from '../../i18n';
import { COLORS } from '../../theme';
import { SkeletonList, useRefresh } from '../../components/ui';
import { success, tap } from '../../haptics';

export default function Reviews({ businessId, theme }) {
  const { t } = useLang();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const load = useCallback(async () => {
    try { setList((await getEntries(businessId, 'reviews')).entries || []); } finally { setLoading(false); }
  }, [businessId]);
  useEffect(() => { load(); }, [load]);
  const { refreshing, onRefresh } = useRefresh(load);

  const submit = async () => {
    if (!rating) return;
    await createEntry(businessId, 'reviews', { rating, comment: comment.trim() });
    setRating(0); setComment(''); success(); load();
  };

  if (loading) return <SkeletonList theme={theme} rows={3} />;
  const avg = list.length ? (list.reduce((a, e) => a + (e.data.rating || 0), 0) / list.length).toFixed(1) : '—';

  return (
    <ScrollView
      contentContainerStyle={s.wrap}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme} colors={[theme]} />}
    >
      <View style={s.avgBox}>
        <Text style={[s.avgNum, { color: theme }]}>{avg}</Text>
        <Stars n={Math.round(Number(avg) || 0)} color={theme} size={18} />
        <Text style={s.avgCount}>{list.length} {t('reviews_count')}</Text>
      </View>

      <Text style={s.h}>{t('rate')}</Text>
      <View style={s.pick}>
        {[1, 2, 3, 4, 5].map((i) => (
          <TouchableOpacity key={i} onPress={() => { tap(); setRating(i); }}><Ionicons name={i <= rating ? 'star' : 'star-outline'} size={32} color={theme} /></TouchableOpacity>
        ))}
      </View>
      <TextInput style={s.input} value={comment} onChangeText={setComment} placeholder={t('comment_ph')} placeholderTextColor="#B0B0C0" multiline />
      <TouchableOpacity style={[s.btn, { backgroundColor: theme }, !rating && { opacity: 0.4 }]} onPress={submit}><Text style={s.btnText}>{t('submit')}</Text></TouchableOpacity>

      <Text style={s.h}>{t('reviews_label')}</Text>
      {list.map((e) => (
        <View key={e.id} style={s.row}>
          <View style={s.rowTop}><Text style={s.who}>{e.user_name || t('user')}</Text><Stars n={e.data.rating} color={theme} size={14} /></View>
          {e.data.comment ? <Text style={s.comment}>{e.data.comment}</Text> : null}
        </View>
      ))}
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const Stars = ({ n, color, size }) => (
  <View style={{ flexDirection: 'row' }}>{[1, 2, 3, 4, 5].map((i) => <Ionicons key={i} name={i <= n ? 'star' : 'star-outline'} size={size} color={color} />)}</View>
);

const s = StyleSheet.create({
  wrap: { padding: 18 },
  avgBox: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 20, gap: 6 },
  avgNum: { fontSize: 44, fontWeight: '900' },
  avgCount: { color: COLORS.muted, fontSize: 13 },
  h: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginTop: 18, marginBottom: 10 },
  pick: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  input: { backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 11, fontSize: 15, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border, minHeight: 60, textAlignVertical: 'top' },
  btn: { borderRadius: 12, paddingVertical: 13, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  row: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  who: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  comment: { fontSize: 14, color: COLORS.muted, marginTop: 4, lineHeight: 20 },
});
