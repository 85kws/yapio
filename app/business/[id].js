// İşletme yönetimi: modülleri aç/kapa, yayınla, önizle, ödeme ayarları.
import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Switch, Alert, ActivityIndicator, Modal, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getBusiness, updateConfig, publishBusiness, deleteBusiness, uploadBusinessImage, deleteBusinessImage, mediaUrl, updateBusiness, uploadLogo, uploadModuleImage } from '../../src/api/client';
import { COLORS, SIZES } from '../../src/theme';
import { AppIcon, moduleIcon } from '../../src/icons';
import { MODULE_INFO } from '../../src/modules';
import ModuleInfoModal from '../../src/components/ModuleInfoModal';
import { PATTERNS, Pattern } from '../../src/components/AppBackground';
import { useLang } from '../../src/i18n';

const ALL_MODULES = Object.keys(MODULE_INFO).filter((k) => k !== 'payments');
const THEME_COLORS = ['#5B4BE7', '#E93D82', '#30A46C', '#0091FF', '#F76808', '#8B6914', '#1A1A2E', '#C4A35A', '#E5484D', '#4334C4'];
const BG_COLORS = ['#FFFFFF', '#F1F3F5', '#FFE8CC', '#FFD3D9', '#D0E4FF', '#C3F0D8', '#E4D4FF', '#FFF3BF', '#FFC9A3', '#A5D8FF', '#1A1A2E', '#0B1020'];

