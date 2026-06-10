// İşletme app çalışma zamanı: backend config'inden render eder (landing + modüller).
import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getAppBySlug, joinBusiness } from '../../src/api/client';
import { COLORS } from '../../src/theme';
import { moduleIcon, sectorIcon, AppIcon } from '../../src/icons';
import { MODULE_INFO } from '../../src/modules';
import { CUSTOMER } from '../../src/modules/registry';
import BlockRenderer from '../../src/blocks/BlockRenderer';

export default function RunApp() {
  const router = useRouter();
  const { slug } = useLocalSearchParams();
  const [data, setData] = useState(null);
  const [openModule, setOpenModule] = useState(null);
  const [code, setCode] = useState('');
  const [joining, setJoining] = useState(false);

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

  // Private app + üye değil → katılım kapısı
  const locked = biz.access_mode === 'private' && data.member_status !== 'active';
  const join = async (withCode) => {
    setJoining(true);
    try {
      const status = await joinBusiness(biz.id, withCode ? code.trim() : '');
      if (status === 'active') { await load(); }
      else Alert.alert('İstek gönderildi', 'İşletme onayladığında erişebileceksin.');
    } catch (e) { Alert.alert('Hata', e?.response?.data?.error || 'Olmadı'); }
    finally { setJoining(false); }
  };

  if (locked) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <StatusBar style="dark" />
        <SafeAreaView style={s.lockWrap} edges={['top', 'bottom']}>
          <TouchableOpacity style={s.exitBtn} onPress={() => router.back()}><Ionicons name="chevron-down" size={22} color={COLORS.text} /></TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 }}>
            <AppIcon sectorKey={biz.sector_key} color={theme} size={88} radius={22} logo={biz.logo_url} />
            <Text style={s.lockTitle}>{biz.name}</Text>
            <View style={s.lockBadge}><Ionicons name="lock-closed" size={14} color={COLORS.muted} /><Text style={s.lockBadgeText}>Özel uygulama</Text></View>
            <Text style={s.lockDesc}>Bu uygulamayı kullanmak için işletmenin verdiği katılım kodunu gir.</Text>
            <TextInput style={s.codeInput} value={code} onChangeText={setCode} placeholder="KATILIM KODU" placeholderTextColor="#B0B0C0" autoCapitalize="characters" textAlign="center" />
            <TouchableOpacity style={[s.joinBtn, { backgroundColor: theme }]} onPress={() => join(true)} disabled={joining}>
              {joining ? <ActivityIndicator color="#fff" /> : <Text style={s.joinText}>Katıl</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => join(false)}><Text style={[s.requestLink, { color: theme }]}>Kodum yok — katılım isteği gönder</Text></TouchableOpacity>
            {data.member_status === 'pending' ? <Text style={s.pendingNote}>İsteğin gönderildi, onay bekleniyor.</Text> : null}
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar style="dark" />

      {openModule ? (
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          {ModuleView ? (
            <View style={{ flex: 1 }}><ModuleView businessId={biz.id} theme={theme} business={biz} /></View>
          ) : (
            <View style={s.stub}>
              <View style={[s.stubIcon, { backgroundColor: theme }]}><Ionicons name={moduleIcon(openModule)} size={40} color="#fff" /></View>
              <Text style={s.stubTitle}>{MODULE_INFO[openModule].label}</Text>
              <Text style={s.stubDesc}>{MODULE_INFO[openModule].detail}</Text>
            </View>
          )}
          {/* modül içi geri (app ana sayfasına) — küçük, yüzen */}
          <TouchableOpacity style={[s.floatBack, { backgroundColor: theme }]} onPress={() => setOpenModule(null)}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
        </SafeAreaView>
      ) : (
        <ScrollView contentContainerStyle={s.content}>
          <View style={s.appHead}>
            <AppIcon sectorKey={biz.sector_key} color={theme} size={64} radius={16} logo={biz.logo_url} />
            <Text style={s.appName}>{biz.name}</Text>
            {biz.sector_name ? <Text style={s.appSector}>{biz.sector_name}</Text> : null}
          </View>
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

      {/* tam ekran his: çıkış için yüzen küçük kapat (sadece app ana sayfasında) */}
      {!openModule && (
        <SafeAreaView edges={['top']} style={s.exitWrap} pointerEvents="box-none">
          <TouchableOpacity style={s.exitBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-down" size={22} color={COLORS.text} />
          </TouchableOpacity>
        </SafeAreaView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  content: { padding: 20, paddingTop: 54 },
  appHead: { alignItems: 'center', marginBottom: 10 },
  appName: { fontSize: 24, fontWeight: '800', color: COLORS.text, marginTop: 10 },
  appSector: { fontSize: 14, color: COLORS.muted, marginTop: 2 },
  exitWrap: { position: 'absolute', top: 0, left: 0, right: 0, alignItems: 'flex-end', paddingHorizontal: 12 },
  exitBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(0,0,0,0.06)', alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  floatBack: { position: 'absolute', top: 50, left: 14, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 4 },
  lockWrap: { flex: 1 },
  lockTitle: { fontSize: 24, fontWeight: '800', color: COLORS.text, marginTop: 14 },
  lockBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#F1F1F7', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, marginTop: 8 },
  lockBadgeText: { color: COLORS.muted, fontWeight: '600', fontSize: 13 },
  lockDesc: { fontSize: 15, color: COLORS.muted, textAlign: 'center', marginTop: 16, lineHeight: 22 },
  codeInput: { backgroundColor: '#F1F1F7', borderRadius: 12, paddingVertical: 14, fontSize: 20, fontWeight: '800', letterSpacing: 4, color: COLORS.text, alignSelf: 'stretch', marginTop: 20 },
  joinBtn: { alignSelf: 'stretch', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 12 },
  joinText: { color: '#fff', fontWeight: '800', fontSize: 17 },
  requestLink: { fontWeight: '700', marginTop: 16 },
  pendingNote: { color: COLORS.muted, marginTop: 12, fontSize: 13 },
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
