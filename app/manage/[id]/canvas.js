// Canva benzeri serbest tasarım editörü: tuval üzerinde metin/görsel/buton öğeleri.
// Sürükle-taşı + boyut/yazı-boyutu ayarı + içerik. config.landing_canvas olarak kaydedilir.
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert, Image, PanResponder, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getBusiness, updateConfig, uploadModuleImage, mediaUrl } from '../../../src/api/client';
import { COLORS, SIZES } from '../../../src/theme';
import { MODULE_INFO } from '../../../src/modules';
import { moduleIcon } from '../../../src/icons';

const CW = Dimensions.get('window').width - 24; // tuval genişliği
const COLORS_TEXT = ['#1A1A2E', '#FFFFFF', '#5B4BE7', '#E93D82', '#30A46C', '#F76808'];
let _id = 1;
const uid = () => 'e' + (_id++) + '_' + Math.random().toString(36).slice(2, 6);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

const newEl = (type, theme) => {
  const base = { id: uid(), type, x: 24, y: 24 };
  if (type === 'text') return { ...base, w: CW - 48, h: 44, text: 'Yazı', size: 22, color: '#1A1A2E', align: 'left', bold: true };
  if (type === 'image') return { ...base, w: CW - 48, h: 160, uri: '' };
  return { ...base, w: 200, h: 48, label: 'Buton', action: 'module', value: '', bg: theme };
};

