// Profil: kullanıcı bilgisi + satıcı başvuru/durum + admin + rehber/sözleşme + çıkış.
import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { COLORS, SIZES } from '../../src/theme';

export default function Profile() {
  const router = useRouter();
  const { user, logout, refresh } = useAuth();

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const doLogout = async () => { await logout(); router.replace('/login'); };
  const status = user?.seller_status || 'none';

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={s.headerTitle}>Profil</Text>

        <View style={s.userCard}>
          <View style={s.avatar}><Text style={s.avatarText}>{(user?.name || '?')[0].toUpperCase()}</Text></View>
          <Text style={s.name}>{user?.name || 'Kullanıcı'}</Text>
          {user?.email ? <Text style={s.email}>{user.email}</Text> : null}
          <View style={s.badges}>
            {status === 'approved' ? <Badge icon="briefcase" text="Satıcı" color={COLORS.success} /> : null}
            {user?.is_admin ? <Badge icon="shield-checkmark" text="Yönetici" color={COLORS.primary} /> : null}
          </View>
        </View>

        {/* Satıcı bölümü */}
        <Text style={s.sectionLabel}>İşletme</Text>
        {status === 'none' && (
          <Card icon="briefcase-outline" title="İşletme Hesabı Aç" desc="Kendi uygulamanı yap ve hizmet sat. Başvuru gerekir." onPress={() => router.push('/seller-apply')} />
        )}
        {status === 'pending' && (
          <View style={[s.infoCard, { backgroundColor: '#FFF7E6' }]}>
            <Ionicons name="time-outline" size={24} color="#B7791F" />
            <View style={{ flex: 1 }}>
              <Text style={s.infoTitle}>Başvurun inceleniyor</Text>
              <Text style={s.infoDesc}>Onaylanınca işletme app'i kurabilirsin.</Text>
            </View>
          </View>
        )}
        {status === 'rejected' && (
          <View>
            <View style={[s.infoCard, { backgroundColor: '#FDECEC' }]}>
              <Ionicons name="close-circle-outline" size={24} color={COLORS.danger} />
              <View style={{ flex: 1 }}>
                <Text style={s.infoTitle}>Başvurun reddedildi</Text>
                <Text style={s.infoDesc}>{user?.seller_profile?.reject_reason || 'Tekrar başvurabilirsin.'}</Text>
              </View>
            </View>
            <Card icon="refresh" title="Tekrar Başvur" desc="Bilgileri güncelleyip yeniden gönder." onPress={() => router.push('/seller-apply')} />
          </View>
        )}
        {status === 'approved' && (
          <Card icon="briefcase" title="İşletmelerim" desc="App'lerini yönet, yeni işletme ekle." onPress={() => router.push('/my-businesses')} />
        )}

        {/* Admin */}
        {user?.is_admin && (
          <>
            <Text style={s.sectionLabel}>Yönetim</Text>
            <Card icon="shield-checkmark-outline" title="Satıcı Başvuruları" desc="Bekleyen başvuruları onayla/reddet." onPress={() => router.push('/admin/sellers')} />
          </>
        )}

        {/* Yardım & yasal */}
        <Text style={s.sectionLabel}>Yardım & Yasal</Text>
        <Card icon="card-outline" title="Ödeme Bağlama Rehberi" desc="iyzico/Stripe nasıl bağlanır." onPress={() => router.push('/payment-guide')} />
        <Card icon="document-text-outline" title="Kullanım Sözleşmesi" desc="Şartlar ve koşullar." onPress={() => router.push('/terms')} />

        <TouchableOpacity style={s.logoutBtn} onPress={doLogout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
          <Text style={s.logoutText}>Çıkış Yap</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const Badge = ({ icon, text, color }) => (
  <View style={[s.badge, { backgroundColor: color + '18' }]}>
    <Ionicons name={icon} size={13} color={color} />
    <Text style={[s.badgeText, { color }]}>{text}</Text>
  </View>
);

const Card = ({ icon, title, desc, onPress }) => (
  <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.7}>
    <View style={s.cardIcon}><Ionicons name={icon} size={22} color={COLORS.primary} /></View>
    <View style={{ flex: 1 }}>
      <Text style={s.cardTitle}>{title}</Text>
      <Text style={s.cardDesc}>{desc}</Text>
    </View>
    <Ionicons name="chevron-forward" size={22} color={COLORS.muted} />
  </TouchableOpacity>
);

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  headerTitle: { fontSize: 30, fontWeight: '800', color: COLORS.text, paddingHorizontal: SIZES.pad, paddingTop: 8, paddingBottom: 10 },
  userCard: { backgroundColor: COLORS.card, borderRadius: 20, marginHorizontal: SIZES.pad, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  avatar: { width: 76, height: 76, borderRadius: 38, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '800' },
  name: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  email: { fontSize: 14, color: COLORS.muted, marginTop: 4 },
  badges: { flexDirection: 'row', gap: 8, marginTop: 12 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  badgeText: { fontWeight: '700', fontSize: 13 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: COLORS.muted, marginTop: 22, marginBottom: 8, marginHorizontal: SIZES.pad, textTransform: 'uppercase', letterSpacing: 0.5 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 14, marginHorizontal: SIZES.pad, marginBottom: 10, padding: 16, gap: 14 },
  cardIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#EEEcFB', alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  cardDesc: { fontSize: 13, color: COLORS.muted, marginTop: 2 },
  infoCard: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 14, marginHorizontal: SIZES.pad, marginBottom: 10, padding: 16 },
  infoTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  infoDesc: { fontSize: 13, color: COLORS.muted, marginTop: 2 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: SIZES.pad, marginTop: 20, backgroundColor: '#fff', borderRadius: 14, paddingVertical: 16, borderWidth: 1, borderColor: COLORS.border },
  logoutText: { color: COLORS.danger, fontWeight: '700', fontSize: 16 },
});
