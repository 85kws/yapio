// Müşteri sadakat kartı: damga ilerlemesi. Kart yoksa otomatik oluşur.
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { getItems, getEntries, createEntry } from '../../api/client';
import { useLang } from '../../i18n';
import { COLORS } from '../../theme';
import { SkeletonList, useRefresh } from '../../components/ui';

export default function Loyalty({ businessId, theme }) {
  const { t } = useLang();
  const [goal, setGoal] = useState(10);
  const [reward, setReward] = useState('');
  const [stamps, setStamps] = useState(0);
  const [cardId, setCardId] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [items, ent] = await Promise.all([getItems(businessId, 'loyalty'), getEntries(businessId, 'loyalty')]);
      const cfg = items[0]?.data || {};
      setGoal(cfg.goal || 10); setReward(cfg.reward || '');
      let card = (ent.entries || [])[0];
      if (!card) { card = await createEntry(businessId, 'loyalty', { stamps: 0 }); setStamps(0); }
      else setStamps(card.data.stamps || 0);
      setCardId(card?.id || null);
    } finally { setLoading(false); }
  }, [businessId]);
  useEffect(() => { load(); }, [load]);
  const { refreshing, onRefresh } = useRefresh(load);

  if (loading) return <SkeletonList theme={theme} rows={3} />;

  const done = stamps >= goal;
  return (
    <ScrollView
      contentContainerStyle={s.wrap}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme} colors={[theme]} />}
    >
      <View style={[s.card, { backgroundColor: theme }]}>
        <Text style={s.cardTitle}>{t('my_loyalty_card')}</Text>
        <Text style={s.cardCount}>{stamps} / {goal}</Text>
        {reward ? <Text style={s.cardReward}>{t('reward')}: {reward}</Text> : null}
      </View>

      <View style={s.dots}>
        {Array.from({ length: goal }, (_, i) => (
          <View key={i} style={[s.dot, { borderColor: theme }, i < stamps && { backgroundColor: theme }]}>
            {i < stamps ? <Ionicons name="checkmark" size={16} color="#fff" /> : <Text style={[s.dotNum, { color: theme }]}>{i + 1}</Text>}
          </View>
        ))}
      </View>

      {done ? (
        <View style={[s.banner, { backgroundColor: '#E7F7EF' }]}><Ionicons name="gift" size={22} color={COLORS.success} /><Text style={s.bannerText}>{t('loyalty_won')}</Text></View>
      ) : (
        <Text style={s.note}>{t('loyalty_note')}</Text>
      )}

      {cardId ? (
        <View style={s.qrBox}>
          <QRCode value={`yapio:loy:${businessId}:${cardId}`} size={130} color={COLORS.text} backgroundColor="#FFFFFF" />
          <Text style={s.qrNote}>{t('loyalty_qr_note')}</Text>
        </View>
      ) : null}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 18 },
  card: { borderRadius: 18, padding: 24, alignItems: 'center' },
  cardTitle: { color: '#fff', fontSize: 16, fontWeight: '700', opacity: 0.9 },
  cardCount: { color: '#fff', fontSize: 44, fontWeight: '900', marginTop: 4 },
  cardReward: { color: '#fff', fontSize: 14, marginTop: 4, opacity: 0.9 },
  dots: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginTop: 24 },
  dot: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  dotNum: { fontWeight: '700' },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 12, padding: 16, marginTop: 24 },
  bannerText: { flex: 1, fontSize: 14, color: COLORS.text, fontWeight: '600' },
  note: { textAlign: 'center', color: COLORS.muted, marginTop: 24, fontSize: 14 },
  qrBox: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 20, marginTop: 20 },
  qrNote: { color: COLORS.muted, fontSize: 12, marginTop: 10, textAlign: 'center' },
});