export default function ManageBusiness() {
  const router = useRouter();
  const { t } = useLang();
  const { id } = useLocalSearchParams();
  const [data, setData] = useState(null);
  const [enabled, setEnabled] = useState([]);
  const [saving, setSaving] = useState(false);
  const [infoModule, setInfoModule] = useState(null);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [bgUploading, setBgUploading] = useState(false);
  const [themeJson, setThemeJson] = useState({});
  const [hex, setHex] = useState('');
  const [name, setName] = useState('');

  const load = useCallback(async () => {
    try {
      const d = await getBusiness(id);
      setData(d);
      setEnabled(d.config?.modules_enabled || []);
      setImages(d.business?.promo_images || []);
      setThemeJson(d.business?.theme_json || {});
      setName(d.business?.name || '');
    } catch (e) { console.warn('getBusiness', e?.message); }
  }, [id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const addImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert(t('permission_required'), t('gallery_permission'));
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (res.canceled || !res.assets?.[0]) return;
    setUploading(true);
    try { setImages(await uploadBusinessImage(id, res.assets[0].uri)); }
    catch (e) { Alert.alert(t('error'), t('image_upload_failed')); }
    finally { setUploading(false); }
  };
  const removeImage = async (url) => {
    try { setImages(await deleteBusinessImage(id, url)); } catch { Alert.alert(t('error'), t('could_not_delete')); }
  };

  const changeLogo = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert(t('permission_required'), t('gallery_permission'));
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7, allowsEditing: true, aspect: [1, 1] });
    if (res.canceled || !res.assets?.[0]) return;
    try { const url = await uploadLogo(id, res.assets[0].uri); setData((d) => ({ ...d, business: { ...d.business, logo_url: url } })); }
    catch { Alert.alert(t('error'), t('image_upload_failed')); }
  };
  const saveName = async () => { if (name.trim() && name !== data.business.name) await updateBusiness(id, { name: name.trim() }); };
  const setAccess = async (mode) => {
    const b = await updateBusiness(id, { access_mode: mode });
    setData((d) => ({ ...d, business: { ...d.business, access_mode: b.access_mode, join_code: b.join_code } }));
  };
  const saveTheme = async (patch) => {
    const next = { ...themeJson, ...patch };
    setThemeJson(next);
    setData((d) => ({ ...d, business: { ...d.business, theme_json: next } }));
    try { await updateBusiness(id, { theme_json: next }); } catch { Alert.alert(t('error'), t('not_saved')); }
  };
  const pickBgPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert(t('permission_required'), t('gallery_permission'));
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (res.canceled || !res.assets?.[0]) return;
    setBgUploading(true);
    try { const item = await uploadModuleImage(id, '_assets', res.assets[0].uri); saveTheme({ bg_type: 'photo', bg_photo: item?.data?.url || item?.url }); }
    catch { Alert.alert(t('error'), t('image_upload_failed')); }
    finally { setBgUploading(false); }
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

  const doPublish = async () => {
    try {
      const b = await publishBusiness(id);
      setData({ ...data, business: b });
      Alert.alert(t('published_title'), t('published_body'));
    } catch (e) { Alert.alert(t('error'), e?.message || t('not_saved')); }
  };

  const confirmDelete = () => {
    Alert.alert(t('delete'), `"${biz.name}" ${t('delete_q')}`, [
      { text: t('cancel'), style: 'cancel' },
      { text: t('delete'), style: 'destructive', onPress: async () => { await deleteBusiness(id); router.replace('/my-businesses'); } },
    ]);
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={COLORS.primary} />
          <Text style={s.back}>{t('back')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.previewBtn, { backgroundColor: theme }]} onPress={() => router.push(`/run/${biz.share_slug}`)}>
          <Ionicons name="play" size={15} color="#fff" />
          <Text style={s.previewText}>{t('preview')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: SIZES.pad, paddingBottom: 40 }}>
        <View style={s.hero}>
          <TouchableOpacity onPress={changeLogo} activeOpacity={0.8}>
            <AppIcon sectorKey={biz.sector_key} color={theme} size={76} radius={18} logo={biz.logo_url} />
            <View style={[s.logoEdit, { backgroundColor: theme }]}><Ionicons name="camera" size={14} color="#fff" /></View>
          </TouchableOpacity>
          <TextInput style={s.nameInput} value={name} onChangeText={setName} onBlur={saveName} placeholder={t('app_name_ph')} placeholderTextColor="#B0B0C0" textAlign="center" />
          <Text style={s.slug}>yapio.app/{biz.share_slug}</Text>
          <View style={[s.statusPill, { backgroundColor: biz.status === 'active' ? '#E7F7EF' : '#F1F1F7' }]}>
            <Ionicons name={biz.status === 'active' ? 'checkmark-circle' : 'ellipse-outline'} size={14} color={biz.status === 'active' ? COLORS.success : COLORS.muted} />
            <Text style={[s.statusText, { color: biz.status === 'active' ? COLORS.success : COLORS.muted }]}>
              {biz.status === 'active' ? t('st_active') : t('st_draft')}
            </Text>
          </View>
        </View>

        <Text style={s.sectionTitle}>{t('theme_bg')}</Text>
        <Text style={s.sectionSub}>{t('theme_bg_sub')}</Text>
        <Text style={s.miniLabel}>{t('theme_color')}</Text>
        <View style={s.swatchRow}>
          {THEME_COLORS.map((c) => (
            <TouchableOpacity key={c} style={[s.swatch, { backgroundColor: c }, (themeJson.color || theme) === c && s.swatchOn]} onPress={() => saveTheme({ color: c })}>
              {(themeJson.color || theme) === c ? <Ionicons name="checkmark" size={16} color="#fff" /> : null}
            </TouchableOpacity>
          ))}
        </View>
        <View style={s.hexRow}>
          <Text style={s.hexHash}>#</Text>
          <TextInput style={s.hexInput} value={hex} onChangeText={(v) => setHex(v.replace('#', '').slice(0, 6))} placeholder={(themeJson.color || theme).replace('#', '')} placeholderTextColor="#B0B0C0" autoCapitalize="characters" autoCorrect={false} />
          <TouchableOpacity style={[s.hexBtn, { backgroundColor: theme }]} onPress={() => { const h = hex.trim(); if (/^[0-9a-fA-F]{6}$/.test(h)) { saveTheme({ color: '#' + h.toUpperCase() }); setHex(''); } else Alert.alert(t('invalid_code'), t('invalid_code_body')); }}>
            <Text style={s.hexBtnText}>{t('apply')}</Text>
          </TouchableOpacity>
        </View>
        <Text style={s.miniLabel}>{t('background')}</Text>
        <View style={s.segment}>
          {[['solid', t('bg_solid')], ['pattern', t('bg_pattern')], ['photo', t('bg_photo')]].map(([v, l]) => (
            <TouchableOpacity key={v} style={[s.segItem, (themeJson.bg_type || 'solid') === v && { backgroundColor: theme }]} onPress={() => saveTheme({ bg_type: v })}>
              <Text style={[s.segText, (themeJson.bg_type || 'solid') === v && { color: '#fff' }]}>{l}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {(themeJson.bg_type === 'pattern') ? (
          <View style={s.patternGrid}>
            {PATTERNS.map((p) => {
              const on = (themeJson.bg_pattern || 'bubbles') === p.key;
              return (
                <TouchableOpacity key={p.key} style={[s.patternTile, on && { borderColor: theme, borderWidth: 2 }]} onPress={() => saveTheme({ bg_pattern: p.key })} activeOpacity={0.8}>
                  <View style={[s.patternPrev, { backgroundColor: themeJson.bg_color || '#fff' }]}>
                    <Pattern name={p.key} color={theme} scale={0.42} />
                    {on ? <View style={[s.patternCheck, { backgroundColor: theme }]}><Ionicons name="checkmark" size={12} color="#fff" /></View> : null}
                  </View>
                  <Text style={s.patternName}>{p.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : themeJson.bg_type === 'photo' ? (
          <TouchableOpacity style={[s.bgPhotoBtn, { borderColor: theme }]} onPress={pickBgPhoto} disabled={bgUploading}>
            {bgUploading ? <ActivityIndicator color={theme} /> : <><Ionicons name="image" size={18} color={theme} /><Text style={[s.bgPhotoText, { color: theme }]}>{themeJson.bg_photo ? t('change_photo') : t('pick_bg_photo')}</Text></>}
          </TouchableOpacity>
        ) : (
          <View style={s.swatchRow}>
            {BG_COLORS.map((c) => (
              <TouchableOpacity key={c} style={[s.swatch, { backgroundColor: c, borderWidth: 1, borderColor: COLORS.border }, (themeJson.bg_color || '#FFFFFF') === c && s.swatchOn]} onPress={() => saveTheme({ bg_color: c })}>
                {(themeJson.bg_color || '#FFFFFF') === c ? <Ionicons name="checkmark" size={16} color={theme} /> : null}
              </TouchableOpacity>
            ))}
          </View>
        )}
        <Text style={s.bgNote}>{t('bg_note')}</Text>

        <Text style={s.sectionTitle}>{t('access')}</Text>
        <Text style={s.sectionSub}>{t('access_sub')}</Text>
        <View style={s.segment}>
          {[['public', t('public')], ['private', t('private')]].map(([v, l]) => (
            <TouchableOpacity key={v} style={[s.segItem, (biz.access_mode || 'public') === v && { backgroundColor: theme }]} onPress={() => setAccess(v)}>
              <Text style={[s.segText, (biz.access_mode || 'public') === v && { color: '#fff' }]}>{l}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {biz.access_mode === 'private' && (
          <View style={s.accessBox}>
            <View style={{ flex: 1 }}>
              <Text style={s.accessLabel}>{t('join_code')}</Text>
              <Text style={[s.accessCode, { color: theme }]}>{biz.join_code || '—'}</Text>
            </View>
            <TouchableOpacity style={[s.membersBtn, { borderColor: theme }]} onPress={() => router.push(`/members/${id}`)}>
              <Ionicons name="people" size={16} color={theme} />
              <Text style={[s.membersText, { color: theme }]}>{t('users')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {biz.status !== 'active' && (
          <TouchableOpacity style={[s.publishBtn, { backgroundColor: theme }]} onPress={doPublish}>
            <Ionicons name="rocket" size={18} color="#fff" />
            <Text style={s.publishText}>{t('publish')}</Text>
          </TouchableOpacity>
        )}

        <Text style={s.sectionTitle}>{t('store_images')}</Text>
        <Text style={s.sectionSub}>{t('store_images_sub')}</Text>
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
            {uploading ? <ActivityIndicator color={theme} /> : <><Ionicons name="add" size={28} color={theme} /><Text style={[s.shotAddText, { color: theme }]}>{t('add')}</Text></>}
          </TouchableOpacity>
        </ScrollView>

        <Text style={s.sectionTitle}>{t('features')} {saving ? <Text style={s.saving}>· {t('saving')}</Text> : null}</Text>
        <Text style={s.sectionSub}>{t('features_sub')}</Text>
        <View style={s.modList}>
          {ALL_MODULES.map((key) => (
            <View key={key} style={s.modRow}>
              <View style={s.modIconBox}><Ionicons name={moduleIcon(key)} size={20} color={theme} /></View>
              <TouchableOpacity style={s.modLabelWrap} onPress={() => setInfoModule(key)}>
                <Text style={s.modLabel}>{t('mod_' + key)}</Text>
                <Ionicons name="information-circle-outline" size={16} color={COLORS.muted} />
              </TouchableOpacity>
              {enabled.includes(key) && (
                <TouchableOpacity style={[s.manageBtn, { borderColor: theme }]} onPress={() => router.push(`/manage/${id}/${key}`)}>
                  <Text style={[s.manageText, { color: theme }]}>{t('manage')}</Text>
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

        <TouchableOpacity style={s.linkRow} onPress={() => router.push(`/guide`)}>
          <Ionicons name="help-buoy-outline" size={20} color={theme} />
          <Text style={s.linkText}>{t('guide_link')}</Text>
          <Ionicons name="chevron-forward" size={22} color={COLORS.muted} />
        </TouchableOpacity>

        <TouchableOpacity style={s.linkRow} onPress={() => router.push(`/manage/${id}/canvas`)}>
          <Ionicons name="color-wand-outline" size={20} color={theme} />
          <Text style={s.linkText}>{t('design_page')}</Text>
          <Ionicons name="chevron-forward" size={22} color={COLORS.muted} />
        </TouchableOpacity>

        <TouchableOpacity style={s.deleteBtn} onPress={confirmDelete}>
          <Text style={s.deleteText}>{t('delete_business')}</Text>
        </TouchableOpacity>
      </ScrollView>

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
  miniLabel: { fontSize: 13, fontWeight: '700', color: COLORS.muted, marginTop: 14, marginBottom: 8 },
  swatchRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  swatch: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  swatchOn: { borderWidth: 3, borderColor: '#fff', shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 3, elevation: 3 },
  chipRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: '#fff' },
  chipText: { fontWeight: '700', color: COLORS.text, fontSize: 13 },
  bgPhotoBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1.5, borderRadius: 12, paddingVertical: 13, marginTop: 10 },
  bgPhotoText: { fontWeight: '700' },
  bgNote: { fontSize: 12, color: COLORS.muted, marginTop: 8 },
  hexRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 6 },
  hexHash: { fontSize: 18, fontWeight: '800', color: COLORS.muted },
  hexInput: { flex: 1, backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border, letterSpacing: 1 },
  hexBtn: { paddingHorizontal: 16, paddingVertical: 11, borderRadius: 10 },
  hexBtnText: { color: '#fff', fontWeight: '800' },
  patternGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  patternTile: { width: '48%', marginBottom: 12, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden', backgroundColor: '#fff' },
  patternPrev: { height: 96, overflow: 'hidden' },
  patternCheck: { position: 'absolute', top: 6, right: 6, width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  patternName: { fontSize: 13, fontWeight: '700', color: COLORS.text, textAlign: 'center', paddingVertical: 8 },
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
