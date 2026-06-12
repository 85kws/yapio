// Satıcı galeri yönetimi: görsel yükle/sil.
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getItems, deleteItem, uploadModuleImage, mediaUrl } from '../../api/client';
import { useLang } from '../../i18n';
import { COLORS } from '../../theme';

const W = (Dimensions.get('window').width - 18 * 2 - 12) / 2;

export default function ManageGallery({ businessId, theme }) {
  const { t } = useLang();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [up, setUp] = useState(false);

  const load = useCallback(async () => {
    try { setItems(await getItems(businessId, 'gallery')); } finally { setLoading(false); }
  }, [businessId]);
  useEffect(() => { load(); }, [load]);

  const add = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert(t('permission_required'), t('gallery_permission'));
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (res.canceled || !res.assets?.[0]) return;
    setUp(true);
    try { await uploadModuleImage(businessId, 'gallery', res.assets[0].uri); load(); }
    catch { Alert.alert(t('error'), t('image_upload_failed')); } finally { setUp(false); }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={theme} />;
  return (
    <ScrollView contentContainerStyle={s.wrap}>
      <TouchableOpacity style={[s.addBtn, { backgroundColor: theme }]} onPress={add} disabled={up}>
        {up ? <ActivityIndicator color="#fff" /> : <><Ionicons name="cloud-upload-outline" size={20} color="#fff" /><Text style={s.addText}>{t('upload_image')}</Text></>}
      </TouchableOpacity>
      <View style={s.grid}>
        {items.map((it) => (
          <View key={it.id} style={s.cell}>
            <Image source={{ uri: mediaUrl(it.data.url) }} style={s.img} />
            <TouchableOpacity style={s.del} onPress={() => deleteItem(businessId, 'gallery', it.id).then(load)}><Ionicons name="close" size={16} color="#fff" /></TouchableOpacity>
          </View>
        ))}
      </View>
      {items.length === 0 && <Text style={s.empty}>{t('no_images')}</Text>}
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 18 },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 12, paddingVertical: 14, marginBottom: 14 },
  addText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  cell: { position: 'relative' },
  img: { width: W, height: W, borderRadius: 12, backgroundColor: '#ECECF4' },
  del: { position: 'absolute', top: 6, right: 6, width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  empty: { color: COLORS.muted, textAlign: 'center', marginTop: 20 },
});
