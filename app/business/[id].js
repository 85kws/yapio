// İşletme yönetimi: modülleri aç/kapa, yayınla, önizle, ödeme ayarları.
import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Switch, Alert, ActivityIndicator, Modal, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getBusiness, updateConfig, publishBusiness, deleteBusiness, uploadBusinessImage, deleteBusinessImage, mediaUrl } from '../../src/api/client';
import { COLORS, SIZES } from '../../src/theme';
import { AppIcon, moduleIcon } from '../../src/icons';
import { MODULE_INFO } from '../../src/modules';
import ModuleInfoModal from '../../src/components/ModuleInfoModal';

const ALL_MODULES = Object.keys(MODULE_INFO);

export default function ManageBusiness() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [data, setData] = useState(null);
  const [enabled, setEnabled] = useState([]);
  const [saving, setSaving] = useState(false);
  const [infoModule, setInfoModule] = useState(null);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    try {
      const d = await getBusiness(id);
      setData(d);
      setEnabled(d.config?.modules_enabled || []);
      setImages(d.business?.promo_images || []);
    } catch (e) { console.warn('getBusiness', e?.message); }
  }, [id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const addImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert('İzin gerekli', 'Galeriye erişim izni verin.');
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (res.canceled || !res.assets?.[0]) return;
    setUploading(true);
    try { setImages(await uploadBusinessImage(id, res.assets[0].uri)); }
    catch (e) { Alert.alert('Hata', 'Görsel yüklenemedi'); }
    finally { setUploading(false); }
  };
  const removeImage = async (url) => {
    try { setImages(await deleteBusinessImage(id, url)); } catch { Alert.alert('Hata', 'Silinemedi'); }
  };

  if (!data) return <SafeAreaView style={s.safe}><ActivityIndicator style={{ marginTop: 60 }} color={COLORS.primary} /></SafeAreaView>;

  const biz = data.business;
  const theme = biz.theme_json?.color || COLORS.primary;

  const toggle = async (key) => {
    const next = enabled.includes(key) ? enabled.filter((m) => m !== key) : [...enabled, key];
    setEnabled(next);
    setSaving(true);
    try { await updateConfig(id, { modules_enabled: next }); } catch { Alert.alert('Hata', 'Kaydedilemedi'); }
    finally { setSaving(false); }
  };

  const publish = async () => {
    try { const b = await publishBusiness(id); setData({ ...data, business: b }); Alert.alert('Yayında!', 'App vitrinde görünüyor artık.'); }
    catch (e) { Alert.alert('Hata', e?.message || 'Yayınlanamadı'); }
  };

  const confirmDelete = () => {
    Alert.alert('Sil', `"${biz.name}" silinsin mi?`, [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: async () => { await deleteBusiness(id); router.replace('/my-businesses'); } },
    ]);
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={COLORS.primary} />
          <Text style={s.back}>Geri</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.previewBtn, { backgroundColor: theme }]} onPress={() => router.push(`/run/${biz.share_slug}`)}>
          <Ionicons name="play" size={15} color="#fff" />
          <Text style={s.previewText}>Önizle</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: SIZES.pad, paddingBottom: 40 }}>
        <View style={s.hero}>
          <AppIcon sectorKey={biz.sector_key} color={theme} size={76} radius={18} />
          <Text style={s.name}>{biz.name}</Text>
          <Text style={s.slug}>yapp.app/{biz.share_slug}</Text>
          <View style={[s.statusPill, { backgroundColor: biz.status === 'active' ? '#E7F7EF' : '#F1F1F7' }]}>
            <Ionicons name={biz.status === 'active' ? 'checkmark-circle' : 'ellipse-outline'} size={14} color={biz.status === 'active' ? COLORS.success : COLORS.muted} />
            <Text style={[s.statusText, { color: biz.status === 'active' ? COLORS.success : COLORS.muted }]}>
              {biz.status === 'active' ? 'Yayında' : 'Taslak'}
            </Text>
          </View>
        </View>

        {biz.status !== 'active' && (
          <TouchableOpacity style={[s.publishBtn, { backgroundColor: theme }]} onPress={publish}>
            <Ionicons name="rocket" size={18} color="#fff" />
            <Text style={s.publishText}>Yayınla</Text>
          </TouchableOpacity>
        )}

        <Text style={s.sectionTitle}>Mağaza Görselleri</Text>
        <Text style={s.sectionSub}>Vitrindeki mağaza sayfanda görünür (ekran görüntüleri, tanıtım).</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 4 }}>
          {images.map((u) => (
            <View key={u} style={s.shotWrap}>
              <Image source={{ uri: mediaUrl(u) }} style={s.shot} resizeMode="cover" />
              <TouchableOpacity style={s.shotDel} onPress={() => removeImage(u)}>
                <Ionicons name="close" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity style={s.shotAdd} onPress={addImage} disabled={uploading}>
            {uploading ? <ActivityIndicator color={theme} /> : <><Ionicons name="add" size={28} color={theme} /><Text style={[s.shotAddText, { color: theme }]}>Ekle</Text></>}
          </TouchableOpacity>
        </ScrollView>

        <Text style={s.sectionTitle}>Özellikler {saving ? <Text style={s.saving}>· kaydediliyor</Text> : null}</Text>
        <Text style={s.sectionSub}>App'inde hangi modüller olsun?</Text>
        <View style={s.modList}>
          {ALL_MODULES.map((key) => (
            <View key={key} style={s.modRow}>
              <View style={s.modIconBox}><Ionicons name={moduleIcon(key)} size={20} color={theme} /></View>
              <TouchableOpacity style={s.modLabelWrap} onPress={() => setInfoModule(key)}>
                <Text style={s.modLabel}>{MODULE_INFO[key].label}</Text>
                <Ionicons name="information-circle-outline" size={16} color={COLORS.muted} />
              </TouchableOpacity>
              <Switch
                value={enabled.includes(key)}
                onValueChange={() => toggle(key)}
                trackColor={{ true: theme, false: '#D0D0DE' }}
              />
            </View>
          ))}
        </View>

        <TouchableOpacity style={s.linkRow} onPress={() => router.push(`/payment-guide`)}>
          <Ionicons name="card-outline" size={20} color={theme} />
          <Text style={s.linkText}>Ödeme Ayarları (iyzico/Stripe bağla)</Text>
          <Ionicons name="chevron-forward" size={22} color={COLORS.muted} />
        </TouchableOpacity>

        <TouchableOpacity style={s.deleteBtn} onPress={confirmDelete}>
          <Text style={s.deleteText}>İşletmeyi Sil</Text>
        </TouchableOpacity>
      </ScrollView>

      <ModuleInfoModal moduleKey={infoModule} theme={theme} onClose={() => setInfoModule(null)} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SIZES.pad, paddingVertical: 10 },
  backBtn: { flexDirection: 'row', alignItems: 'center' },
  back: { color: COLORS.primary, fontSize: 17, fontWeight: '600' },
  previewBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 10 },
  previewText: { color: '#fff', fontWeight: '700' },
  hero: { alignItems: 'center', marginBottom: 18 },
  name: { fontSize: 24, fontWeight: '800', color: COLORS.text, marginTop: 10 },
  slug: { fontSize: 13, color: COLORS.muted, marginTop: 4 },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginTop: 10 },
  statusText: { fontWeight: '700', fontSize: 13 },
  publishBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, paddingVertical: 16, marginBottom: 18 },
  publishText: { color: '#fff', fontWeight: '800', fontSize: 17 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginTop: 22 },
  saving: { fontSize: 13, color: COLORS.muted, fontWeight: '500' },
  shotWrap: { position: 'relative' },
  shot: { width: 110, height: 200, borderRadius: 12, backgroundColor: '#ECECF4' },
  shotDel: { position: 'absolute', top: 6, right: 6, width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  shotAdd: { width: 110, height: 200, borderRadius: 12, borderWidth: 2, borderColor: COLORS.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  shotAddText: { fontWeight: '700', marginTop: 4 },
  sectionSub: { fontSize: 14, color: COLORS.muted, marginBottom: 12 },
  modList: { backgroundColor: COLORS.card, borderRadius: 16, paddingHorizontal: 16, overflow: 'hidden' },
  modRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: 12 },
  modIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F1F1F7', alignItems: 'center', justifyContent: 'center' },
  modLabelWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  modLabel: { fontSize: 16, color: COLORS.text, fontWeight: '600' },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.card, borderRadius: 14, padding: 16, marginTop: 16 },
  linkText: { flex: 1, fontSize: 15, fontWeight: '600', color: COLORS.text },
  deleteBtn: { alignItems: 'center', paddingVertical: 18, marginTop: 10 },
  deleteText: { color: COLORS.danger, fontWeight: '700', fontSize: 15 },
});
