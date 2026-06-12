// Mini admin üye yönetimi: katılım kodu + HESAP AÇ (danışan/çalışan için kullanıcı adı+şifre),
// bekleyen istekler (onay/blok), aktif üyeler (çıkar).
import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getBusiness, getMembers, memberAction, createMember } from '../../src/api/client';
import { useLang } from '../../src/i18n';
import { COLORS, SIZES } from '../../src/theme';

export default function Members() {
  const router = useRouter();
  const { t } = useLang();
  const { id } = useLocalSearchParams();
  const [biz, setBiz] = useState(null);
  const [members, setMembers] = useState([]);
  const [uname, setUname] = useState('');
  const [display, setDisplay] = useState('');
  const [pass, setPass] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [b, m] = await Promise.all([getBusiness(id), getMembers(id)]);
      setBiz(b.business); setMembers(m);
    } catch (e) { console.warn(e?.message); }
  }, [id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const theme = biz?.theme_json?.color || COLORS.primary;
  const act = async (userId, action) => { await memberAction(id, userId, action); load(); };

  const createAccount = async () => {
    if (uname.trim().length < 2) return Alert.alert(t('username_label'), t('username_min'));
    if (pass.length < 4) return Alert.alert(t('password_label'), t('password_min'));
    setBusy(true);
    try {
      await createMember(id, uname.trim(), pass, display.trim());
      const u = uname.trim(); const p = pass;
      setUname(''); setDisplay(''); setPass('');
      await load();
      Alert.alert(t('account_created'), `${t('give_to_person')}\n\n${t('username_label')}: ${u}\n${t('password_label')}: ${p}\n\n${t('login_instr')}`);
    } catch (e) { Alert.alert(t('failed'), e?.response?.data?.error || t('account_create_fail')); }
    finally { setBusy(false); }
  };

  const pending = members.filter((m) => m.status === 'pending');
  const active = members.filter((m) => m.status === 'active');

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={COLORS.primary} /><Text style={s.back}>{t('back')}</Text>
        </TouchableOpacity>
      </View>
      {!biz ? <ActivityIndicator style={{ marginTop: 40 }} color={theme} /> : (
        <ScrollView contentContainerStyle={{ padding: SIZES.pad, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <Text style={s.title}>{t('users')}</Text>

          {/* Hesap aç — mini admin danışan/çalışan hesabı oluşturur */}
          <View style={s.createBox}>
            <Text style={s.createTitle}>{t('open_account')}</Text>
            <Text style={s.createHint}>{t('open_account_hint')}</Text>
            <TextInput style={s.input} value={uname} onChangeText={setUname} placeholder={t('username_ph')} placeholderTextColor="#B0B0C0" autoCapitalize="none" autoCorrect={false} />
            <TextInput style={s.input} value={display} onChangeText={setDisplay} placeholder={t('display_name_ph')} placeholderTextColor="#B0B0C0" />
            <TextInput style={s.input} value={pass} onChangeText={setPass} placeholder={t('password_min_ph')} placeholderTextColor="#B0B0C0" autoCapitalize="none" />
            <TouchableOpacity style={[s.createBtn, { backgroundColor: theme }]} onPress={createAccount} disabled={busy}>
              {busy ? <ActivityIndicator color="#fff" /> : <><Ionicons name="person-add" size={18} color="#fff" /><Text style={s.createBtnText}>{t('create_account')}</Text></>}
            </TouchableOpacity>
          </View>

          <View style={[s.codeBox, { backgroundColor: theme }]}>
            <Text style={s.codeLabel}>{t('join_code')}</Text>
            <Text style={s.code}>{biz.join_code || '—'}</Text>
            <Text style={s.codeHint}>{t('code_alt')}</Text>
          </View>

          <Text style={s.h}>{t('pending_requests')} ({pending.length})</Text>
          {pending.length === 0 && <Text style={s.empty}>{t('no_pending')}</Text>}
          {pending.map((m) => (
            <View key={m.id} style={s.row}>
              <View style={[s.avatar, { backgroundColor: theme }]}><Text style={s.avatarText}>{(m.user_name || '?')[0].toUpperCase()}</Text></View>
              <Text style={s.name}>{m.user_name || t('user')}</Text>
              <TouchableOpacity style={[s.mini, { backgroundColor: theme }]} onPress={() => act(m.user_id, 'approve')}><Text style={s.miniText}>{t('approve')}</Text></TouchableOpacity>
              <TouchableOpacity style={s.miniGhost} onPress={() => act(m.user_id, 'remove')}><Ionicons name="close" size={18} color={COLORS.danger} /></TouchableOpacity>
            </View>
          ))}

          <Text style={s.h}>{t('active_members')} ({active.length})</Text>
          {active.length === 0 && <Text style={s.empty}>{t('no_members')}</Text>}
          {active.map((m) => (
            <View key={m.id} style={s.row}>
              <View style={[s.avatar, { backgroundColor: theme }]}><Text style={s.avatarText}>{(m.user_name || '?')[0].toUpperCase()}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.name}>{m.user_name || t('user')}</Text>
                {m.username ? <Text style={s.uname}>@{m.username}{m.platform ? ` · ${m.platform}` : ''}</Text> : null}
              </View>
              <TouchableOpacity style={s.miniGhost} onPress={() => act(m.user_id, 'remove')}><Ionicons name="trash-outline" size={18} color={COLORS.danger} /></TouchableOpacity>
            </View>
          ))}
          <View style={{ height: 30 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingHorizontal: SIZES.pad, paddingVertical: 8 },
  backBtn: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' },
  back: { color: COLORS.primary, fontSize: 17, fontWeight: '600' },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.text, marginBottom: 14 },
  createBox: { backgroundColor: COLORS.card, borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: COLORS.border },
  createTitle: { fontSize: 17, fontWeight: '800', color: COLORS.text },
  createHint: { fontSize: 13, color: COLORS.muted, marginTop: 4, marginBottom: 12, lineHeight: 19 },
  input: { backgroundColor: '#F1F1F7', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: COLORS.text, marginBottom: 8 },
  createBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 12, paddingVertical: 14, marginTop: 2 },
  createBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  codeBox: { borderRadius: 16, padding: 18, alignItems: 'center' },
  codeLabel: { color: '#fff', opacity: 0.9, fontWeight: '600' },
  code: { color: '#fff', fontSize: 36, fontWeight: '900', letterSpacing: 4, marginVertical: 4 },
  codeHint: { color: '#fff', opacity: 0.9, fontSize: 12, textAlign: 'center' },
  h: { fontSize: 17, fontWeight: '800', color: COLORS.text, marginTop: 20, marginBottom: 10 },
  empty: { color: COLORS.muted },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  name: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  uname: { fontSize: 12, color: COLORS.muted, marginTop: 1 },
  mini: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 9 },
  miniText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  miniGhost: { padding: 8 },
});
