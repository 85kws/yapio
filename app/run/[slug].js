// İşletme app çalışma zamanı: backend config'inden render eder (landing + modüller).
import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getAppBySlug } from '../../src/api/client';
import { COLORS } from '../../src/theme';
import { moduleIcon, sectorIcon } from '../../src/icons';
import { MODULE_INFO } from '../../src/modules';
import { CUSTOMER } from '../../src/modules/registry';
import BlockRenderer from '../../src/blocks/BlockRenderer';

export default function RunApp() {
  const router = useRouter();
  const { slug } = useLocalSearchParams();
  const [data, setData] = useState(null);
  const [openModule, setOpenModule] = useState(null);

  const load = useCallback(async () => {
    try {
      const d = await getAppBySlug(slug);
      setData(d);
    } catch (e) {
      Alert.alert('Bulunamadı', e?.response?.data?.error || 'App yüklenemedi');
      router.back();
    }
  }, [slug]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (!data) return <SafeAreaView style={{ flex: 1 }}><ActivityIndicator style={{ marginTop: 60 }} color={COLORS.primary} /></SafeAreaView>;

  const biz = data.business;
  const theme = biz.theme_json?.color || COLORS.primary;
  const modules = data.config?.modules_enabled || [];
  const landing = data.config?.landing_blocks || [];

  const onNavigate = (key) => { if (MODULE_INFO[key]) setOpenModule(key); };
  const ModuleView = openModule ? CUSTOMER[openModule] : null;

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar style="light" />
      <SafeAreaView style={{ backgroundColor: theme }} edges={['top']}>
        <View style={s.bar}>
          <TouchableOpacity onPress={() => (openModule ? setOpenModule(null) : router.back())} style={s.barBtn}><Ionicons name="chevron-back" size={26} color="#fff" /></TouchableOpacity>
          <View style={s.barCenter}>
            <Ionicons name={sectorIcon(biz.sector_key)} size={20} color="#fff" />
            <Text style={s.barTitle} numberOfLines={1}>{openModule ? MODULE_INFO[openModule].label : biz.name}</Text>
          </View>
          <TouchableOpacity onPress={() => router.replace('/(tabs)/storefront')} style={s.barBtn}><Ionicons name="close" size={24} color="#fff" /></TouchableOpacity>
        </View>
      </SafeAreaView>

      {openModule ? (
        ModuleView ? (
          <View style={{ flex: 1 }}><ModuleView businessId={biz.id} theme={theme} business={biz} /></View>
        ) : (
          <View style={s.stub}>
            <View style={[s.stubIcon, { backgroundColor: theme }]}><Ionicons name={moduleIcon(openModule)} size={40} color="#fff" /></View>
            <Text style={s.stubTitle}>{MODULE_INFO[openModule].label}</Text>
            <Text style={s.stubDesc}>{MODULE_INFO[openModule].detail}</Text>
            <View style={[s.soon, { backgroundColor: theme }]}><Text style={s.soonText}>Bu modül yapım aşamasında</Text></View>
          </View>
        )
      ) : (
        <ScrollView contentContainerStyle={s.content}>
          {landing.map((b, i) => (
            <BlockRenderer key={i} block={b} theme={theme} onNavigate={onNavigate} />
          ))}

          {modules.length > 0 && (
            <>
              <Text style={s.sectionTitle}>Özellikler</Text>
              <View style={s.modGrid}>
                {modules.map((m) => {
                  const info = MODULE_INFO[m];
                  if (!info) return null;
                  return (
                    <TouchableOpacity key={m} style={s.modCard} onPress={() => setOpenModule(m)} activeOpacity={0.8}>
                      <Ionicons name={moduleIcon(m)} size={28} color={theme} />
                      <Text style={s.modName}>{info.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          {biz.address ? <View style={s.metaRow}><Ionicons name="location-outline" size={16} color={COLORS.muted} /><Text style={s.meta}>{biz.address}</Text></View> : null}
          {biz.phone ? <View style={s.metaRow}><Ionicons name="call-outline" size={16} color={COLORS.muted} /><Text style={s.meta}>{biz.phone}</Text></View> : null}
          <View style={{ height: 30 }} />
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 10, minHeight: 52 },
  barBtn: { width: 44, height: 40, alignItems: 'center', justifyContent: 'center' },
  barCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  barTitle: { color: '#fff', fontSize: 18, fontWeight: '800', flexShrink: 1 },
  content: { padding: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginTop: 18, marginBottom: 12 },
  modGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  modCard: { width: '31%', backgroundColor: '#F7F7FB', borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginBottom: 10, gap: 6 },
  modName: { fontSize: 12, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  meta: { fontSize: 14, color: COLORS.muted },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: COLORS.border, paddingHorizontal: 20, paddingTop: 10 },
  installBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, paddingVertical: 15 },
  installText: { fontWeight: '800', fontSize: 16 },
  stub: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  stubIcon: { width: 84, height: 84, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  stubTitle: { fontSize: 24, fontWeight: '800', color: COLORS.text },
  stubDesc: { fontSize: 15, color: COLORS.muted, textAlign: 'center', marginTop: 8, lineHeight: 22 },
  soon: { marginTop: 24, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  soonText: { color: '#fff', fontWeight: '700' },
});
