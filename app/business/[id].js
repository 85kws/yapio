// İşletme yönetimi: modülleri aç/kapa, yayınla, önizle, ödeme ayarları.
import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Switch, Alert, ActivityIndicator, Modal, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getBusiness, updateConfig, publishBusiness, deleteBusiness, uploadBusinessImage, deleteBusinessImage, mediaUrl, priceEstimate, updateBusiness, uploadLogo } from '../../src/api/client';
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
  const [priceModal, setPriceModal] = useState(false);
  const [price, setPrice] = useState(null);
  const [name, setName] = useState('');

  const load = useCallback(async () => {
    try {
      const d = await getBusiness(id);
      setData(d);
      setEnabled(d.config?.modules_enabled || []);
      setImages(d.business?.promo_images || []);
      setName(d.business?.name || '');
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

  const changeLogo = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert('İzin gerekli', 'Galeriye erişim izni verin.');
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7, allowsEditing: true, aspect: [1, 1] });
    if (res.canceled || !res.assets?.[0]) return;
    try { const url = await uploadLogo(id, res.assets[0].uri); setData((d) => ({ ...d, business: { ...d.business, logo_url: url } })); }
    catch { Alert.alert('Hata', 'Logo yüklenemedi'); }
  };
  const saveName = async () => { if (name.trim() && name !== data.business.name) await updateBusiness(id, { name: name.trim() }); };
  const setAccess = async (mode) => {
    const b = await updateBusiness(id, { access_mode: mode });
    setData((d) => ({ ...d, business: { ...d.business, access_mode: b.access_mode, join_code: b.join_code } }));
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

  const openPublish = async () => {
    try { setPrice(await priceEstimate(id)); setPriceModal(true); }
    catch (e) { Alert.alert('Hata', 'Fiyat hesaplanamadı'); }
  };
  const confirmPublish = async () => {
    try {
      const b = await publishBusiness(id);
      setData({ ...data, business: b });
      setPriceModal(false);
      Alert.alert('Yayında!', 'App vitrinde görünüyor artık.');
    } catch (e) { Alert.alert('Hata', e?.message || 'Yayınlanamadı'); }
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
          <TouchableOpacity onPress={changeLogo} activeOpacity={0.8}>
            <AppIcon sectorKey={biz.sector_key} color={theme} size={76} radius={18} logo={biz.logo_url} />
            <View style={[s.logoEdit, { backgroundColor: theme }]}><Ionicons name="camera" size={14} color="#fff" /></View>
          </TouchableOpacity>
          <TextInput style={s.nameInput} value={name} onChangeText={setName} onBlur={saveName} placeholder="App adı" placeholderTextColor="#B0B0C0" textAlign="center" />
          <Text style={s.slug}>yapp.app/{biz.share_slug}</Text>
          <View style={[s.statusPill, { backgroundColor: biz.status === 'active' ? '#E7F7EF' : '#F1F1F7' }]}>
            <Ionicons name={biz.status === 'active' ? 'checkmark-circle' : 'ellipse-outline'} size={14} color={biz.status === 'active' ? COLORS.success : COLORS.muted} />
            <Text style={[s.statusText, { color: biz.status === 'active' ? COLORS.success : COLORS.muted }]}>
              {biz.status === 'active' ? 'Yayında' : 'Taslak'}
            </Text>
          </View>
        </View>

        <Text style={s.sectionTitle}>Erişim</Text>
        <Text style={s.sectionSub}>Herkese açık mı, yoksa sadece onayladığın üyeler mi kullanabilsin?</Text>
        <View style={s.segment}>
          {[['public', 'Herkese Açık'], ['private', 'Özel (üyelik)']].map(([v, l]) => (
            <TouchableOpacity key={v} style={[s.segItem, (biz.access_mode || 'public') === v && { backgroundColor: theme }]} onPress={() => setAccess(v)}>
              <Text style={[s.segText, (biz.access_mode || 'public') === v && { color: '#fff' }]}>{l}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {biz.access_mode === 'private' && (
          <View style={s.accessBox}>
            <View style={{ flex: 1 }}>
              <Text style={s.accessLabel}>Katılım Kodu</Text>
              <Text style={[s.accessCode, { color: theme }]}>{biz.join_code || '—'}</Text>
            </View>
            <TouchableOpacity style={[s.membersBtn, { borderColor: theme }]} onPress={() => router.push(`/members/${id}`)}>
              <Ionicons name="people" size={16} color={theme} />
              <Text style={[s.membersText, { color: theme }]}>Üyeler</Text>
            </TouchableOpacity>
          </View>
        )}

        {biz.status !== 'active' && (
          <TouchableOpacity style={[s.publishBtn, { backgroundColor: theme }]} onPress={openPublish}>
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
              {enabled.includes(key) && (
                <TouchableOpacity style={[s.manageBtn, { borderColor: theme }]} onPress={() => router.push(`/manage/${id}/${key}`)}>
                  <Text style={[s.manageText, { color: theme }]}>Yönet</Text>
                </TouchableOpacity>
              )}
              <Switch
                value={enabled.includes(key)}
                onValueChange={() => toggle(key)}
                trackColor={{ true: theme, false: '#D0D0DE' }}
              />
            </View>
          ))}
        </View>

        <TouchableOpacity style={s.linkRow} onPress={() => router.push(`/manage/${id}/home`)}>
          <Ionicons name="create-outline" size={20} color={theme} />
          <Text style={s.linkText}>Ana Sayfayı Düzenle</Text>
          <Ionicons name="chevron-forward" size={22} color={COLORS.muted} />
        </TouchableOpacity>

        <TouchableOpacity style={s.linkRow} onPress={() => router.push(`/payment-guide`)}>
          <Ionicons name="card-outline" size={20} color={theme} />
          <Text style={s.linkText}>Ödeme Ayarları (iyzico/Stripe bağla)</Text>
          <Ionicons name="chevron-forward" size={22} color={COLORS.muted} />
        </TouchableOpacity>

        <TouchableOpacity style={s.deleteBtn} onPress={confirmDelete}>
          <Text style={s.deleteText}>İşletmeyi Sil</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Yayınla — fiyat onayı */}
      <Modal visible={priceModal} transparent animationType="slide" onRequestClose={() => setPriceModal(false)}>
        <View style={s.sheetBg}>
          <View style={s.sheet}>
            <View style={s.sheetHandle} />
            <Text style={s.sheetTitle}>Yayınlamadan önce</Text>
            <Text style={s.sheetSub}>Tahmini aylık ücret. Abonelik değil — yalnızca kullandığın kadar ödersin.</Text>

            {price && (
              <ScrollView style={{ maxHeight: 320 }}>
                <Row label="Platform tabanı" val={`${price.platform_base} ₺`} />
                {price.modules.filter((m) => m.cost > 0).map((m) => (
                  <Row key={m.key} label={MODULE_INFO[m.key]?.label || m.key} val={`${m.cost} ₺`} />
                ))}
                <View style={s.totalRow}>
                  <Text style={s.totalLabel}>Tahmini / ay</Text>
                  <Text style={[s.totalVal, { color: theme }]}>~{price.monthly} ₺</Text>
                </View>
                <View style={s.usageNote}>
                  <Text style={s.usageTitle}>Kullanıma göre eklenir:</Text>
                  <Text style={s.usageLine}>• İlk {price.rates.mau_free} aktif müşteri ücretsiz, sonrası {price.rates.mau_each} ₺/müşteri</Text>
                  <Text style={s.usageLine}>• Bildirim: {price.rates.push_per_1000} ₺ / 1000 adet</Text>
                  <Text style={s.usageLine}>• Medya: {price.rates.media_per_gb} ₺ / GB</Text>
                </View>
              </ScrollView>
            )}

            <TouchableOpacity style={[s.confirmBtn, { backgroundColor: theme }]} onPress={confirmPublish}>
              <Ionicons name="rocket" size={18} color="#fff" />
              <Text style={s.confirmText}>Onayla ve Yayınla</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setPriceModal(false)}><Text style={s.cancelText}>Vazgeç</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ModuleInfoModal moduleKey={infoModule} theme={theme} onClose={() => setInfoModule(null)} />
    </SafeAreaView>
  );
}

