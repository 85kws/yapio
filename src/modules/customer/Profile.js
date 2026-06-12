// Müşteri işletme profili: adres (harita), telefon (ara), saatler, açıklama.
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLang } from '../../i18n';
import { COLORS } from '../../theme';

export default function Profile({ business, theme }) {
  const { t } = useLang();
  const b = business || {};
  const h = b.hours_json || {};
  return (
    <ScrollView contentContainerStyle={s.wrap}>
      {b.description ? <Text style={s.desc}>{b.description}</Text> : null}

      {b.address ? (
        <TouchableOpacity style={s.row} onPress={() => Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(b.address)}`)}>
          <View style={[s.icon, { backgroundColor: theme + '18' }]}><Ionicons name="location" size={22} color={theme} /></View>
          <View style={{ flex: 1 }}><Text style={s.label}>{t('address_label')}</Text><Text style={s.val}>{b.address}</Text></View>
          <Ionicons name="navigate" size={20} color={theme} />
        </TouchableOpacity>
      ) : null}

      {b.phone ? (
        <TouchableOpacity style={s.row} onPress={() => Linking.openURL(`tel:${b.phone}`)}>
          <View style={[s.icon, { backgroundColor: theme + '18' }]}><Ionicons name="call" size={22} color={theme} /></View>
          <View style={{ flex: 1 }}><Text style={s.label}>{t('phone_label')}</Text><Text style={s.val}>{b.phone}</Text></View>
          <Ionicons name="call-outline" size={20} color={theme} />
        </TouchableOpacity>
      ) : null}

      {(h.open || h.close) ? (
        <View style={s.row}>
          <View style={[s.icon, { backgroundColor: theme + '18' }]}><Ionicons name="time" size={22} color={theme} /></View>
          <View style={{ flex: 1 }}><Text style={s.label}>{t('working_hours')}</Text><Text style={s.val}>{h.open || '—'} - {h.close || '—'}</Text></View>
        </View>
      ) : null}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 18 },
  desc: { fontSize: 15, color: COLORS.text, lineHeight: 23, marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10 },
  icon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 13, color: COLORS.muted, fontWeight: '600' },
  val: { fontSize: 16, color: COLORS.text, fontWeight: '600', marginTop: 2 },
});