export default function CanvasEditor() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [els, setEls] = useState(null);
  const [height, setHeight] = useState(560);
  const [modules, setModules] = useState([]);
  const [theme, setTheme] = useState(COLORS.primary);
  const [slug, setSlug] = useState(null);
  const [sel, setSel] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const drag = useRef(null);
  const elsRef = useRef([]);      // her zaman güncel els (grant'ta pozisyon okumak için)
  const pans = useRef({});        // öğe başına KALICI PanResponder (her render'da yeniden üretme → titreme)
  elsRef.current = els || [];

  const load = useCallback(async () => {
    try {
      const d = await getBusiness(id);
      const c = d.config?.landing_canvas;
      setEls(c?.elements || []);
      setHeight(c?.height || 560);
      setModules(d.config?.modules_enabled || []);
      setTheme(d.business?.theme_json?.color || COLORS.primary);
      setSlug(d.business?.share_slug || null);
    } catch (e) { console.warn(e?.message); setEls([]); }
  }, [id]);
  useEffect(() => { load(); }, [load]);

  const update = (eid, patch) => setEls((a) => a.map((e) => e.id === eid ? { ...e, ...patch } : e));
  const remove = (eid) => { setEls((a) => a.filter((e) => e.id !== eid)); setSel(null); };
  const add = (type) => { const e = newEl(type, theme); setEls((a) => [...a, e]); setSel(e.id); };

  // Öğe başına KALICI PanResponder. Grant'ta güncel konumu elsRef'ten okur (kapanış bayatlamaz).
  // Her render'da yeniden üretilmediği için sürükleme jesti kesilmez (titreme yok).
  const getPan = (eid) => {
    if (pans.current[eid]) return pans.current[eid];
    pans.current[eid] = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 3 || Math.abs(g.dy) > 3,
      onPanResponderGrant: () => {
        const cur = elsRef.current.find((e) => e.id === eid) || { x: 0, y: 0 };
        setSel(eid); setDragging(true);
        drag.current = { id: eid, x: cur.x, y: cur.y };
      },
      onPanResponderMove: (_, g) => {
        const ds = drag.current; if (!ds) return;
        setEls((a) => a.map((e) => e.id === ds.id ? { ...e, x: clamp(ds.x + g.dx, 0, CW - e.w), y: Math.max(0, ds.y + g.dy) } : e));
      },
      onPanResponderRelease: () => { drag.current = null; setDragging(false); },
      onPanResponderTerminate: () => { drag.current = null; setDragging(false); },
    });
    return pans.current[eid];
  };

  const pickImg = async (eid) => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert('İzin gerekli', 'Galeriye erişim izni verin.');
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (res.canceled || !res.assets?.[0]) return;
    setUploading(true);
    try { const item = await uploadModuleImage(id, '_assets', res.assets[0].uri); update(eid, { uri: mediaUrl(item?.data?.url || item?.url) }); }
    catch { Alert.alert('Hata', 'Görsel yüklenemedi'); } finally { setUploading(false); }
  };

  const save = async () => {
    setSaving(true);
    try { await updateConfig(id, { landing_canvas: { width: CW, height, elements: els } }); Alert.alert('Kaydedildi', 'Tasarım kaydedildi.'); }
    catch { Alert.alert('Hata', 'Kaydedilemedi'); } finally { setSaving(false); }
  };

  if (!els) return <SafeAreaView style={s.safe}><ActivityIndicator style={{ marginTop: 60 }} color={COLORS.primary} /></SafeAreaView>;
  const selEl = els.find((e) => e.id === sel);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}><Ionicons name="chevron-back" size={22} color={COLORS.primary} /><Text style={s.back}>Geri</Text></TouchableOpacity>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {slug ? <TouchableOpacity style={s.prevBtn} onPress={() => router.push(`/run/${slug}`)}><Ionicons name="eye-outline" size={16} color={theme} /><Text style={[s.prevText, { color: theme }]}>Önizle</Text></TouchableOpacity> : null}
          <TouchableOpacity style={[s.saveBtn, { backgroundColor: theme }]} onPress={save} disabled={saving}>{saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.saveText}>Kaydet</Text>}</TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 30 }} scrollEnabled={!dragging}>
        <Text style={s.hint}>Öğeyi sürükleyerek taşı (yukarı-aşağı, sağa-sola). Dokununca aşağıda ayarları çıkar.</Text>
        {/* TUVAL */}
        <View style={[s.canvas, { width: CW, height }]} onStartShouldSetResponder={() => true} onResponderRelease={() => setSel(null)}>
          {els.map((el) => {
            const on = el.id === sel;
            return (
              <View key={el.id} {...getPan(el.id).panHandlers} style={[{ position: 'absolute', left: el.x, top: el.y, width: el.w, height: el.h }, on && s.selBox]}>
                {el.type === 'text' ? (
                  <Text style={{ fontSize: el.size, color: el.color, fontWeight: el.bold ? '800' : '400', textAlign: el.align }}>{el.text}</Text>
                ) : el.type === 'image' ? (
                  el.uri ? <Image source={{ uri: el.uri }} style={{ width: '100%', height: '100%', borderRadius: 10 }} resizeMode="cover" /> : <View style={[s.imgPh, { width: '100%', height: '100%' }]}><Ionicons name="image-outline" size={26} color="#8A8AA3" /></View>
                ) : (
                  <View style={[s.btnEl, { backgroundColor: el.bg }]}><Text style={s.btnElText} numberOfLines={1}>{el.label}</Text></View>
                )}
              </View>
            );
          })}
          {els.length === 0 ? <Text style={s.empty}>Aşağıdan öğe ekle.</Text> : null}
        </View>

        {/* EKLE + tuval boyu */}
        <View style={s.addRow}>
          {[['text', 'Metin', 'text'], ['image', 'Görsel', 'image'], ['button', 'Buton', 'radio-button-on']].map(([t, l, ic]) => (
            <TouchableOpacity key={t} style={s.addBtn} onPress={() => add(t)}><Ionicons name={ic} size={20} color={theme} /><Text style={s.addText}>{l}</Text></TouchableOpacity>
          ))}
        </View>
        <View style={s.heightRow}>
          <Text style={s.hLabel}>Tuval yüksekliği</Text>
          <Stepper onMinus={() => setHeight((h) => Math.max(320, h - 60))} onPlus={() => setHeight((h) => Math.min(2000, h + 60))} val={height} theme={theme} />
        </View>

        {/* ÖZELLİK PANELİ */}
        {selEl ? (
          <View style={s.panel}>
            <View style={s.panelHead}>
              <Text style={s.panelTitle}>{selEl.type === 'text' ? 'Metin' : selEl.type === 'image' ? 'Görsel' : 'Buton'}</Text>
              <TouchableOpacity onPress={() => remove(selEl.id)}><Ionicons name="trash-outline" size={20} color={COLORS.danger} /></TouchableOpacity>
            </View>

            {selEl.type === 'text' && (
              <>
                <TextInput style={s.input} value={selEl.text} onChangeText={(v) => update(selEl.id, { text: v })} placeholder="Metin" placeholderTextColor="#B0B0C0" multiline />
                <View style={s.ctlRow}><Text style={s.ctlLabel}>Yazı boyutu</Text><Stepper onMinus={() => update(selEl.id, { size: Math.max(10, selEl.size - 2) })} onPlus={() => update(selEl.id, { size: Math.min(60, selEl.size + 2) })} val={selEl.size} theme={theme} /></View>
                <View style={s.ctlRow}><Text style={s.ctlLabel}>Genişlik</Text><Stepper onMinus={() => update(selEl.id, { w: Math.max(40, selEl.w - 20) })} onPlus={() => update(selEl.id, { w: Math.min(CW, selEl.w + 20) })} val={Math.round(selEl.w)} theme={theme} /></View>
                <Text style={s.ctlLabel}>Renk</Text>
                <View style={s.swRow}>{COLORS_TEXT.map((c) => <TouchableOpacity key={c} style={[s.sw, { backgroundColor: c, borderWidth: c === '#FFFFFF' ? 1 : 0, borderColor: COLORS.border }, selEl.color === c && s.swOn]} onPress={() => update(selEl.id, { color: c })} />)}</View>
                <View style={s.segRow}>
                  {[['left', 'Sol'], ['center', 'Orta'], ['right', 'Sağ']].map(([v, l]) => <TouchableOpacity key={v} style={[s.seg, selEl.align === v && { backgroundColor: theme }]} onPress={() => update(selEl.id, { align: v })}><Text style={[s.segT, selEl.align === v && { color: '#fff' }]}>{l}</Text></TouchableOpacity>)}
                  <TouchableOpacity style={[s.seg, selEl.bold && { backgroundColor: theme }]} onPress={() => update(selEl.id, { bold: !selEl.bold })}><Text style={[s.segT, selEl.bold && { color: '#fff' }]}>Kalın</Text></TouchableOpacity>
                </View>
              </>
            )}

            {selEl.type === 'image' && (
              <>
                <TouchableOpacity style={[s.pickBtn, { borderColor: theme }]} onPress={() => pickImg(selEl.id)} disabled={uploading}>{uploading ? <ActivityIndicator color={theme} /> : <Text style={[s.pickText, { color: theme }]}>{selEl.uri ? 'Görseli Değiştir' : 'Görsel Seç'}</Text>}</TouchableOpacity>
                <View style={s.ctlRow}><Text style={s.ctlLabel}>Genişlik</Text><Stepper onMinus={() => update(selEl.id, { w: Math.max(60, selEl.w - 20) })} onPlus={() => update(selEl.id, { w: Math.min(CW, selEl.w + 20) })} val={Math.round(selEl.w)} theme={theme} /></View>
                <View style={s.ctlRow}><Text style={s.ctlLabel}>Yükseklik</Text><Stepper onMinus={() => update(selEl.id, { h: Math.max(60, selEl.h - 20) })} onPlus={() => update(selEl.id, { h: selEl.h + 20 })} val={Math.round(selEl.h)} theme={theme} /></View>
              </>
            )}

            {selEl.type === 'button' && (
              <>
                <TextInput style={s.input} value={selEl.label} onChangeText={(v) => update(selEl.id, { label: v })} placeholder="Buton yazısı" placeholderTextColor="#B0B0C0" />
                <View style={s.segRow}>{[['module', 'Özelliğe git'], ['phone', 'Telefon'], ['link', 'Link']].map(([v, l]) => <TouchableOpacity key={v} style={[s.seg, (selEl.action || 'module') === v && { backgroundColor: theme }]} onPress={() => update(selEl.id, { action: v, value: '' })}><Text style={[s.segT, (selEl.action || 'module') === v && { color: '#fff' }]}>{l}</Text></TouchableOpacity>)}</View>
                {selEl.action === 'module' ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
                    {modules.filter((m) => MODULE_INFO[m]).map((m) => { const o = selEl.value === m; return <TouchableOpacity key={m} style={[s.chip, o && { backgroundColor: theme, borderColor: theme }]} onPress={() => update(selEl.id, { value: m })}><Ionicons name={moduleIcon(m)} size={15} color={o ? '#fff' : theme} /><Text style={[s.chipT, { color: o ? '#fff' : COLORS.text }]}>{MODULE_INFO[m].label}</Text></TouchableOpacity>; })}
                    {modules.length === 0 ? <Text style={s.empty2}>Önce özellik ekle.</Text> : null}
                  </ScrollView>
                ) : (
                  <TextInput style={s.input} value={selEl.value} onChangeText={(v) => update(selEl.id, { value: v })} placeholder={selEl.action === 'phone' ? '05xx...' : 'https://...'} placeholderTextColor="#B0B0C0" autoCapitalize="none" keyboardType={selEl.action === 'phone' ? 'phone-pad' : 'default'} />
                )}
                <View style={s.ctlRow}><Text style={s.ctlLabel}>Genişlik</Text><Stepper onMinus={() => update(selEl.id, { w: Math.max(80, selEl.w - 20) })} onPlus={() => update(selEl.id, { w: Math.min(CW, selEl.w + 20) })} val={Math.round(selEl.w)} theme={theme} /></View>
              </>
            )}
          </View>
        ) : <Text style={s.tapHint}>Bir öğeye dokun → ayarları burada çıkar.</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}