const Row = ({ label, val }) => (
  <View style={s.pRow}><Text style={s.pLabel}>{label}</Text><Text style={s.pVal}>{val}</Text></View>
);

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SIZES.pad, paddingVertical: 10 },
  backBtn: { flexDirection: 'row', alignItems: 'center' },
  back: { color: COLORS.primary, fontSize: 17, fontWeight: '600' },
  previewBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 10 },
  previewText: { color: '#fff', fontWeight: '700' },
  hero: { alignItems: 'center', marginBottom: 18 },
  logoEdit: { position: 'absolute', bottom: 0, right: -2, width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  nameInput: { fontSize: 24, fontWeight: '800', color: COLORS.text, marginTop: 10, minWidth: 200, paddingVertical: 2 },
  slug: { fontSize: 13, color: COLORS.muted, marginTop: 4 },
  segment: { flexDirection: 'row', backgroundColor: '#ECECF4', borderRadius: 12, padding: 4 },
  segItem: { flex: 1, paddingVertical: 11, borderRadius: 9, alignItems: 'center' },
  segText: { fontWeight: '700', color: COLORS.muted },
  accessBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginTop: 10 },
  accessLabel: { fontSize: 12, color: COLORS.muted, fontWeight: '600' },
  accessCode: { fontSize: 22, fontWeight: '900', letterSpacing: 2, marginTop: 2 },
  membersBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10, borderWidth: 1.5 },
  membersText: { fontWeight: '700' },
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
  manageBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1.5, marginRight: 8 },
  manageText: { fontSize: 13, fontWeight: '700' },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.card, borderRadius: 14, padding: 16, marginTop: 16 },
  linkText: { flex: 1, fontSize: 15, fontWeight: '600', color: COLORS.text },
  deleteBtn: { alignItems: 'center', paddingVertical: 18, marginTop: 10 },
  deleteText: { color: COLORS.danger, fontWeight: '700', fontSize: 15 },
  sheetBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36 },
  sheetHandle: { width: 40, height: 5, borderRadius: 3, backgroundColor: COLORS.border, alignSelf: 'center', marginBottom: 14 },
  sheetTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  sheetSub: { fontSize: 14, color: COLORS.muted, marginTop: 4, marginBottom: 14, lineHeight: 20 },
  pRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  pLabel: { fontSize: 15, color: COLORS.text },
  pVal: { fontSize: 15, color: COLORS.text, fontWeight: '600' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  totalLabel: { fontSize: 17, fontWeight: '800', color: COLORS.text },
  totalVal: { fontSize: 24, fontWeight: '800' },
  usageNote: { backgroundColor: '#F7F7FB', borderRadius: 12, padding: 14, marginTop: 6 },
  usageTitle: { fontSize: 13, fontWeight: '700', color: COLORS.muted, marginBottom: 6 },
  usageLine: { fontSize: 13, color: COLORS.text, lineHeight: 20 },
  confirmBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, paddingVertical: 16, marginTop: 16 },
  confirmText: { color: '#fff', fontWeight: '800', fontSize: 17 },
  cancelText: { textAlign: 'center', color: COLORS.muted, fontWeight: '600', marginTop: 12, fontSize: 15 },
});
