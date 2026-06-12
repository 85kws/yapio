// Profil: kullanıcı bilgisi + satıcı başvuru/durum + admin + rehber/sözleşme + çıkış.
import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { useLang } from '../../src/i18n';
import { COLORS, SIZES } from '../../src/theme';

export default function Profile() {
  const router = useRouter();
  const { t, lang, setLang } = useLang();
  const { user, logout, refresh } = useAuth();

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const doLogout = async () => { await logout(); router.replace('/login'); };
  const status = user?.seller_status || 'none';

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={s.headerTitle}>{t('tab_profile')}</Text>

        <View style={s.userCard}>
          <View style={s.avatar}><Text style={s.avatarText}>{(user?.name || '?')[0].toUpperCase()}</Text></View>
          <Text style={s.name}>{user?.name || t('user')}</Text>
          {user?.email ? <Text style={s.email}>{user.email}</Text> : null}
          <View style={s.badges}>
            {status === 'approved' ? <Badge icon="briefcase" text={t('badge_seller')} color={COLORS.success} /> : null}
            {user?.is_admin ? <Badge icon="shield-checkmark" text={t('badge_admin')} color={COLORS.primary} /> : null}
          </View>
        </View>

        {/* Satıcı bölümü */}
        <Text style={s.sectionLabel}>{t('business')}</Text>
        {status === 'none' && (
          <Card icon="briefcase-outline" title={t('open_business')} desc={t('open_business_desc')} onPress={() => router.push('/seller-apply')} />
        )}
        {status === 'pending' && (
          <View style={[s.infoCard, { backgroundColor: '#FFF7E6' }]}>
            <Ionicons name="time-outline" size={24} color="#B7791F" />
            <View style={{ flex: 1 }}>
              <Text style={s.infoTitle}>{t('pending_title')}</Text>
              <Text style={s.infoDesc}>{t('pending_desc')}</Text>
            </View>
          </View>
        )}
        {status === 'rejected' && (
          <View>
            <View style={[s.infoCard, { backgroundColor: '#FDECEC' }]}>
              <Ionicons name="close-circle-outline" size={24} color={COLORS.danger} />
              <View style={{ flex: 1 }}>
                <Text style={s.infoTitle}>{t('rejected_title')}</Text>
                <Text style={s.infoDesc}>{user?.seller_profile?.reject_reason || t('reapply_desc')}</Text>
              </View>
            </View>
            <Card icon="refresh" title={t('reapply')} desc={t('reapply_desc')} onPress={() => router.push('/seller-apply')} />
          </View>
        )}
        {status === 'approved' && (
          <>
            <Card icon="briefcase" title={t('my_businesses')} desc={t('my_businesses_desc')} onPress={() => router.push('/my-businesses')} />
            <Card icon="help-buoy-outline" title={t('guide_card')} desc={t('guide_card_desc')} onPress={() => router.push('/guide')} />
          </>
        )}

        {/* Admin */}
        {user?.is_admin && (
          <>
            <Text style={s.sectionLabel}>{t('admin_mgmt')}{user?.is_super ? ` (${t('super_admin')})` : ''}</Text>
            <Card icon="shield-checkmark-outline" title={t('seller_apps')} desc={t('seller_apps_desc')} onPress={() => router.push('/admin/sellers')} />
            {user?.is_super && <Card icon="business-outline" title={t('all_businesses')} desc={t('all_businesses_desc')} onPress={() => router.push('/admin/businesses')} />}
          </>
        )}

        {/* Yardım & yasal */}
        <Text style={s.sectionLabel}>{t('help_legal')}</Text>
        <Card icon="mail-outline" title={t('support')} desc={`${t('support_desc')}: o.y.baser@gmail.com`} onPress={() => Linking.openURL('mailto:o.y.baser@gmail.com?subject=Yapio%20Feedback')} />
        <Card icon="document-text-outline" title={t('terms_card')} desc={t('terms_desc')} onPress={() => router.push('/terms')} />

        <Text style={s.sectionLabel}>{t('settings')}</Text>
        <View style={s.langCard}>
          <View style={s.cardIcon}><Ionicons name="language-outline" size={22} color={COLORS.primary} /></View>
          <Text style={s.langLabel}>{t('language')}</Text>
          <View style={s.langSeg}>
            {[['tr', 'Türkçe'], ['en', 'English']].map(([l, lbl]) => (
              <TouchableOpacity key={l} style={[s.langBtn, lang === l && { backgroundColor: COLORS.primary }]} onPress={() => setLang(l)}>
                <Text style={[s.langBtnText, lang === l && { color: '#fff' }]}>{lbl}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={s.logoutBtn} onPress={doLogout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
          <Text style={s.logoutText}>{t('logout')}</Text>
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
  langCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 14, marginHorizontal: SIZES.pad, marginBottom: 10, padding: 16, gap: 14 },
  langLabel: { flex: 1, fontSize: 16, fontWeight: '700', color: COLORS.text },
  langSeg: { flexDirection: 'row', backgroundColor: '#ECECF4', borderRadius: 10, padding: 3 },
  langBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  langBtnText: { fontWeight: '700', color: COLORS.muted, fontSize: 13 },
});
