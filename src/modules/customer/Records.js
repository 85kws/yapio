// Danışan ölçüm görünümü: kendi vücut analizi geçmişi (mini admin girer), salt-okunur.
// En son ölçüm + bir önceki ölçüme göre kilo değişimi + tüm detaylar.
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getEntries } from '../../api/client';
import { useLang } from '../../i18n';
import { COLORS } from '../../theme';
import { SkeletonList, EmptyState, useRefresh } from '../../components/ui';

const FIELDS = ['weight', 'fat', 'fat_mass', 'muscle', 'water', 'bone', 'bmi', 'visceral', 'metabolic_age', 'bmr', 'protein', 'mineral', 'waist', 'hip', 'chest', 'arm'];

export default function Records({ businessId, theme }) {
  const { t } = useLang();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    try { setList(((await getEntries(businessId, 'records')).entries || []).sort((a, b) => (a.data.date < b.data.date ? 1 : -1))); }
    finally { setLoading(false); }
  }, [businessId]);
  useEffect(() => { load(); }, [load]);
  const { refreshing, onRefresh } = useRefresh(load);
  const rc = <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme} colors={[theme]} />;

  if (loading) return <SkeletonList theme={theme} rows={3} />;
  if (!list.length) return (
    <ScrollView contentContainerStyle={s.wrap} refreshControl={rc}>
      <EmptyState icon="fitness-outline" text={t('no_measurements')} theme={theme} />
    </ScrollView>
  );

  const latest = list[0];
  const prev = list[1];
  const wNow = parseFloat(latest.data.weight);
  const wPrev = prev ? parseFloat(prev.data.weight) : NaN;
  const delta = (!isNaN(wNow) && !isNaN(wPrev)) ? +(wNow - wPrev).toFixed(1) : null;

  return (
    <ScrollView contentContainerStyle={s.wrap} refreshControl={rc}>
      {/* Özet kartı */}
      <View style={[s.summary, { backgroundColor: theme }]}>
        <Text style={s.sumLabel}>{t('last_measurement')} · {latest.data.date}</Text>
        <View style={s.sumRow}>
          <Text style={s.sumWeight}>{latest.data.weight || '—'}<Text style={s.sumUnit}> kg</Text></Text>
          {delta !== null && (
            <View style={s.deltaBox}>
              <Ionicons name={delta < 0 ? 'arrow-down' : delta > 0 ? 'arrow-up' : 'remove'} size={16} color="#fff" />
              <Text style={s.deltaText}>{Math.abs(delta)} kg</Text>
            </View>
          )}
        </View>
      </View>

      <Text style={s.h}>{t('details')}</Text>
      <View style={s.detailGrid}>
        {FIELDS.filter((k) => latest.data[k]).map((k) => (
          <View key={k} style={s.detailBox}>
            <Text style={s.detailLabel}>{t('fld_' + k).replace(/ \(.*\)/, '')}</Text>
            <Text style={s.detailVal}>{latest.data[k]}</Text>
          </View>
        ))}
      </View>
      {latest.data.note ? <Text style={s.note}>{latest.data.note}</Text> : null}

      <Text style={s.h}>{t('history')} ({list.length})</Text>
      {list.map((e) => (
        <View key={e.id} style={s.row}>
          <Text style={s.date}>{e.data.date}</Text>
          <Text style={s.vals}>{FIELDS.filter((k) => e.data[k]).slice(0, 6).map((k) => `${t('fld_' + k).replace(/ \(.*\)/, '')} ${e.data[k]}`).join('  ·  ')}</Text>
          {e.data.note ? <Text style={s.rowNote}>{e.data.note}</Text> : null}
        </View>
      ))}
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 18, flexGrow: 1 },
  summary: { borderRadius: 18, padding: 20 },
  sumLabel: { color: '#fff', opacity: 0.9, fontSize: 13, fontWeight: '600' },
  sumRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 6 },
  sumWeight: { color: '#fff', fontSize: 40, fontWeight: '900' },
  sumUnit: { fontSize: 20, fontWeight: '700' },
  deltaBox: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  deltaText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  h: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginTop: 18, marginBottom: 10 },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  detailBox: { backgroundColor: '#fff', borderRadius: 12, padding: 12, width: '31%', borderWidth: 1, borderColor: COLORS.border },
  detailLabel: { fontSize: 11, color: COLORS.muted, fontWeight: '600' },
  detailVal: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginTop: 2 },
  detailUnit: { fontSize: 12, fontWeight: '600', color: COLORS.muted },
  note: { fontSize: 14, color: COLORS.muted, marginTop: 10, fontStyle: 'italic' },
  row: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8 },
  date: { fontSize: 13, color: COLORS.muted, fontWeight: '700' },
  vals: { fontSize: 14, color: COLORS.text, marginTop: 3, lineHeight: 20 },
  rowNote: { fontSize: 13, color: COLORS.muted, marginTop: 3 },
});
