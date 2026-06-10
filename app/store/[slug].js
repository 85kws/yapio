// Mağaza detay sayfası (Play Store tarzı): isim, ikon, ekran görüntüleri, açıklama, indir/aç.
import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, StyleSheet, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getAppBySlug, install, uninstall, getInstalls, mediaUrl } from '../../src/api/client';
import { COLORS, SIZES } from '../../src/theme';
import { AppIcon, moduleIcon } from '../../src/icons';
import { MODULE_INFO } from '../../src/modules';
import ModuleInfoModal from '../../src/components/ModuleInfoModal';

const SHOT_W = Math.min(190, Dimensions.get('window').width * 0.5);
const SHOT_H = SHOT_W * 2;

export default function StorePage() {
  const router = useRouter();
  const { slug } = useLocalSearchParams();
  const [data, setData] = useState(null);
  const [installed, setInstalled] = useState(false);
  const [infoModule, setInfoModule] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const d = await getAppBySlug(slug);
      setData(d);
      const ins = await getInstalls().catch(() => []);
      setInstalled(ins.some((a) => a.share_slug === slug));
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
  const shots = biz.promo_images || [];

  const toggleInstall = async () => {
    setBusy(true);
    try {
      if (installed) { await uninstall(biz.id); setInstalled(false); }
      else { await install(biz.id); setInstalled(true); }
    } catch (e) { Alert.alert('Hata', e?.message); } finally { setBusy(false); }
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={COLORS.primary} />
          <Text style={s.back}>Geri</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
        {/* Üst kimlik */}
        <View style={s.hero}>
          <AppIcon sectorKey={biz.sector_key} color={theme} size={88} radius={20} logo={biz.logo_url} />
          <View style={{ flex: 1 }}>
            <Text style={s.name}>{biz.name}</Text>
            <Text style={s.sector}>{biz.sector_name || 'İşletme'}</Text>
            <View style={s.heroBtns}>
              <TouchableOpacity style={[s.installBtn, { backgroundColor: installed ? '#fff' : theme, borderColor: theme, borderWidth: installed ? 2 : 0 }]} onPress={toggleInstall} disabled={busy}>
                {busy ? <ActivityIndicator color={installed ? theme : '#fff'} /> : (
                  <>
                    <Ionicons name={installed ? 'checkmark' : 'download-outline'} size={17} color={installed ? theme : '#fff'} />
                    <Text style={[s.installText, { color: installed ? theme : '#fff' }]}>{installed ? 'İndirildi' : 'İndir'}</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={[s.openBtn, { borderColor: theme }]} onPress={() => router.push(`/run/${biz.share_slug}`)}>
                <Text style={[s.openText, { color: theme }]}>Aç</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Ekran görüntüleri */}
        {shots.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.shots}>
            {shots.map((u, i) => (
              <Image key={i} source={{ uri: mediaUrl(u) }} style={s.shot} resizeMode="cover" />
            ))}
          </ScrollView>
        )}

        {/* Açıklama */}
        {biz.description ? (
          <View style={s.block}>
            <Text style={s.blockTitle}>Açıklama</Text>
            <Text style={s.desc}>{biz.description}</Text>
          </View>
        ) : null}

        {/* Özellikler */}
        {modules.length > 0 && (
          <View style={s.block}>
            <Text style={s.blockTitle}>Özellikler</Text>
            {modules.map((m) => {
              const info = MODULE_INFO[m];
              if (!info) return null;
              return (
                <TouchableOpacity key={m} style={s.featRow} onPress={() => setInfoModule(m)} activeOpacity={0.7}>
                  <View style={[s.featIcon, { backgroundColor: theme + '18' }]}><Ionicons name={moduleIcon(m)} size={20} color={theme} /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.featName}>{info.label}</Text>
                    <Text style={s.featShort} numberOfLines={1}>{info.short}</Text>
                  </View>
                  <Ionicons name="information-circle-outline" size={20} color={COLORS.muted} />
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Bilgi */}
        {(biz.address || biz.phone) && (
          <View style={s.block}>
            <Text style={s.blockTitle}>İşletme Bilgisi</Text>
            {biz.address ? <View style={s.infoRow}><Ionicons name="location-outline" size={18} color={COLORS.muted} /><Text style={s.infoText}>{biz.address}</Text></View> : null}
            {biz.phone ? <View style={s.infoRow}><Ionicons name="call-outline" size={18} color={COLORS.muted} /><Text style={s.infoText}>{biz.phone}</Text></View> : null}
          </View>
        )}
      </ScrollView>

      {/* Alt sabit indir/aç */}
      <SafeAreaView edges={['bottom']} style={s.footer}>
        <TouchableOpacity style={[s.footBtn, { backgroundColor: installed ? '#fff' : theme, borderColor: theme, borderWidth: installed ? 2 : 0, flex: 1 }]} onPress={toggleInstall} disabled={busy}>
          <Ionicons name={installed ? 'trash-outline' : 'download-outline'} size={18} color={installed ? COLORS.danger : '#fff'} />
          <Text style={[s.footText, { color: installed ? COLORS.danger : '#fff' }]}>{installed ? 'Kaldır' : 'İndir'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.footBtn, { backgroundColor: theme, flex: 1 }]} onPress={() => router.push(`/run/${biz.share_slug}`)}>
          <Ionicons name="play" size={18} color="#fff" />
          <Text style={[s.footText, { color: '#fff' }]}>Aç</Text>
        </TouchableOpacity>
      </SafeAreaView>

      <ModuleInfoModal moduleKey={infoModule} theme={theme} onClose={() => setInfoModule(null)} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingHorizontal: SIZES.pad, paddingVertical: 8 },
  backBtn: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' },
  back: { color: COLORS.primary, fontSize: 17, fontWeight: '600' },
  hero: { flexDirection: 'row', gap: 16, paddingHorizontal: SIZES.pad, paddingBottom: 16, alignItems: 'center' },
  name: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  sector: { fontSize: 14, color: COLORS.muted, marginTop: 2, marginBottom: 12 },
  heroBtns: { flexDirection: 'row', gap: 10 },
  installBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 22, paddingVertical: 10, borderRadius: 12 },
  installText: { fontWeight: '800', fontSize: 15 },
  openBtn: { paddingHorizontal: 22, paddingVertical: 10, borderRadius: 12, borderWidth: 2, justifyContent: 'center' },
  openText: { fontWeight: '800', fontSize: 15 },
  shots: { paddingHorizontal: SIZES.pad, gap: 12, paddingVertical: 6 },
  shot: { width: SHOT_W, height: SHOT_H, borderRadius: 16, backgroundColor: '#ECECF4' },
  block: { paddingHorizontal: SIZES.pad, marginTop: 18 },
  blockTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginBottom: 10 },
  desc: { fontSize: 15, color: COLORS.text, lineHeight: 23 },
  featRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.card, borderRadius: 14, padding: 12, marginBottom: 8 },
  featIcon: { width: 40, height: 40, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  featName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  featShort: { fontSize: 13, color: COLORS.muted, marginTop: 1 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  infoText: { fontSize: 14, color: COLORS.text },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', gap: 10, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: COLORS.border, paddingHorizontal: SIZES.pad, paddingTop: 10 },
  footBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14 },
  footText: { fontWeight: '800', fontSize: 16 },
});