const Stepper = ({ onMinus, onPlus, val, theme }) => (
  <View style={s.stepper}>
    <TouchableOpacity onPress={onMinus} style={s.stepBtn}><Ionicons name="remove" size={18} color={theme} /></TouchableOpacity>
    <Text style={s.stepVal}>{val}</Text>
    <TouchableOpacity onPress={onPlus} style={s.stepBtn}><Ionicons name="add" size={18} color={theme} /></TouchableOpacity>
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
  hint: { fontSize: 13, color: COLORS.muted, textAlign: 'center', marginVertical: 8 },
  canvas: { alignSelf: 'center', backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  selBox: { borderWidth: 1.5, borderColor: COLORS.primary, borderStyle: 'dashed', borderRadius: 6 },
  imgPh: { backgroundColor: '#ECECF4', alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  btnEl: { flex: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 },
  btnElText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  empty: { color: COLORS.muted, textAlign: 'center', marginTop: 40 },
  addRow: { flexDirection: 'row', gap: 10, paddingHorizontal: SIZES.pad, marginTop: 14 },
  addBtn: { flex: 1, backgroundColor: COLORS.card, borderRadius: 12, paddingVertical: 14, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: COLORS.border },
  addText: { fontWeight: '700', color: COLORS.text, fontSize: 13 },
  heightRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SIZES.pad, marginTop: 14 },
  hLabel: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  panel: { backgroundColor: COLORS.card, margin: SIZES.pad, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: COLORS.border },
  panelHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  panelTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  input: { backgroundColor: '#F1F1F7', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: COLORS.text, marginBottom: 8 },
  ctlRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  ctlLabel: { fontSize: 13, fontWeight: '700', color: COLORS.muted },
  stepper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F1F7', borderRadius: 10 },
  stepBtn: { padding: 8 },
  stepVal: { minWidth: 44, textAlign: 'center', fontWeight: '800', color: COLORS.text },
  swRow: { flexDirection: 'row', gap: 10, marginTop: 6, marginBottom: 4 },
  sw: { width: 30, height: 30, borderRadius: 15 },
  swOn: { borderWidth: 3, borderColor: COLORS.primary },
  segRow: { flexDirection: 'row', gap: 6, marginTop: 10, flexWrap: 'wrap' },
  seg: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 9, backgroundColor: '#ECECF4' },
  segT: { fontWeight: '700', color: COLORS.muted, fontSize: 13 },
  pickBtn: { borderWidth: 1.5, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  pickText: { fontWeight: '700' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: '#fff' },
  chipT: { fontWeight: '700', fontSize: 13 },
  empty2: { color: COLORS.muted },
  tapHint: { textAlign: 'center', color: COLORS.muted, fontSize: 13, marginTop: 16, paddingHorizontal: 30 },
});
