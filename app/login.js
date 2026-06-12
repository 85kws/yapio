// Giriş ekranı: KAYIT (yeni hesap) / GİRİŞ (mevcut hesap) — isim + şifre. Dil: TR/EN.
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { useLang } from '../src/i18n';
import { COLORS } from '../src/theme';

export default function Login() {
  const router = useRouter();
  const { t } = useLang();
  const { login, register, acceptTermsNow } = useAuth();
  const [mode, setMode] = useState('register');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const isLogin = mode === 'login';

  const needAccept = () => Alert.alert(t('need_accept_title'), t('need_accept_body'));

  const submit = async () => {
    if (!accepted) return needAccept();
    if (!name.trim()) return Alert.alert(t('name'), t('name_required'));
    if (!password) return Alert.alert(t('password'), isLogin ? t('password_required_login') : t('password_required_register'));
    Keyboard.dismiss();
    setBusy(true);
    try {
      if (isLogin) await login(name.trim(), password);
      else await register(name.trim(), password);
      await acceptTermsNow().catch(() => {});
      router.replace('/(tabs)/storefront');
    } catch (e) {
      Alert.alert(isLogin ? t('login_title') : t('register_title'), e?.response?.data?.error || 'Hata');
    } finally { setBusy(false); }
  };

  const social = (p) => { if (!accepted) return needAccept(); Alert.alert(t('soon'), p); };

  return (
    <SafeAreaView style={s.safe}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={s.top}>
            <Text style={s.logo}>Yapio</Text>
            <Text style={s.tagline}>{t('tagline')}</Text>
          </View>

          <View style={s.card}>
            <Text style={s.cardTitle}>{isLogin ? t('login_title') : t('register_title')}</Text>

            <Text style={s.label}>{t('name')}</Text>
            <TextInput style={s.input} value={name} onChangeText={setName} placeholder={t('name_ph')} placeholderTextColor="#B0B0C0" returnKeyType="next" autoCapitalize="words" />
            <Text style={[s.label, { marginTop: 14 }]}>{t('password')}</Text>
            <TextInput style={s.input} value={password} onChangeText={setPassword} placeholder={isLogin ? t('password_ph_login') : t('password_ph_register')} placeholderTextColor="#B0B0C0" secureTextEntry returnKeyType="done" onSubmitEditing={submit} />

            <TouchableOpacity style={[s.primaryBtn, !accepted && s.disabled]} onPress={submit} disabled={busy}>
              {busy ? <ActivityIndicator color="#fff" /> : <Text style={s.primaryText}>{isLogin ? t('login_btn') : t('register_btn')}</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={s.switchRow} onPress={() => setMode(isLogin ? 'register' : 'login')} activeOpacity={0.7}>
              <Text style={s.switchText}>
                {isLogin ? t('no_account') : t('have_account')}
                <Text style={s.switchLink}>{isLogin ? t('register_link') : t('login_link')}</Text>
              </Text>
            </TouchableOpacity>

            <View style={s.divider}><View style={s.line} /><Text style={s.or}>{t('or')}</Text><View style={s.line} /></View>

            <TouchableOpacity style={[s.socialBtn, { backgroundColor: '#000' }, !accepted && s.disabled]} onPress={() => social('Apple')}>
              <Ionicons name="logo-apple" size={20} color="#fff" /><Text style={s.socialText}>{t('apple_login')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.socialBtn, { backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.border }, !accepted && s.disabled]} onPress={() => social('Google')}>
              <Ionicons name="logo-google" size={20} color={COLORS.text} /><Text style={[s.socialText, { color: COLORS.text }]}>{t('google_login')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.acceptRow} onPress={() => setAccepted((v) => !v)} activeOpacity={0.7}>
              <View style={[s.checkbox, accepted && s.checkboxOn]}>{accepted ? <Ionicons name="checkmark" size={15} color="#fff" /> : null}</View>
              <Text style={s.acceptText}>
                {t('accept_pre')}<Text style={s.acceptLink} onPress={() => router.push('/terms')}>{t('terms')}</Text>{t('accept_post')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 30 },
  top: { alignItems: 'center', marginBottom: 26 },
  logo: { fontSize: 54, fontWeight: '900', color: COLORS.primary, letterSpacing: -1 },
  tagline: { fontSize: 15, color: COLORS.muted, marginTop: 6 },
  card: { backgroundColor: COLORS.card, borderRadius: 20, padding: 22, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  cardTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '700', color: COLORS.muted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: '#F1F1F7', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, fontSize: 17, color: COLORS.text },
  primaryBtn: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 18 },
  primaryText: { color: '#fff', fontWeight: '800', fontSize: 17 },
  disabled: { opacity: 0.4 },
  switchRow: { alignItems: 'center', marginTop: 14 },
  switchText: { fontSize: 14, color: COLORS.muted },
  switchLink: { color: COLORS.primary, fontWeight: '800' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  line: { flex: 1, height: 1, backgroundColor: COLORS.border },
  or: { color: COLORS.muted, marginHorizontal: 12, fontSize: 13 },
  socialBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, paddingVertical: 15, marginBottom: 10 },
  socialText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  acceptRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 8 },
  checkbox: { width: 24, height: 24, borderRadius: 7, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  checkboxOn: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  acceptText: { flex: 1, fontSize: 13, color: COLORS.muted, lineHeight: 19 },
  acceptLink: { color: COLORS.primary, fontWeight: '700' },
});
