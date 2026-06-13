// Personel QR okuyucu — üyelik/sadakat kartını okutup check-in/damga için.
// expo-camera CameraView ile QR tarar; onScan(data) ile ham metni döner.
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme';
import { useLang } from '../i18n';

export default function QRScanner({ visible, onClose, onScan, theme }) {
  const { t } = useLang();
  const accent = theme || COLORS.primary;
  const [permission, requestPermission] = useCameraPermissions();
  const [lock, setLock] = useState(false);

  // her açılışta kilidi sıfırla (tekrar tarama için)
  useEffect(() => { if (visible) setLock(false); }, [visible]);

  const handle = ({ data }) => {
    if (lock || !data) return;
    setLock(true);
    onScan(data);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={s.wrap}>
        {!permission ? (
          <ActivityIndicator color="#fff" style={{ marginTop: 80 }} />
        ) : !permission.granted ? (
          <View style={s.center}>
            <Ionicons name="camera-outline" size={48} color="#fff" />
            <Text style={s.msg}>{t('camera_permission')}</Text>
            <TouchableOpacity style={[s.btn, { backgroundColor: accent }]} onPress={requestPermission}>
              <Text style={s.btnText}>{t('grant_permission')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <CameraView style={StyleSheet.absoluteFill} facing="back" barcodeScannerSettings={{ barcodeTypes: ['qr'] }} onBarcodeScanned={handle} />
            <View style={s.frame} pointerEvents="none" />
            <Text style={s.hint}>{t('scan_hint')}</Text>
          </>
        )}
        <SafeAreaView edges={['top']} style={s.closeWrap} pointerEvents="box-none">
          <TouchableOpacity style={s.closeBtn} onPress={onClose}><Ionicons name="close" size={26} color="#fff" /></TouchableOpacity>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 30 },
  msg: { color: '#fff', fontSize: 15, textAlign: 'center' },
  btn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  frame: { position: 'absolute', top: '32%', left: '15%', width: '70%', aspectRatio: 1, borderWidth: 3, borderColor: '#fff', borderRadius: 24, opacity: 0.9 },
  hint: { position: 'absolute', bottom: 80, left: 0, right: 0, textAlign: 'center', color: '#fff', fontSize: 15, fontWeight: '600' },
  closeWrap: { position: 'absolute', top: 0, left: 0, right: 0, alignItems: 'flex-start', paddingHorizontal: 12 },
  closeBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', marginTop: 6 },
});
