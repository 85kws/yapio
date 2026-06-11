// Mini uygulama çalışma zamanı: backend config'inden render eder (landing + modüller).
// Gerçek app hissi: üst başlık YOK, alt yatay kaydırılabilir özellik menüsü (tab bar).
// Menüler arası: dokun-geç + ekranın her yerinden YATAY KAYDIR ile geç, geçiş animasyonlu (slide).
import React, { useState, useCallback, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert, Animated, PanResponder, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getAppBySlug, joinBusiness } from '../../src/api/client';
import { COLORS } from '../../src/theme';
import { moduleIcon, AppIcon } from '../../src/icons';
import { MODULE_INFO } from '../../src/modules';
import { CUSTOMER } from '../../src/modules/registry';
import BlockRenderer from '../../src/blocks/BlockRenderer';
import AppBackground from '../../src/components/AppBackground';

const SCREEN_W = Dimensions.get('window').width;

export default function RunApp() {
  const router = useRouter();
  const { slug } = useLocalSearchParams();
  const [data, setData] = useState(null);
  const [tab, setTab] = useState('__home');
  const [code, setCode] = useState('');
  const [joining, setJoining] = useState(false);

  // animasyon + swipe altyapısı (hook'lar erken return'den önce)
  const anim = useRef(new Animated.Value(0)).current;
  const tabRef = useRef(tab); tabRef.current = tab;
  const tabsRef = useRef([]);

  const switchTab = useCallback((nextKey, dir) => {
    if (nextKey === tabRef.current) return;
    anim.setValue(dir * SCREEN_W);          // yeni içerik dir yönünden gelir
    setTab(nextKey);
    Animated.timing(anim, { toValue: 0, duration: 240, useNativeDriver: true }).start();
  }, [anim]);

  const pan = useRef(PanResponder.create({
    // sadece belirgin YATAY hareketi yakala → dikey scroll bozulmaz
    onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 24 && Math.abs(g.dx) > Math.abs(g.dy) * 1.6,
    onPanResponderRelease: (_, g) => {
      const list = tabsRef.current;
      const idx = list.findIndex((t) => t.key === tabRef.current);
      if (idx < 0) return;
      if (g.dx < -48 && idx < list.length - 1) switchTab(list[idx + 1].key, 1);
      else if (g.dx > 48 && idx > 0) switchTab(list[idx - 1].key, -1);
    },
  })).current;

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

  const onNavigate = (key) => { if (MODULE_INFO[key]) switchTab(key, 1); };

  // Private mini app + üye değil → katılım kapısı
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

  const ActiveView = tab !== '__home' ? CUSTOMER[tab] : null;
  // Müşteriye gösterilmeyen modüller: ekip (sadece yönetim) + ödeme (kaldırıldı)
  const HIDDEN = ['staff', 'payments'];
  const tabs = [
    { key: '__home', label: 'Ana Sayfa', icon: 'home' },
    ...modules.filter((m) => MODULE_INFO[m] && !HIDDEN.includes(m)).map((m) => ({ key: m, label: MODULE_INFO[m].label, icon: moduleIcon(m) })),
  ];
  tabsRef.current = tabs;
  const curIdx = tabs.findIndex((t) => t.key === tab);

  return (
    <AppBackground theme={biz.theme_json}>
      <StatusBar style="dark" />

      {/* GÖVDE — üst başlık yok; her yerden yatay kaydır ile geçiş, slide animasyonlu */}
      <SafeAreaView style={{ flex: 1 }} edges={['top']} {...pan.panHandlers}>
        <Animated.View style={{ flex: 1, transform: [{ translateX: anim }] }}>
          {tab === '__home' ? (
            <ScrollView contentContainerStyle={s.content}>
              {landing.map((b, i) => (
                <BlockRenderer key={i} block={b} theme={theme} onNavigate={onNavigate} />
              ))}
              <View style={{ height: 20 }} />
            </ScrollView>
          ) : ActiveView ? (
            <View style={{ flex: 1 }}><ActiveView businessId={biz.id} theme={theme} business={biz} /></View>
          ) : (
            <View style={s.stub}>
              <View style={[s.stubIcon, { backgroundColor: theme }]}><Ionicons name={moduleIcon(tab)} size={40} color="#fff" /></View>
              <Text style={s.stubTitle}>{MODULE_INFO[tab].label}</Text>
              <Text style={s.stubDesc}>{MODULE_INFO[tab].detail}</Text>
            </View>
          )}
        </Animated.View>
      </SafeAreaView>

      {/* çıkış — yüzen küçük (mini app'ten çık) */}
      <SafeAreaView edges={['top']} style={s.exitWrap} pointerEvents="box-none">
        <TouchableOpacity style={s.exitBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-down" size={22} color={COLORS.text} />
        </TouchableOpacity>
      </SafeAreaView>

      {/* ALT YATAY ÖZELLİK MENÜSÜ — kaydırılabilir tab bar */}
      <View style={s.tabBarWrap}>
        <SafeAreaView edges={['bottom']}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabBar}>
            {tabs.map((t, i) => {
              const active = tab === t.key;
              return (
                <TouchableOpacity key={t.key} style={s.tabItem} onPress={() => switchTab(t.key, i >= curIdx ? 1 : -1)} activeOpacity={0.7}>
                  <View style={[s.tabIndicator, active && { backgroundColor: theme }]} />
                  <Ionicons name={t.icon} size={22} color={active ? theme : COLORS.muted} />
                  <Text style={[s.tabLabel, { color: active ? theme : COLORS.muted }]} numberOfLines={1}>{t.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </SafeAreaView>
      </View>
    </AppBackground>
  );
}

const s = StyleSheet.create({
  content: { padding: 20, paddingTop: 16 },
  exitWrap: { position: 'absolute', top: 0, left: 0, right: 0, alignItems: 'flex-end', paddingHorizontal: 12 },
  exitBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(0,0,0,0.06)', alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  // alt tab bar
  tabBarWrap: { borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 10 },
  tabBar: { flexDirection: 'row', paddingHorizontal: 6, paddingTop: 6 },
  tabItem: { alignItems: 'center', paddingHorizontal: 14, paddingBottom: 6, minWidth: 64 },
  tabIndicator: { width: 22, height: 3, borderRadius: 2, marginBottom: 6, backgroundColor: 'transparent' },
  tabLabel: { fontSize: 11, fontWeight: '700', marginTop: 3 },
  // lock gate
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
  // contact meta
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  meta: { fontSize: 14, color: COLORS.muted },
  // stub (modül bileşeni yoksa)
  stub: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  stubIcon: { width: 84, height: 84, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  stubTitle: { fontSize: 24, fontWeight: '800', color: COLORS.text },
  stubDesc: { fontSize: 15, color: COLORS.muted, textAlign: 'center', marginTop: 8, lineHeight: 22 },
});
