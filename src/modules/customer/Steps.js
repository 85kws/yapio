// Adım Sayar — telefonun hareket sensöründen GERÇEK günlük adım (expo-sensors Pedometer).
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Pedometer } from 'expo-sensors';
import { getItems } from '../../api/client';
import { useLang } from '../../i18n';
import { COLORS } from '../../theme';

export default function Steps({ businessId, theme }) {
  const { t } = useLang();
  const [available, setAvailable] = useState(null);
  const [live, setLive] = useState(0);
  const [goal, setGoal] = useState(8000);
  const baseRef = useRef(0);

  const loadGoal = useCallback(async () => {
    try { const its = await getItems(businessId, 'steps'); const g = its?.[0]?.data?.goal; if (g) setGoal(Number(g)); } catch {}
  }, [businessId]);

  useEffect(() => {
    let sub;
    loadGoal();
    (async () => {
      const ok = await Pedometer.isAvailableAsync().catch(() => false);
      setAvailable(ok);
      if (!ok) return;
      const end = new Date();
      const start = new Date(); start.setHours(0, 0, 0, 0);
      try { const r = await Pedometer.getStepCountAsync(start, end); baseRef.current = r?.steps || 0; } catch { baseRef.current = 0; }
      setLive(0);
      sub = Pedometer.watchStepCount((res) => setLive(res.steps || 0));
    })();
    return () => { sub && sub.remove && sub.remove(); };
  }, [loadGoal]);

  if (available === null) return <ActivityIndicator style={{ marginTop: 40 }} color={theme} />;
  if (!available) {
    return (
      <View style={s.emptyWrap}>
        <Ionicons name="walk-outline" size={48} color={COLORS.muted} />
        <Text style={s.emptyText}>{t('steps_not_supported')}</Text>
      </View>
    );
  }

  const steps = baseRef.current + live;
  const pct = Math.min(100, Math.round((steps / goal) * 100));
  const km = (steps * 0.000762).toFixed(2);
  const kcal = Math.round(steps * 0.04);

  return (
    <ScrollView contentContainerStyle={s.wrap}>
      <View style={[s.hero, { backgroundColor: theme }]}>
        <Ionicons name="walk" size={30} color="#fff" />
        <Text style={s.steps}>{steps.toLocaleString('tr-TR')}</Text>
        <Text style={s.stepsLabel}>{t('steps_today')}</Text>
        <View style={s.barBg}><View style={[s.barFill, { width: `${pct}%` }]} /></View>
        <Text style={s.goalText}>{t('goal')} {goal.toLocaleString('tr-TR')} · %{pct}</Text>
      </View>
      <View style={s.stats}>
        <View style={s.stat}><Ionicons name="map-outline" size={20} color={theme} /><Text style={s.statVal}>{km}</Text><Text style={s.statLabel}>km</Text></View>
        <View style={s.stat}><Ionicons name="flame-outline" size={20} color={theme} /><Text style={s.statVal}>{kcal}</Text><Text style={s.statLabel}>kcal</Text></View>
        <View style={s.stat}><Ionicons name="trophy-outline" size={20} color={theme} /><Text style={s.statVal}>%{pct}</Text><Text style={s.statLabel}>{t('goal')}</Text></View>
      </View>
      <Text style={s.note}>{t('steps_note')}</Text>
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 18 },
  emptyWrap: { padding: 50, alignItems: 'center', gap: 12 },
  emptyText: { color: COLORS.muted, fontSize: 15, textAlign: 'center' },
  hero: { borderRadius: 20, padding: 24, alignItems: 'center' },
  steps: { color: '#fff', fontSize: 52, fontWeight: '900', marginTop: 8 },
  stepsLabel: { color: '#fff', opacity: 0.9, fontSize: 14, fontWeight: '600' },
  barBg: { width: '100%', height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.25)', marginTop: 16, overflow: 'hidden' },
  barFill: { height: 10, borderRadius: 5, backgroundColor: '#fff' },
  goalText: { color: '#fff', fontWeight: '700', marginTop: 8, fontSize: 13 },
  stats: { flexDirection: 'row', gap: 10, marginTop: 14 },
  stat: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 16, alignItems: 'center', gap: 3, borderWidth: 1, borderColor: COLORS.border },
  statVal: { fontSize: 20, fontWeight: '900', color: COLORS.text },
  statLabel: { fontSize: 12, color: COLORS.muted },
  note: { fontSize: 12, color: COLORS.muted, marginTop: 14, lineHeight: 18 },
});
