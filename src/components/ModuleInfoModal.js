// Modüle dokununca ne yaptığını anlatan ayrıntılı özet modalı. Her yerde kullanılır.
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme';
import { MODULE_INFO } from '../modules';
import { moduleIcon } from '../icons';

export default function ModuleInfoModal({ moduleKey, onClose, theme = COLORS.primary }) {
  const info = moduleKey ? MODULE_INFO[moduleKey] : null;
  return (
    <Modal visible={!!info} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={s.bg} activeOpacity={1} onPress={onClose}>
        <View style={s.card}>
          {info && (
            <>
              <View style={[s.iconBox, { backgroundColor: theme }]}>
                <Ionicons name={moduleIcon(moduleKey)} size={30} color="#fff" />
              </View>
              <Text style={s.title}>{info.label}</Text>
              <Text style={s.short}>{info.short}</Text>
              <Text style={s.detail}>{info.detail}</Text>
              <TouchableOpacity style={[s.btn, { backgroundColor: theme }]} onPress={onClose}>
                <Text style={s.btnText}>Anladım</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 28 },
  card: { backgroundColor: '#fff', borderRadius: 22, padding: 24, alignItems: 'center', width: '100%' },
  iconBox: { width: 64, height: 64, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  short: { fontSize: 15, color: COLORS.muted, marginTop: 4, textAlign: 'center', fontWeight: '600' },
  detail: { fontSize: 15, color: COLORS.text, marginTop: 14, lineHeight: 23, textAlign: 'left' },
  btn: { marginTop: 20, paddingVertical: 13, borderRadius: 12, alignItems: 'center', alignSelf: 'stretch' },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
