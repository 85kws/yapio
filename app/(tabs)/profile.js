// Profil: kullanıcı bilgisi + çıkış.
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { COLORS, SIZES } from '../../src/theme';

export default function Profile() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const doLogout = async () => { await logout(); router.replace('/login'); };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <Text style={s.title}>Profil</Text>
      <View style={s.card}>
        <View style={s.avatar}><Text style={s.avatarText}>{(user?.name || '?')[0].toUpperCase()}</Text></View>
        <Text style={s.name}>{user?.name || 'Kullanıcı'}</Text>
        {user?.email ? <Text style={s.email}>{user.email}</Text> : null}
        {user?.is_dev ? <View style={s.badge}><Text style={s.badgeText}>İşletme Sahibi</Text></View> : null}
      </View>

      <TouchableOpacity style={s.logoutBtn} onPress={doLogout}>
        <Text style={s.logoutText}>Çıkış Yap</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  title: { fontSize: 30, fontWeight: '800', color: COLORS.text, paddingHorizontal: SIZES.pad, paddingTop: 8, paddingBottom: 10 },
  card: { backgroundColor: COLORS.card, borderRadius: 20, margin: SIZES.pad, padding: 28, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  avatarText: { color: '#fff', fontSize: 34, fontWeight: '800' },
  name: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  email: { fontSize: 14, color: COLORS.muted, marginTop: 4 },
  badge: { backgroundColor: '#EEF', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, marginTop: 12 },
  badgeText: { color: COLORS.primary, fontWeight: '700', fontSize: 13 },
  logoutBtn: { marginHorizontal: SIZES.pad, marginTop: 10, backgroundColor: '#fff', borderRadius: 14, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  logoutText: { color: COLORS.danger, fontWeight: '700', fontSize: 16 },
});
