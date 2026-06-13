// Danışan program görünümü: kendine ATANAN programlar (mini admin atar), akordeon + bölümler.
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getEntries } from '../../api/client';
import { useLang } from '../../i18n';
import { COLORS } from '../../theme';
import { SkeletonList, EmptyState, useRefresh } from '../../components/ui';
import { tap } from '../../haptics';

export default function Plans({ businessId, theme }) {
  const { t } = useLang();
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(null);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    try { setItems(((await getEntries(businessId, 'plans')).entries || []).sort((a, b) => (a.created_at < b.created_at ? 1 : -1))); }
    finally { setLoading(false); }
  }, [businessId]);
  useEffect(() => { load(); }, [load]);
  const { refreshing, onRefresh } = useRefresh(load);
  const rc = <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme} colors={[theme]} />;

  if (loading) return <SkeletonList theme={theme} rows={3} />;
  if (!items.length) return (
    <ScrollView contentContainerStyle={s.wrap} refreshControl={rc}>
      <EmptyState icon="clipboard-outline" text={t('no_assigned_program')} theme={theme} />
    </ScrollView>
  );

  return (
    <ScrollView contentContainerStyle={s.wrap} refreshControl={rc}>
      {items.map((it, idx) => {
        const isOpen = open === it.id || (open === null && idx === 0); // ilkini açık başlat
        const secs = it.data.sections || (it.data.body ? [{ heading: '', content: it.data.body }] : []);
        return (
          <View key={it.id} style={s.card}>
            <TouchableOpacity style={s.cardTop} activeOpacity={0.8} onPress={() => { tap(); setOpen(isOpen ? -1 : it.id); }}>
              <View style={{ flex: 1 }}>
                <Text style={s.title}>{it.data.title}</Text>
                {it.data.date ? <Text style={s.date}>{it.data.date}</Text> : null}
              </View>
              <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={20} color={COLORS.muted} />
            </TouchableOpacity>
            {isOpen ? (
              <View style={s.body}>
                {secs.length === 0 ? <Text style={s.secContent}>—</Text> : secs.map((sec, i) => (
                  <View key={i} style={s.sec}>
                    {sec.heading ? <View style={s.secHeadRow}><View style={[s.dot, { backgroundColor: theme }]} /><Text style={s.secHead}>{sec.heading}</Text></View> : null}
                    {sec.content ? <Text style={s.secContent}>{sec.content}</Text> : null}
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        );
      })}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 18, flexGrow: 1 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10 },
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  date: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  body: { marginTop: 10 },
  sec: { marginBottom: 12 },
  secHeadRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 3 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  secHead: { fontSize: 15, fontWeight: '800', color: COLORS.text },
  secContent: { fontSize: 15, color: COLORS.text, lineHeight: 23, paddingLeft: 14 },
});
