// Satıcı modül yönetim ekranı. MANAGE registry'den ilgili bileşeni render eder.
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getBusiness } from '../../../src/api/client';
import { COLORS } from '../../../src/theme';
import { moduleIcon } from '../../../src/icons';
import { MODULE_INFO } from '../../../src/modules';
import { MANAGE } from '../../../src/modules/registry';
import { useLang } from '../../../src/i18n';

export default function ManageModule() {
  const router = useRouter();
  const { t } = useLang();
  const { id, module } = useLocalSearchParams();
  const [biz, setBiz] = useState(null);

  useEffect(() => { getBusiness(id).then((d) => setBiz(d.business)).catch(() => {}); }, [id]);

  const theme = biz?.theme_json?.color || COLORS.primary;
  const info = MODULE_INFO[module];
  const Comp = MANAGE[module];

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={[s.header, { backgroundColor: theme }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}><Ionicons name="chevron-back" size={26} color="#fff" /></TouchableOpacity>
        <View style={s.hCenter}>
          <Ionicons name={moduleIcon(module)} size={20} color="#fff" />
          <Text style={s.hTitle}>{info?.label || module}</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      {!biz ? <ActivityIndicator style={{ marginTop: 40 }} color={theme} /> : Comp ? (
        <Comp businessId={biz.id} theme={theme} business={biz} />
      ) : (
        <View style={s.soon}>
          <Ionicons name={moduleIcon(module)} size={56} color={COLORS.muted} />
          <Text style={s.soonText}>{t('mod_soon')}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 10, minHeight: 52 },
  backBtn: { width: 44, height: 40, alignItems: 'center', justifyContent: 'center' },
  hCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  hTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  soon: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 40 },
  soonText: { color: COLORS.muted, fontSize: 16, textAlign: 'center' },
});
