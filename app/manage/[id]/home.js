// Mini app ANA SAYFA editörü: landing_blocks'u elle düzenle (ekle/sil/sırala/içerik).
// Blok tipleri: metin, görsel, buton. Kaydet → updateConfig(landing_blocks).
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getBusiness, updateConfig, uploadModuleImage, mediaUrl } from '../../../src/api/client';
import { COLORS, SIZES } from '../../../src/theme';
import { MODULE_INFO } from '../../../src/modules';
import { moduleIcon } from '../../../src/icons';

const TYPE_LABEL = { text: 'Metin', image: 'Görsel', button: 'Buton' };
const newBlock = (type) => {
  if (type === 'text') return { type: 'text', props: { text: 'Yeni metin', size: 'normal', align: 'left' } };
  if (type === 'image') return { type: 'image', props: { uri: '' } };
  return { type: 'button', props: { label: 'Buton', action: 'module', value: '' } };
};

export default function EditHome() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [blocks, setBlocks] = useState(null);
  const [modules, setModules] = useState([]);
  const [theme, setTheme] = useState(COLORS.primary);
  const [slug, setSlug] = useState(null);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploadingAt, setUploadingAt] = useState(null);

  const load = useCallback(async () => {
    try {
      const d = await getBusiness(id);
      setBlocks(d.config?.landing_blocks || []);
      setModules(d.config?.modules_enabled || []);
      setTheme(d.business?.theme_json?.color || COLORS.primary);
      setSlug(d.business?.share_slug || null);
    } catch (e) { console.warn(e?.message); setBlocks([]); }
  }, [id]);
  useEffect(() => { load(); }, [load]);

  const update = (i, props) => setBlocks((b) => b.map((bl, idx) => idx === i ? { ...bl, props: { ...bl.props, ...props } } : bl));
  const remove = (i) => { setBlocks((b) => b.filter((_, idx) => idx !== i)); setEditing(null); };
  const move = (i, dir) => setBlocks((b) => { const j = i + dir; if (j < 0 || j >= b.length) return b; const c = [...b]; [c[i], c[j]] = [c[j], c[i]]; return c; });
  const add = (type) => { setEditing(blocks.length); setBlocks((b) => [...b, newBlock(type)]); };

  const pickImage = async (i) => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert('İzin gerekli', 'Galeriye erişim izni verin.');
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (res.canceled || !res.assets?.[0]) return;
    setUploadingAt(i);
    try {
      const item = await uploadModuleImage(id, '_assets', res.assets[0].uri);
      const url = item?.data?.url || item?.url;
      update(i, { uri: mediaUrl(url) });
    } catch { Alert.alert('Hata', 'Görsel yüklenemedi'); }
    finally { setUploadingAt(null); }
  };

  const save = async () => {
    setSaving(true);
    try { await updateConfig(id, { landing_blocks: blocks }); Alert.alert('Kaydedildi', 'Ana sayfa güncellendi.'); }
    catch { Alert.alert('Hata', 'Kaydedilemedi'); }
    finally { setSaving(false); }
  };

  if (!blocks) return <SafeAreaView style={s.safe}><ActivityIndicator style={{ marginTop: 60 }} color={COLORS.primary} /></SafeAreaView>;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={COLORS.primary} /><Text style={s.back}>Geri</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {slug ? (
            <TouchableOpacity style={s.prevBtn} onPress={() => router.push(`/run/${slug}`)}>
              <Ionicons name="eye-outline" size={16} color={theme} /><Text style={[s.prevText, { color: theme }]}>Önizle</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity style={[s.saveBtn, { backgroundColor: theme }]} onPress={save} disabled={saving}>
            {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.saveText}>Kaydet</Text>}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: SIZES.pad, paddingBottom: 40 }}>
        <Text style={s.title}>Ana Sayfa</Text>
        <Text style={s.sub}>Mini app açılınca görünen içerik. Blokları düzenle, sırala, ekle.</Text>

        {blocks.length === 0 && <Text style={s.empty}>Henüz blok yok. Aşağıdan ekle.</Text>}

        {blocks.map((bl, i) => {
          const open = editing === i;
          return (
            <View key={i} style={[s.card, open && { borderColor: theme, borderWidth: 1.5 }]}>
              <TouchableOpacity style={s.cardHead} onPress={() => setEditing(open ? null : i)} activeOpacity={0.7}>
                <View style={s.typeBadge}><Ionicons name={bl.type === 'text' ? 'text' : bl.type === 'image' ? 'image' : 'radio-button-on'} size={14} color={theme} /><Text style={[s.typeText, { color: theme }]}>{TYPE_LABEL[bl.type] || bl.type}</Text></View>
              <Text style={s.summary} numberOfLines={1}>{bl.type === 'text' ? bl.props.text : bl.type === 'button' ? bl.props.label : (bl.props.uri ? 'Görsel seçili' : 'Görsel yok')}</Text>
                <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.muted} />
              </TouchableOpacity>

              {open && (
                <View style={s.editor}>
                  {bl.type === 'text' && (
                    <>
                      <TextInput style={s.area} value={bl.props.text} onChangeText={(t) => update(i, { text: t })} placeholder="Metin" placeholderTextColor="#B0B0C0" multiline />
                      <Seg label="Boyut" theme={theme} value={bl.props.size || 'normal'} opts={[['h1', 'Başlık'], ['h2', 'Alt başlık'], ['normal', 'Normal']]} onPick={(v) => update(i, { size: v })} />
                      <Seg label="Hizalama" theme={theme} value={bl.props.align || 'left'} opts={[['left', 'Sol'], ['center', 'Orta'], ['right', 'Sağ']]} onPick={(v) => update(i, { align: v })} />
                    </>
                  )}
                  {bl.type === 'image' && (
                    <View style={{ alignItems: 'center' }}>
                      {bl.props.uri ? <Image source={{ uri: bl.props.uri }} style={s.imgPrev} resizeMode="cover" /> : <View style={[s.imgPrev, s.imgEmpty]}><Ionicons name="image-outline" size={30} color="#8A8AA3" /></View>}
                      <TouchableOpacity style={[s.imgBtn, { borderColor: theme }]} onPress={() => pickImage(i)} disabled={uploadingAt === i}>
                        {uploadingAt === i ? <ActivityIndicator color={theme} /> : <Text style={[s.imgBtnText, { color: theme }]}>{bl.props.uri ? 'Görseli Değiştir' : 'Görsel Seç'}</Text>}
                      </TouchableOpacity>
                    </View>
                  )}
                  {bl.type === 'button' && (
                    <>
                      <TextInput style={s.input} value={bl.props.label} onChangeText={(t) => update(i, { label: t })} placeholder="Buton yazısı" placeholderTextColor="#B0B0C0" />
                      <Seg label="Aksiyon" theme={theme} value={bl.props.action || 'module'} opts={[['module', 'Özelliğe git'], ['phone', 'Telefon'], ['link', 'Link']]} onPick={(v) => update(i, { action: v, value: '' })} />
                      {bl.props.action === 'module' ? (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
                          {modules.filter((m) => MODULE_INFO[m]).map((m) => {
                            const on = bl.props.value === m;
                            return (
                              <TouchableOpacity key={m} style={[s.chip, on && { backgroundColor: theme, borderColor: theme }]} onPress={() => update(i, { value: m })}>
                                <Ionicons name={moduleIcon(m)} size={15} color={on ? '#fff' : theme} />
                                <Text style={[s.chipText, { color: on ? '#fff' : COLORS.text }]}>{MODULE_INFO[m].label}</Text>
                              </TouchableOpacity>
                            );
                          })}
                          {modules.length === 0 && <Text style={s.empty}>Önce özellik ekle.</Text>}
                        </ScrollView>
                      ) : (
                        <TextInput style={s.input} value={bl.props.value} onChangeText={(t) => update(i, { value: t })} placeholder={bl.props.action === 'phone' ? '05xx...' : 'https://...'} placeholderTextColor="#B0B0C0" keyboardType={bl.props.action === 'phone' ? 'phone-pad' : 'default'} autoCapitalize="none" />
                      )}
                    </>
                  )}

                  <View style={s.cardActions}>
                    <TouchableOpacity style={s.act} onPress={() => move(i, -1)} disabled={i === 0}><Ionicons name="arrow-up" size={20} color={i === 0 ? COLORS.border : COLORS.muted} /></TouchableOpacity>
                    <TouchableOpacity style={s.act} onPress={() => move(i, 1)} disabled={i === blocks.length - 1}><Ionicons name="arrow-down" size={20} color={i === blocks.length - 1 ? COLORS.border : COLORS.muted} /></TouchableOpacity>
                    <View style={{ flex: 1 }} />
                    <TouchableOpacity style={s.act} onPress={() => remove(i)}><Ionicons name="trash-outline" size={20} color={COLORS.danger} /></TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          );
        })}

        <Text style={s.addLabel}>Blok ekle</Text>
        <View style={s.addRow}>
          {['text', 'image', 'button'].map((t) => (
            <TouchableOpacity key={t} style={s.addBtn} onPress={() => add(t)}>
              <Ionicons name={t === 'text' ? 'text' : t === 'image' ? 'image' : 'radio-button-on'} size={20} color={theme} />
              <Text style={s.addText}>{TYPE_LABEL[t]}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const Seg = ({ label, value, opts, onPick, theme }) => (
  <View style={{ marginTop: 10 }}>
    <Text style={s.segLabel}>{label}</Text>
    <View style={s.seg}>
      {opts.map(([v, l]) => (
        <TouchableOpacity key={v} style={[s.segItem, value === v && { backgroundColor: theme }]} onPress={() => onPick(v)}>
          <Text style={[s.segText, value === v && { color: '#fff' }]}>{l}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SIZES.pad, paddingVertical: 10 },
  backBtn: { flexDirection: 'row', alignItems: 'center' },
  back: { color: COLORS.primary, fontSize: 17, fontWeight: '600' },
  prevBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 10, backgroundColor: '#F1F1F7' },
  prevText: { fontWeight: '700' },
  saveBtn: { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 10, minWidth: 76, alignItems: 'center', justifyContent: 'center' },
  saveText: { color: '#fff', fontWeight: '800' },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.text },
  sub: { fontSize: 14, color: COLORS.muted, marginTop: 4, marginBottom: 16, lineHeight: 20 },
  empty: { color: COLORS.muted, fontSize: 14, marginVertical: 8 },
  card: { backgroundColor: COLORS.card, borderRadius: 14, marginBottom: 10, borderWidth: 1.5, borderColor: 'transparent', overflow: 'hidden' },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 },
  typeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F1F1F7', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  typeText: { fontSize: 12, fontWeight: '700' },
  summary: { flex: 1, fontSize: 14, color: COLORS.text },
  editor: { paddingHorizontal: 14, paddingBottom: 14, gap: 4 },
  area: { backgroundColor: '#F1F1F7', borderRadius: 12, padding: 12, fontSize: 15, color: COLORS.text, minHeight: 70, textAlignVertical: 'top' },
  input: { backgroundColor: '#F1F1F7', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, fontSize: 15, color: COLORS.text, marginTop: 6 },
  segLabel: { fontSize: 12, color: COLORS.muted, fontWeight: '600', marginBottom: 5 },
  seg: { flexDirection: 'row', backgroundColor: '#ECECF4', borderRadius: 10, padding: 3 },
  segItem: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  segText: { fontWeight: '700', color: COLORS.muted, fontSize: 13 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: '#fff' },
  chipText: { fontWeight: '700', fontSize: 13 },
  imgPrev: { width: '100%', height: 160, borderRadius: 12, backgroundColor: '#ECECF4', marginTop: 6 },
  imgEmpty: { alignItems: 'center', justifyContent: 'center' },
  imgBtn: { borderWidth: 1.5, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 20, marginTop: 10, alignSelf: 'stretch', alignItems: 'center' },
  imgBtnText: { fontWeight: '700' },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 10 },
  act: { padding: 6 },
  addLabel: { fontSize: 14, fontWeight: '700', color: COLORS.muted, marginTop: 14, marginBottom: 8 },
  addRow: { flexDirection: 'row', gap: 10 },
  addBtn: { flex: 1, backgroundColor: COLORS.card, borderRadius: 12, paddingVertical: 16, alignItems: 'center', gap: 5, borderWidth: 1, borderColor: COLORS.border },
  addText: { fontWeight: '700', color: COLORS.text, fontSize: 13 },
});
