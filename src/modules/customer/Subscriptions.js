// Müşteri üyelik: planları gör, abone ol, üyelik kartını göster.
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getItems, getEntries, createEntry } from '../../api/client';
import { useLang } from '../../i18n';
import { COLORS } from '../../theme';

export default function Subscriptions({ businessId, theme }) {
  const { t } = useLang();
  const [plans, setPlans] = useState([]);
  const [mine, setMine] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [its, ent] = await Promise.all([getItems(businessId, 'subscriptions'), getEntries(businessId, 'subscriptions')]);
      setPlans(its);
      setMine((ent.entries || []).find((e) => e.status !== 'cancelled') || null);
    } finally { setLoading(false); }
  }, [businessId]);
  useEffect(() => { load(); }, [load]);

  const subscribe = async (plan) => {
    await createEntry(businessId, 'subscriptions', { plan_name: plan.data.name, price: plan.data.price, started: new Date().toISOString().slice(0, 10), checkins: 0 }, 'active');
    Alert.alert(t('membership_started'), plan.data.name); load();
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={theme} />;

  return (
    <ScrollView contentContainerStyle={s.wrap}>
      {mine ? (
        <View style={[s.card, { backgroundColor: theme }]}>
          <View style={s.cardTop}><Ionicons name="ticket" size={26} color="#fff" /><Text style={s.cardLabel}>{t('active_membership')}</Text></View>
          <Text style={s.cardPlan}>{mine.data.plan_name}</Text>
          <Text style={s.cardMeta}>{t('started_label')}: {mine.data.started}  ·  {t('checkins_label')}: {mine.data.checkins || 0}</Text>
          <View style={s.qr}><Ionicons name="qr-code" size={90} color={theme} /><Text style={s.qrCode}>#{mine.id}</Text></View>
          <Text style={s.qrNote}>{t('show_code_at_entry')}</Text>
        </View>
      ) : (
        <>
          <Text style={s.h}>{t('membership_plans')}</Text>
          {plans.length === 0 && <Text style={s.empty}>{t('no_plans')}</Text>}
          {plans.map((p) => (
            <View key={p.id} style={s.plan}>
              <View style={{ flex: 1 }}>
                <Text style={s.planName}>{p.data.name}</Text>
                <Text style={s.planMeta}>{p.data.price} ₺{p.data.period ? ` / ${p.data.period}` : ''}</Text>
              </View>
              <TouchableOpacity style={[s.subBtn, { backgroundColor: theme }]} onPress={() => subscribe(p)}><Text style={s.subText}>{t('subscribe')}</Text></TouchableOpacity>
            </View>
          ))}
        </>
      )}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 18 },
  h: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginBottom: 10 },
  empty: { color: COLORS.muted },
  card: { borderRadius: 18, padding: 22, alignItems: 'center' },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardLabel: { color: '#fff', fontWeight: '700', opacity: 0.9 },
  cardPlan: { color: '#fff', fontSize: 26, fontWeight: '900', marginTop: 8 },
  cardMeta: { color: '#fff', opacity: 0.9, marginTop: 4, fontSize: 13 },
  qr: { backgroundColor: '#fff', borderRadius: 16, padding: 18, alignItems: 'center', marginTop: 18 },
  qrCode: { fontWeight: '800', color: COLORS.text, marginTop: 6, fontSize: 16 },
  qrNote: { color: '#fff', opacity: 0.9, marginTop: 12, fontSize: 13 },
  plan: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 8 },
  planName: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  planMeta: { fontSize: 14, color: COLORS.muted, marginTop: 2 },
  subBtn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10 },
  subText: { color: '#fff', fontWeight: '700' },
});
