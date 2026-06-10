// Giriş ekranı. M0: dev-login (isim). Apple/Google butonları sonraki adımda native bağlanacak.
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { COLORS } from '../src/theme';

export default function Login() {
  const router = useRouter();
  const { loginDev } = useAuth();
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

  const doDevLogin = async () => {
    if (!name.trim()) return Alert.alert('İsim gerekli', 'Devam için bir isim gir.');
    setBusy(true);
    try {
      await loginDev(name.trim());
      router.replace('/(tabs)/storefront');
    } catch (e) {
      Alert.alert('Giriş başarısız', e?.message || 'Sunucuya ulaşılamadı. Backend açık mı?');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.top}>
        <Text style={s.logo}>yapp</Text>
        <Text style={s.tagline}>İşletmeler için uygulama dükkanı</Text>
      </View>

      <View style={s.card}>
        <Text style={s.label}>İsmin</Text>
        <TextInput
          style={s.input}
          value={name}
          onChangeText={setName}
          placeholder="Adın"
          placeholderTextColor="#B0B0C0"
          autoFocus
        />
        <TouchableOpacity style={s.primaryBtn} onPress={doDevLogin} disabled={busy}>
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={s.primaryText}>Devam Et</Text>}
        </TouchableOpacity>

        <View style={s.divider}><View style={s.line} /><Text style={s.or}>veya</Text><View style={s.line} /></View>

        <TouchableOpacity style={[s.socialBtn, { backgroundColor: '#000' }]} onPress={() => Alert.alert('Yakında', 'Apple ile giriş sonraki adımda bağlanacak.')}>
          <Ionicons name="logo-apple" size={20} color="#fff" />
          <Text style={s.socialText}>Apple ile Giriş</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.socialBtn, { backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.border }]} onPress={() => Alert.alert('Yakında', 'Google ile giriş sonraki adımda bağlanacak.')}>
          <Ionicons name="logo-google" size={20} color={COLORS.text} />
          <Text style={[s.socialText, { color: COLORS.text }]}>Google ile Giriş</Text>
        </TouchableOpacity>
      </View>

      <Text style={s.note}>{Platform.OS === 'ios' ? 'Test girişi (geliştirme). Apple/Google sonra aktif.' : 'Test girişi'}</Text>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', paddingHorizontal: 24 },
  top: { alignItems: 'center', marginBottom: 36 },
  logo: { fontSize: 54, fontWeight: '900', color: COLORS.primary, letterSpacing: -1 },
  tagline: { fontSize: 15, color: COLORS.muted, marginTop: 6 },
  card: { backgroundColor: COLORS.card, borderRadius: 20, padding: 22, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  label: { fontSize: 13, fontWeight: '700', color: COLORS.muted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: '#F1F1F7', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, fontSize: 17, color: COLORS.text, marginBottom: 14 },
  primaryBtn: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  primaryText: { color: '#fff', fontWeight: '800', fontSize: 17 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 18 },
  line: { flex: 1, height: 1, backgroundColor: COLORS.border },
  or: { color: COLORS.muted, marginHorizontal: 12, fontSize: 13 },
  socialBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, paddingVertical: 15, marginBottom: 10 },
  socialText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  note: { textAlign: 'center', color: COLORS.muted, fontSize: 12, marginTop: 20 },
});
